import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import { admin, organization } from 'better-auth/plugins';
import { ac, roles } from '@convex/authPermissions';
import {
  type AuthFunctions,
  createClient,
  createApi,
} from 'better-auth-convex';

import { api, internal } from './_generated/api';
import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  type GenericCtx,
} from './_generated/server';
import { entsTableFactory } from 'convex-ents';
import schema, { entDefinitions } from './schema';
import { createPersonalOrganization } from './organizationHelpers';
import { getEnv } from './helpers/getEnv';
import { DataModel } from '@convex/_generated/dataModel';
import { ConvexError } from 'convex/values';

const authFunctions: AuthFunctions = internal.auth;

export const authClient = createClient<DataModel, typeof schema>({
  authFunctions,
  schema,
  triggers: {
    user: {
      beforeCreate: async (ctx, data: any) => {
        const env = getEnv();
        const adminEmails = env.ADMIN;

        // Check if this user email is in the admin list and update role
        const role =
          data.role !== 'admin' && adminEmails?.includes(data.email)
            ? 'admin'
            : data.role;

        return {
          ...data,
          role,
        };
      },
      onCreate: async (ctx, user) => {
        // Create personal organization for the new user
        await createPersonalOrganization(ctx, {
          email: user.email,
          image: user.image || null,
          name: user.name,
          userId: user._id,
        });

        // Create Polar customer for the new user
        // await ctx.scheduler.runAfter(0, internal.polar.customer.createCustomer, {
        //   userId: args.userId,
        //   email: user.email,
        //   name: user.name,
        //   userId: user.userId,
        // });
      },
    },
    session: {
      onCreate: async (ctx, session) => {
        const table = entsTableFactory(ctx, entDefinitions);

        if (!session.activeOrganizationId) {
          const user = await table('user').getX(session.userId);

          await table('session')
            .getX(session._id)
            .patch({
              activeOrganizationId:
                user.lastActiveOrganizationId || user.personalOrganizationId,
            });
        }
      },
    },
    invitation: {
      onCreate: async (ctx, invitation) => {
        // Send invitation email when a new invitation is created
        const table = entsTableFactory(ctx, entDefinitions);

        // Get organization details
        const organization = await table('organization').get(
          invitation.organizationId
        );
        if (!organization) {
          throw new ConvexError({
            code: 'NOT_FOUND',
            message: 'Organization not found',
          });
        }

        // Get inviter user details
        const inviterUser = await table('user').get(invitation.inviterId);
        if (!inviterUser) return;

        // Schedule email sending
        await ctx.scheduler.runAfter(
          0,
          api.emails.sendOrganizationInviteEmail,
          {
            acceptUrl: `${process.env.NEXT_PUBLIC_SITE_URL!}/w/${organization.slug}?invite=${invitation._id}`,
            invitationId: invitation._id as string,
            inviterEmail: inviterUser?.email,
            inviterName: inviterUser?.name || 'Team Admin',
            organizationName: organization.name,
            role: invitation.role || 'member',
            to: invitation.email,
          }
        );
      },
    },
  },
});

export const createAuth = (ctx: GenericCtx, { optionsOnly = false } = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL!;

  return betterAuth({
    account: {
      accountLinking: {
        enabled: true,
        updateUserInfoOnLink: true,
        trustedProviders: ['google', 'github'],
      },
    },
    baseURL,
    logger: { disabled: optionsOnly },
    plugins: [
      admin(),
      organization({
        ac,
        roles,
        allowUserToCreateOrganization: true, // Will gate with
        creatorRole: 'owner',
        invitationExpiresIn: 24 * 60 * 60 * 7, // 7 days
        membershipLimit: 100,
        organizationLimit: 3,
        schema: {
          organization: {
            additionalFields: {
              monthlyCredits: {
                required: true,
                type: 'number',
              },
            },
          },
        },
        // Email sending is handled via invitation.onCreate trigger
        sendInvitationEmail: async (data, request) => {
          // Skip - handled by trigger to avoid ctx closure issues
          return;
        },
      }),
      convex(),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 1, // 1 days
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        mapProfileToUser: async (profile) => {
          return {
            // Better Auth standard fields
            email: profile.email,
            image: profile.avatar_url,
            name: profile.name || profile.login,
            // Additional fields that will be available in onCreateUser
            bio: profile.bio || undefined,
            firstName: profile.name?.split(' ')[0] || undefined,
            github: profile.login,
            lastName: profile.name?.split(' ').slice(1).join(' ') || undefined,
            location: profile.location || undefined,
            username: profile.login,
            x: profile.twitter_username || undefined,
          };
        },
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        mapProfileToUser: async (profile) => {
          return {
            // Better Auth standard fields
            email: profile.email,
            image: profile.picture,
            name: profile.name,
            // Additional fields that will be available in onCreateUser
            firstName: profile.given_name || undefined,
            lastName: profile.family_name || undefined,
          };
        },
      },
    },
    telemetry: { enabled: false },
    user: {
      additionalFields: {
        bio: {
          required: false,
          type: 'string',
        },
        firstName: {
          required: false,
          type: 'string',
        },
        github: {
          required: false,
          type: 'string',
        },
        lastName: {
          required: false,
          type: 'string',
        },
        linkedin: {
          required: false,
          type: 'string',
        },
        location: {
          required: false,
          type: 'string',
        },
        username: {
          required: false,
          type: 'string',
        },
        website: {
          required: false,
          type: 'string',
        },
        x: {
          required: false,
          type: 'string',
        },
      },
      changeEmail: {
        enabled: false,
      },
      deleteUser: {
        enabled: false,
      },
    },
    database: authClient.httpAdapter(ctx),
  });
};

export const auth = createAuth(null as any, { optionsOnly: true });

export const getAuth = <Ctx extends QueryCtx | MutationCtx>(ctx: Ctx) => {
  return betterAuth({
    ...auth.options,
    database: authClient.adapter(ctx, auth.options),
  });
};

export const {
  create,
  deleteMany,
  deleteOne,
  findMany,
  findOne,
  updateMany,
  updateOne,
} = createApi(schema, auth.options);

export const {
  beforeCreate,
  beforeDelete,
  beforeUpdate,
  onCreate,
  onDelete,
  onUpdate,
} = authClient.triggersApi();
