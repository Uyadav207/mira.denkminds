interface User {
	firstname: string;
	lastname: string;
	email: string;
	// Add other user properties as needed
}

export type UserState = {
	user: User | null; // User could initially be null
	setUser: (user: User) => void;
	logout: () => void;
};
