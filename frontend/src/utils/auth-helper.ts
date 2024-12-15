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

interface RegisterResponseBodyData {
	full_name: string;
	name: string;
	email: string;
	provider_id: string;
	avatar_url: string;
}

export function createRegisterResponseBody(
	data: RegisterResponseBodyData,
): RegisterApiPayloadType {
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

interface GoogleLoginResponseBodyData {
	full_name: string;
	name: string;
	email: string;
	provider_id: string;
	avatar_url: string;
}

export function createGoogleLoginResponseBody(
	data: GoogleLoginResponseBodyData,
): GoogleLoginApiPayloadType {
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

interface LoginResponseBodyData {
	email: string;
	password: string;
}

export function createLoginResponseBody(
	data: LoginResponseBodyData,
): LoginApiPayloadType {
	const requestBody: LoginApiPayloadType = {
		email: data.email,
		password: data.password,
		authProvider: null,
	};
	return requestBody;
}
