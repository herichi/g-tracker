
export type UserRole = 
  | 'admin'
  | 'project_manager'
  | 'data_entry'
  | 'production_engineer'
  | 'qc_factory'
  | 'store_site'
  | 'qc_site'
  | 'foreman_site'
  | 'site_engineer';

export interface User {
  id: string;
  Email: string;
  full_name: string | null;
  role: UserRole;
  active: boolean;
  last_sign_in_at: string | null;
  username?: string;
  avatar_url?: string;
  updated_at?: string;
}
