import { useState } from "react";
import ChatMessage from "@/pages/GameRoom/components/ChatMessage";

interface ChatEntry {
	id: string;
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
}

interface ChatBoxProps {
	messages: ChatEntry[];
	onSend?: (text: string) => void;
}

function ChatBox({ messages, onSend }: ChatBoxProps) {
	const [value, setValue] = useState("");

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!value.trim()) return;
		onSend?.(value.trim());
		setValue("");
	}

	return (
		<div className="card border-card-border-2 mb-0! flex h-full min-h-0 flex-col border-2 bg-transparent">
			<h2 className="text-accent-purple border-card-border-2 -mx-5 mb-2 border-b px-5 pb-3 text-left text-title font-bold">
				Chat
			</h2>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				{messages.map((message) => (
					<ChatMessage
						key={message.id}
						name={message.name}
						text={message.text}
						time={message.time}
						avatarUrl={message.avatarUrl}
					/>
				))}
			</div>
			<form onSubmit={handleSubmit} className="mt-3">
				<input
					type="text"
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder="Type a message..."
					className="input h-10 py-2 text-sm"
				/>
			</form>
		</div>
	);
}

export default ChatBox;
