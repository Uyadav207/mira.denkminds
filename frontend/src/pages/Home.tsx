'use client'

import { ModeToggle } from "../components/theme/mode-toggle"
import { Button } from "../components/ui/button"
import { DisplayToaster } from "../components/toaster"
import { Card, CardContent } from "../components/ui/card"
import { Link } from "react-router-dom"

export function Home() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="p-4 flex justify-between items-center">
				<h1 className="text-2xl font-bold">AI Security Assessment</h1>
				<ModeToggle />
			</header>
			<DisplayToaster />
			<main className="flex-grow flex items-center justify-center p-4">
				<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
					<Card className="w-64">
						<CardContent className="p-4">
							<p className="text-center mb-4">Already a member?</p>
							<Button asChild className="w-full mb-2">
								<a href="/login">
									Login
								</a>
							</Button>
							<Button asChild className="w-full" >
								<a href="/register">
									Register
								</a>
							</Button>
						</CardContent>
					</Card>

					<div className="text-center">
						<div className="w-32 h-32 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-4xl">🤖</span>
						</div>
						<p className="text-xl font-semibold">Hi there!</p>
					</div>

					<Card className="w-64">
						<CardContent className="p-4">
							<p className="text-center mb-4">Want to change the chatbot?</p>
							<Button className="w-full">
								Change Chatbot
							</Button>
						</CardContent>
					</Card>
				</div>
			</main>
			<footer className="p-4 text-center text-sm text-muted-foreground">
				Optional footer section
			</footer>
		</div>
	)
}

