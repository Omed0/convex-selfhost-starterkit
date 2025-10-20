import { asyncMap } from 'convex-helpers';
import { entsTableFactory } from 'convex-ents';

import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import type { AuthCtx } from '@convex/functions';

import { entDefinitions } from './schema';

export const listUserOrganizations = async (
  ctx: AuthCtx,
  userId: Id<'user'>
) => {
  const memberships = await ctx.table('member', 'userId', (q) =>
    q.eq('userId', userId)
  );

  if (!memberships.length) {
    return [];
  }

  return asyncMap(memberships, async (membership) => {
    const org = await membership.edgeX('organization');

    return {
      ...org.doc(),
      _creationTime: org._creationTime,
      _id: org._id,
      role: membership.role || 'member',
    };
  });
};

export const createPersonalOrganization = async (
  ctx: MutationCtx,
  args: {
    email: string;
    image: string | null;
    name: string;
    userId: Id<'user'>;
  }
) => {
  const table = entsTableFactory(ctx, entDefinitions);
  // Check if user already has any organizations
  const user = await table('user').getX(args.userId);

  if (user.personalOrganizationId) {
    return null;
  }

  // Generate unique slug for personal org
  const slug = `personal-${args.userId.slice(-8)}`;

  const orgId = await table('organization').insert({
    logo: args.image || undefined,
    monthlyCredits: 0,
    name: `${args.name}'s Organization`,
    slug,
    createdAt: Date.now(),
  });
  await table('member').insert({
    createdAt: Date.now(),
    role: 'owner',
    organizationId: orgId,
    userId: args.userId,
  });

  // Update the user's last active organization and personal organization ID for future sessions
  await table('user').getX(args.userId).patch({
    lastActiveOrganizationId: orgId,
    personalOrganizationId: orgId,
  });

  return {
    id: orgId,
    slug: slug,
  };
};
