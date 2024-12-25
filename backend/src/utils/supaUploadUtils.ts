import supabase from "../config/supabase";

export const uploadFileToSupabase = async (file: string, fileName: string) => {
	const { error } = await supabase.storage
		.from("reports")
		.upload(fileName, file, {
			upsert: true,
			contentType: "application/pdf",
		});

	if (error) {
		throw new Error(`File upload failed: ${error.message}`);
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("reports").getPublicUrl(fileName);

	return publicUrl;
};
