export interface CsnisUser {
	id: string;
	email: string;
	name?: string;
	role?: string;
	roles?: string[];
	isAdmin?: boolean;
}
