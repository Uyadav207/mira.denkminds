'use client'

import { useState } from 'react'
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { ScrollArea } from "../components/ui/scroll-area"
import { ModeToggle } from "../components/theme/mode-toggle"

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([])
    const [inputValue, setInputValue] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            // Add user's message
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: inputValue, sender: 'user' as const },
            ]);
            setInputValue('');

            // Add bot's response after a delay
            setTimeout(() => {
                const botResponse: { text: string; sender: 'bot' } = {
                    text: "Hello! How can I help?",
                    sender: 'bot',
                };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
            }, 1000);
        }
    };



    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-64 border-r flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="font-semibold">Chatbot Name</h1>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        ⚙️
                    </Button>
                </div>

                <Tabs defaultValue="chat" className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="report">Report</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium">Yesterday</h2>
                                <Card className="p-3 cursor-pointer hover:bg-accent">Chat session 1</Card>
                                <Card className="p-3 cursor-pointer hover:bg-accent">Chat session 2</Card>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-sm font-medium">2 days back</h2>
                                <Card className="p-3 cursor-pointer hover:bg-accent">Chat session 3</Card>
                                <Card className="p-3 cursor-pointer hover:bg-accent">Chat session 4</Card>
                            </div>
                        </div>
                    </ScrollArea>
                </Tabs>

                <div className="p-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                        📖 Tutorial
                    </Button>
                    <Button className="w-full">+ New Chat</Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost">← New Chat</Button>
                        <span className="text-sm text-muted-foreground">Version</span>
                    </div>
                    <ModeToggle />
                </header>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                📎 Upload file
                            </Button>
                            <Button variant="outline" className="flex-1">
                                🎤 Audio chat
                            </Button>
                            <Button variant="outline" className="flex-1">
                                🌐 Translate
                            </Button>
                            <Button variant="outline" className="flex-1">
                                📊 Get report
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                placeholder="Ask me anything..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" variant="outline">
                                ⬆
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

