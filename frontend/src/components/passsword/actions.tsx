import bcrypt from "bcryptjs";
import { showErrorToast, showSuccessToast } from "@components/toaster";
import { userApis } from "@api/profile-settings";
import useStore from "../../store/store";
import type { UseFormReturn } from "react-hook-form";

const user = useStore.getState().user;
const token = useStore.getState().token;

export type PasswordValues = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};
type PasswordVisibility = {
	currentPassword: boolean;
	newPassword: boolean;
	confirmPassword: boolean;
};

export const handleVisibilityToggle = (
	field: keyof PasswordVisibility,
	passwordVisibility: PasswordVisibility,
	setPasswordVisibility: React.Dispatch<
		React.SetStateAction<PasswordVisibility>
	>,
) => {
	setPasswordVisibility((prevState) => ({
		...prevState,
		[field]: !prevState[field],
	}));
};

export const comparePasswords = async (
	enteredPassword: string,
	storedHash: string,
) => {
	return await bcrypt.compare(enteredPassword, storedHash);
};

export const handleSubmit = async (
	data: PasswordValues,
	form: UseFormReturn<PasswordValues>,
	setPasswordVisibility: React.Dispatch<
		React.SetStateAction<PasswordVisibility>
	>,
) => {
	if (user && token) {
		try {
			const response = await userApis.getUserByID(user.id, token);
			const storedHashedPassword = response.data.password;

			const isPasswordValid = await comparePasswords(
				data.currentPassword,
				storedHashedPassword,
			);

			if (isPasswordValid) {
				const payload = {
					oldPassword: data.currentPassword,
					newPassword: data.newPassword,
				};

				await userApis.changeUserPassword(user.id, payload, token);
				showSuccessToast("Password changed successfully!");
				form.reset();
			} else {
				form.setError("currentPassword", {
					type: "manual",
					message: "Current password is incorrect",
				});
			}
		} catch (error) {
			showErrorToast("An unknown error occurred.", error);
		}
	}
};
