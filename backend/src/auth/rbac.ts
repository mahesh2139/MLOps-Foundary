import type { Role } from './types';

const rank: Record<Role, number> = {
  sponsor: 10,
  ml_engineer: 20,
  data_engineer: 30,
  monitoring: 40,
  prod_engineer: 50,
  admin: 100,
};

export function canAccess(userRole: Role, minRole: Role): boolean {
  return rank[userRole] >= rank[minRole];
}

