import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { showErrorToast, showSuccessToast } from "../toaster";
import useStore from "../../store/store";
import { BASE_URL } from "../../api/config.backend";

const plans = [
	{
		name: "Free Trial",
		price: "€0",
		description: "Perfect for trying out our services",
		features: ["Basic feature set", "3 Chats", "Limited Support"],
		cta: "Start Free Trial",
		planKey: "free",
	},
	{
		name: "Intermediate",
		price: "€10",
		description: "Great for small teams and growing businesses",
		features: [
			"All Free Trial features",
			"Limited Chat using GPT 3.5 Turbo",
			"Priority email support",
			"Advanced Cyber Security LLM",
		],
		cta: "Upgrade to Intermediate",
		planKey: "intermediate",
	},
	{
		name: "Professional",
		price: "$39.99",
		description: "For larger teams with advanced needs",
		features: [
			"All Intermediate features",
			"Unlimited Chats",
			"24/7 phone support",
			"Custom integrations",
			"Expert Cyber Security LLM",
		],
		cta: "Get Pro",
		planKey: "pro",
	},
];

export default function Subscription() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const { user, setUser } = useStore();

	// Check if there's a session ID in the URL after Stripe redirects to the success URL
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const sessionId = urlParams.get("session_id");
		const plan = localStorage.getItem("plan_key");
		if (sessionId && plan) {
			if (user?.id) {
				handlePaymentSuccess(sessionId, Number.parseInt(user.id), plan);
			} else {
				showErrorToast("User ID is missing.");
			}
		}
	}, [user?.id]);

	const handleCheckout = async (planKey: string) => {
		setLoading(true);
		setMessage(""); // Reset message
		localStorage.setItem("plan_key", planKey);
		try {
			const response = await fetch(
				`${BASE_URL}/subscription/api/payment`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ plan: planKey }),
				},
			);

			const data = await response.json();
			if (data.url) {
				// Redirect to Stripe Checkout
				window.location.href = data.url;
			} else {
				showErrorToast("Unable to process payment. Please try again.");
			}
		} catch (error) {
			throw new Error(String(error));
		} finally {
			setLoading(false);
		}
	};

	// After successful payment, check the session status and redirect to chatbot
	const handlePaymentSuccess = async (
		sessionId: string,
		userId: number,
		plan: string,
	) => {
		try {
			const response = await fetch(
				`${BASE_URL}/subscription/api/payment/success?session_id=${sessionId}&user_id=${userId}&plan=${plan}`,
				{
					method: "GET",
				},
			);
			const data = await response.json();
			if (data.message) {
				setMessage(data.message);
				setUser(data.user);
				window.location.href = "/chatbot";
				showSuccessToast(data.message);
			} else {
				showErrorToast(data.error);
			}
		} catch (error) {
			throw new Error(String(error));
		}
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-center mb-12">
				Choose Your Plan
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{plans.map((plan, index) => (
					<Card
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						className={`flex flex-col ${index === 1 ? "md:scale-105" : ""} hover:shadow-lg transition-all duration-300`}
					>
						<CardHeader>
							<CardTitle className="text-2xl font-bold">
								{plan.name}
							</CardTitle>
							<CardDescription className="text-xl font-semibold">
								{plan.price}/month
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-grow">
							<p className="text-muted-foreground mb-4">
								{plan.description}
							</p>
							<ul className="space-y-2">
								{plan.features.map((feature, featureIndex) => (
									<li
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={featureIndex}
										className="flex items-center"
									>
										<Check className="mr-2 h-4 w-4 text-green-500" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								variant={index === 1 ? "default" : "outline"}
								onClick={() => handleCheckout(plan.planKey)}
								disabled={loading}
							>
								{loading ? "Processing..." : plan.cta}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			{/* Show success message */}
			{message && (
				<div className="mt-4 text-center text-lg font-bold">
					{message}
				</div>
			)}
		</div>
	);
}
