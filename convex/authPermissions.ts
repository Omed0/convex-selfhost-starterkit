import { createAccessControl } from 'better-auth/plugins/access';
import {
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

// Define access control statements for resources
const statement = {
  ...defaultStatements,
  projects: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

const member = ac.newRole({
  ...memberAc.statements,
  projects: ['create', 'update'],
});

const owner = ac.newRole({
  ...ownerAc.statements,
  projects: ['create', 'update', 'delete'],
});

export const roles = { member, owner };
