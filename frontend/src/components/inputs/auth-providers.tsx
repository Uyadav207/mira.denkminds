import { useState } from "react";
import { supabase } from "@/lib/supabase";

import useStore from "@/store/store";

import GoogleIcon from "@/assets/GoogleIcon.svg";

import { Button } from "@/components/ui/button";

const AuthByProviders: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { setUser } = useStore();

	const signInWithGoogle = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
			});
			if (error) {
				throw error;
			}
			if (data.user) {
				setUser(data.user);
			}
		} catch (error) {
			console.error("Error signing in with Google", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
			<Button
				variant="outline"
				disabled={isLoading}
				onClick={signInWithGoogle}
				className="w-full"
			>
				<img src={GoogleIcon} alt="Google Icon" className="mr-2 h-4 w-4" />
				Google
			</Button>
		</div>
	);
};

export default AuthByProviders;

