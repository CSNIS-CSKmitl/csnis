import type { UserRole } from './role';

export interface CsnisUser {
	id: string;
	email: string;
	name?: string;
	role?: UserRole;
	roles?: string[];
	isAdmin?: boolean;
}
