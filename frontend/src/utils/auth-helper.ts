import type {
	GoogleLoginApiPayloadType,
	LoginApiPayloadType,
	RegisterApiPayloadType,
} from "../types/auth";

export function splitName(fullName: string): {
	firstName: string;
	lastName: string;
} {
	const nameParts = fullName.trim().split(" ");
	if (nameParts.length === 1) {
		return { firstName: nameParts[0], lastName: "" };
	}
	const lastName = nameParts.pop() || "";
	const firstName = nameParts.join(" ");
	return { firstName, lastName };
}

export function createRegisterResponseBody(data) {
	const { firstName, lastName } = splitName(data.full_name);
	const requestBody: RegisterApiPayloadType = {
		firstName: firstName,
		lastName: lastName,
		username: data.name,
		email: data.email,
		authProvider: "google",
		supabaseId: data.provider_id,
		avatar: data.avatar_url,
		password: null,
	};
	return requestBody;
}

export function createGoogleLoginResponseBody(data) {
	const { firstName, lastName } = splitName(data.full_name);
	const requestBody: GoogleLoginApiPayloadType = {
		firstName: firstName,
		lastName: lastName,
		username: data.name,
		email: data.email,
		authProvider: "google",
		supabaseId: data.provider_id,
		avatar: data.avatar_url,
		password: null,
	};
	return requestBody;
}

export function createLoginResponseBody(data) {
	const requestBody: LoginApiPayloadType = {
		email: data.email,
		password: data.password,
		authProvider: null,
	};
	return requestBody;
}
