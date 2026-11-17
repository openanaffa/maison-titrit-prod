/** Customer account shapes. */

export type CompteUser = {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	role: string;
};
