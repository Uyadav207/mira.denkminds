export type LoginApiPayloadType = {
	email: string;
	password: string;
};

export interface AuthResponse {
	user: {
		id: string;
		username: string;
		firstName: string;
		lastName: string;
		avatar: string | null;
		email: string;
		password: string;
		createdAt: string;
		updatedAt: string;
	};
	token: string;
}

export interface SignUpApiPayloadType {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
}
