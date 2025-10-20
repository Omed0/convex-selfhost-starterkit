import { z } from 'zod';
import { zid } from 'convex-helpers/server/zod';
import { ConvexError } from 'convex/values';
import { createAuthMutation, createAuthQuery } from './functions';

// List user's tags with usage count
export const list = createAuthQuery()({
  args: {},
  returns: z.array(
    z.object({
      _id: zid('tags'),
      _creationTime: z.number(),
      name: z.string(),
      color: z.string(),
      usageCount: z.number(),
    })
  ),
  handler: async (ctx) => {
    const tags = await ctx
      .table('tags', 'createdBy', (q) => q.eq('createdBy', ctx.user._id))
      .order('asc');

    return await Promise.all(
      tags.map(async (tag) => ({
        ...tag.doc(),
        usageCount: (await tag.edge('todos')).length,
      }))
    );
  },
});

// Create a new tag
export const create = createAuthMutation({
  rateLimit: 'tag/create',
})({
  args: {
    name: z.string().min(1).max(50),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
  },
  returns: zid('tags'),
  handler: async (ctx, args) => {
    // Check if tag with same name already exists for this user
    const existingTag = await ctx
      .table('tags', 'createdBy', (q) => q.eq('createdBy', ctx.user._id))
      .filter((q) => q.eq(q.field('name'), args.name))
      .first();

    if (existingTag) {
      throw new ConvexError({
        code: 'DUPLICATE_TAG',
        message: 'A tag with this name already exists',
      });
    }

    const tagId = await ctx.table('tags').insert({
      name: args.name,
      color: args.color || generateRandomColor(),
      createdBy: ctx.user._id,
    });

    return tagId;
  },
});

// Update tag name or color
export const update = createAuthMutation({
  rateLimit: 'tag/update',
})({
  args: {
    tagId: zid('tags'),
    name: z.string().min(1).max(50).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const tag = await ctx.table('tags').getX(args.tagId);

    if (tag.createdBy !== ctx.user._id) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Tag not found',
      });
    }

    // Check for duplicate name if updating name
    if (args.name && args.name !== tag.name) {
      const existingTag = await ctx
        .table('tags', 'createdBy', (q) => q.eq('createdBy', ctx.user._id))
        .filter((q) => q.eq(q.field('name'), args.name))
        .first();

      if (existingTag) {
        throw new ConvexError({
          code: 'DUPLICATE_TAG',
          message: 'A tag with this name already exists',
        });
      }
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;

    if (Object.keys(updates).length > 0) {
      await ctx.table('tags').getX(args.tagId).patch(updates);
    }

    return null;
  },
});

// Delete a tag (removes from all todos)
export const deleteTag = createAuthMutation({
  rateLimit: 'tag/delete',
})({
  args: {
    tagId: zid('tags'),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    const tag = await ctx.table('tags').getX(args.tagId);

    if (tag.createdBy !== ctx.user._id) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Tag not found',
      });
    }

    // Delete the tag - Convex Ents will handle removing from todos automatically
    await ctx.table('tags').getX(args.tagId).delete();

    return null;
  },
});

// Merge two tags
export const merge = createAuthMutation({
  rateLimit: 'tag/update', // Using update rate limit for merge
})({
  args: {
    sourceTagId: zid('tags'),
    targetTagId: zid('tags'),
  },
  returns: z.null(),
  handler: async (ctx, args) => {
    if (args.sourceTagId === args.targetTagId) {
      throw new ConvexError({
        code: 'INVALID_OPERATION',
        message: 'Cannot merge a tag with itself',
      });
    }

    const sourceTag = await ctx.table('tags').getX(args.sourceTagId);
    const targetTag = await ctx.table('tags').getX(args.targetTagId);

    if (sourceTag.createdBy !== ctx.user._id) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Source tag not found',
      });
    }

    if (targetTag.createdBy !== ctx.user._id) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Target tag not found',
      });
    }

    // Get all todos with source tag
    const todosWithSourceTag = await sourceTag.edge('todos');

    // Add target tag to todos that have source tag (avoiding duplicates)
    for (const todo of todosWithSourceTag) {
      const currentTags = await todo.edge('tags').map((t) => t._id);
      if (!currentTags.includes(args.targetTagId)) {
        await ctx
          .table('todos')
          .getX(todo._id)
          .patch({
            tags: { add: [args.targetTagId] },
          });
      }
    }

    // Delete source tag
    await ctx.table('tags').getX(args.sourceTagId).delete();

    return null;
  },
});

// Get most popular tags across all users
export const popular = createAuthQuery()({
  args: {
    limit: z.number().min(1).max(50).optional(),
  },
  returns: z.array(
    z.object({
      _id: zid('tags'),
      name: z.string(),
      color: z.string(),
      usageCount: z.number(),
      isOwn: z.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all tags with usage counts
    const allTags = await ctx.table('tags').take(100);

    const tagsWithCounts = await Promise.all(
      allTags.map(async (tag) => ({
        ...tag.doc(),
        usageCount: (await tag.edge('todos')).length,
        isOwn: tag.createdBy === ctx.user._id,
      }))
    );

    // Sort by usage count and return top N
    return tagsWithCounts
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },
});

// Helper function to generate random hex color
function generateRandomColor(): string {
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
