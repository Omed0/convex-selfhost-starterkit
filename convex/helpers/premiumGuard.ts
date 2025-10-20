import { ConvexError } from 'convex/values';

import type { SessionUser } from '@convex/authHelpers';

export function premiumGuard(user: { plan?: SessionUser['plan'] }) {
  if (!user.plan) {
    throw new ConvexError({
      code: 'PREMIUM_REQUIRED',
      message: 'Premium subscription required',
    });
  }
}
