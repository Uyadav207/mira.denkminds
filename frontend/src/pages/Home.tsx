import { ModeToggle } from "../components/theme/mode-toggle";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "../components/ui/card";

export function Home() {
	return (
		<div className="flex flex-col min-h-screen">
			<ModeToggle />
			<main className="w-full h-full flex items-center justify-center">
				<div className="w-1/2 flex flex-col">
					<h1 className="text-4xl text-center font-bold mb-4">
						AI based security Assessment
					</h1>
					<p className="text-lg text-muted-foreground mb-6 text-center">
						This is a standard home page for our Project setup using
						Vite React TypeScript project with shadcn/ui.
					</p>
					<Button className="w-1/4 mx-auto" asChild>
						<a
							href="https://denkminds.vercel.app/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center"
						>
							Visit denkMinds
						</a>
					</Button>
				</div>
			</main>
		</div>
	);
}
