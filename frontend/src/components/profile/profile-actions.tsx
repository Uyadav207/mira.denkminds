import type { ProfileValues } from "./constants";
import type { UseFormReturn } from "react-hook-form";
import { userApis } from "@api/profile-settings";
import { showErrorToast, showSuccessToast } from "@components/toaster";
import type { UpdateUserResponse } from "../../types/user";
import useStore from "../../store/store";

export const handleFileChange = (
	e: React.ChangeEvent<HTMLInputElement>,
	form: UseFormReturn<ProfileValues>,
	setImageSrc: React.Dispatch<React.SetStateAction<string | null>>,
	setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>,
) => {
	const file = e.target.files?.[0];
	if (file) {
		// Convert the image file to Base64 string
		const reader = new FileReader();
		reader.onloadend = () => {
			// After reading the file, get the Base64 string
			const base64String = reader.result as string;

			// Set the selected file in the form
			form.setValue("avatar", file);

			// Set the Base64 string as the image source for the preview
			setImageSrc(base64String);
			setUploadedFile(file);

			// Store the Base64 string in localStorage for persistence
			localStorage.setItem("avatar", base64String);

			// Trigger validation for the avatar field
			form.trigger("avatar");
		};
		reader.readAsDataURL(file); // Convert the file to Base64 string
	} else {
		// If no file is selected, reset the image and clear the avatar in localStorage
		form.setValue("avatar", null);
		setImageSrc(null);
		setUploadedFile(null);
		localStorage.removeItem("avatar");
	}
};

export const handleSubmit = async (
	data: ProfileValues,
	uploadedFile: File | null,
	params: { userId: string },
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const token = useStore.getState().token;
	setIsLoading(true);
	try {
		const { userId } = params;
		const userData = {
			...data,
			avatar: uploadedFile ? uploadedFile.name : "",
		};

		const formData = new FormData();
		if (uploadedFile) {
			formData.append("avatar", uploadedFile);
		}

		// Make API call to update user
		const response = await userApis.updateUserById(userId, userData, token);
		const result: UpdateUserResponse = response.data; // Extract the data
		useStore.getState().setUser(result);
		showSuccessToast("User details updated successfully!");
	} catch (error: unknown) {
		if (error instanceof Error) {
			showErrorToast(`An error occurred: ${error.message}`);
		} else {
			showErrorToast("An unknown error occurred.");
		}
	} finally {
		setIsLoading(false);
	}
};

export const handleDelete = async (params: { userId: string }) => {
	try {
		const { userId } = params;
		const token = useStore.getState().token;

		// Make API call to delete user
		const response = await userApis.deleteUserByID(userId, token);
		showSuccessToast("User Account Deleted Successfully!");
		setTimeout(() => {
			useStore.getState().logout();
			window.location.href = "/login";
		}, 2000);
	} catch (error: unknown) {
		if (error instanceof Error) {
			showErrorToast(`An error occurred: ${error.message}`);
		} else {
			showErrorToast("An unknown error occurred.");
		}
	} finally {
	}
};
