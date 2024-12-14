import type { RegisterApiPayloadType } from "../types/auth";


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
        password: null
	};
	return requestBody;
}
