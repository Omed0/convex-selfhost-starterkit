import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import {
  createAuthMutation,
  createPublicQuery,
} from './functions';
import { updateSettingsSchema } from './userShared';

// Check if user is authenticated
export const getIsAuthenticated = createPublicQuery({
  publicOnly: true,
})({
  returns: z.boolean(),
  handler: async (ctx) => {
    return !!(await ctx.auth.getUserIdentity());
  },
});

// Get session user (minimal data)
export const getSessionUser = createPublicQuery()({
  returns: z.union([
    z.object({
      id: zid('user'),
      activeOrganization: z
        .object({
          id: zid('organization'),
          logo: z.string().nullish(),
          name: z.string(),
          role: z.string(),
          slug: z.string(),
        })
        .nullable(),
      image: z.string().nullish(),
      isAdmin: z.boolean(),
      name: z.string().optional(),
      personalOrganizationId: zid('organization').optional(),
      plan: z.string().optional(),
    }),
    z.null(),
  ]),
  handler: async ({ user: userEnt }) => {
    if (!userEnt) {
      return null;
    }

    const { doc, edge, edgeX, ...user } = userEnt;

    return {
      id: user.id,
      activeOrganization: user.activeOrganization,
      image: user.image,
      isAdmin: user.isAdmin,
      name: user.name,
      plan: user.plan,
      personalOrganizationId: user.personalOrganizationId,
    };
  },
});

// Get full user data for the authenticated user
export const getCurrentUser = createPublicQuery()({
  returns: z.union([
    z.object({
      id: zid('user'),
      activeOrganization: z
        .object({
          id: zid('organization'),
          logo: z.string().nullish(),
          name: z.string(),
          role: z.string(),
          slug: z.string(),
        })
        .nullable(),
      image: z.string().nullish(),
      isAdmin: z.boolean(),
      name: z.string().optional(),
      personalOrganizationId: zid('organization').optional(),
      plan: z.string().optional(),
    }),
    z.null(),
  ]),
  handler: async (ctx) => {
    const { user } = ctx;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      activeOrganization: user.activeOrganization,
      image: user.image,
      isAdmin: user.isAdmin,
      name: user.name,
      plan: user.plan,
      personalOrganizationId: user.personalOrganizationId,
    };
  },
});

// Update user settings
export const updateSettings = createAuthMutation()({
  args: updateSettingsSchema,
  returns: z.object({ success: z.boolean() }),
  handler: async (ctx, args) => {
    const { user } = ctx;
    const { bio, name } = args;

    // Build update object
    const updateData: Record<string, any> = {};

    if (bio !== undefined) updateData.bio = bio;
    if (name !== undefined) updateData.name = name;

    await user.patch(updateData);

    return { success: true };
  },
});
