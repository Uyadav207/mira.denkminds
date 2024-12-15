import axios from "axios";
import config from "../../config.json";

const apiClient = axios.create({
	baseURL: config.baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

interface AuthResponse {
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

interface ApiError {
	message: string;
}

async function handleResponse<T>(
	promise: Promise<{ data: T }>,
): Promise<T | undefined> {
	try {
		const { data } = await promise;
		return data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const apiError: ApiError = error.response.data;
			throw new Error(apiError.message || "An error occurred");
		}
		// else {
		// 	throw new Error(error.message || "An unexpected error occurred");
		// }
	}
}

export async function login(
	email: string,
	password: string,
): Promise<AuthResponse> {
	const response = await handleResponse<AuthResponse>(
		apiClient.post(config.apis.postLoginUser, { email, password }),
	);
	if (!response) {
		throw new Error("Failed to login, no response received.");
	}

	return response;
}

export async function register(
	firstName: string,
	lastName: string,
	username: string,
	email: string,
	password: string,
): Promise<AuthResponse> {
	const response = await handleResponse<AuthResponse>(
		apiClient.post(config.apis.postRegisterUser, {
			firstName,
			lastName,
			username,
			email,
			password,
		}),
	);

	if (!response) {
		throw new Error("Failed to register, no response received.");
	}

	return response;
}
