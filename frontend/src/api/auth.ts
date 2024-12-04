import axiosInstance from "./axios";

import type { LoginApiPayloadType, SignUpApiPayloadType } from "../types/auth";

//login api
const login = (payload: LoginApiPayloadType) =>
	axiosInstance.post("/auth/login", payload);

//signup api
const signUp = (payload: SignUpApiPayloadType) =>
	axiosInstance.post("/auth/register", payload);

export const authApis = {
	login,
	signUp,
};
