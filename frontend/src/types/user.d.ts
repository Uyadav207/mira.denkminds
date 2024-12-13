interface User {
	firstName: string;
	lastName: string;
	email: string;
	avatar: string;
	username: string;
	// Add other user properties as needed
}

export type UserState = {
	user: User | null; // User could initially be null
	token: string | null;
	setUser: (user: User) => void;
	setToken: (token: string) => void;
	logout: () => void;
};
