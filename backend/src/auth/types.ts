export type Role =
  | 'ml_engineer'
  | 'data_engineer'
  | 'prod_engineer'
  | 'monitoring'
  | 'sponsor'
  | 'admin';

export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
  role: Role;
}

