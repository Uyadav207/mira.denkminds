import { Check } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

const plans = [
	{
		name: "Free Trial",
		price: "€0",
		description: "Perfect for trying out our services",
		features: [
			"Basic feature set",
			"1 user",
			"500MB storage",
			"Email support",
		],
		cta: "Start Free Trial",
	},
	{
		name: "Intermediate",
		price: "€10",
		description: "Great for small teams and growing businesses",
		features: [
			"All Free Trial features",
			"Up to 5 users",
			"5GB storage",
			"Priority email support",
			"Advanced analytics",
		],
		cta: "Upgrade to Intermediate",
	},
	{
		name: "Advanced",
		price: "$50",
		description: "For larger teams with advanced needs",
		features: [
			"All Intermediate features",
			"Unlimited users",
			"50GB storage",
			"24/7 phone support",
			"Custom integrations",
			"Dedicated account manager",
		],
		cta: "Get Advanced",
	},
];

export default function Subscription() {
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
							>
								{plan.cta}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
