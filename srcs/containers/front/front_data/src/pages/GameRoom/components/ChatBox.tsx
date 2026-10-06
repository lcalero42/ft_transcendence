import { useEffect, useRef, useState } from "react";
import ChatMessage from "@/pages/GameRoom/components/ChatMessage";
import ClueList from "@/pages/GameRoom/components/ClueList";

interface ChatEntry {
	id: string;
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
}

interface ClueEntry {
	id: string;
	name: string;
	word: string;
	round: number;
}

export type ChatTab = "chat" | "clues";

interface ChatBoxProps {
	messages: ChatEntry[];
	clues: ClueEntry[];
	tab: ChatTab;
	onTabChange: (tab: ChatTab) => void;
	onSend?: (text: string) => void;
}

const TABS: { id: ChatTab; label: string }[] = [
	{ id: "chat", label: "Chat" },
	{ id: "clues", label: "Clues" },
];

function ChatBox({ messages, clues, tab, onTabChange, onSend }: ChatBoxProps) {
	const [value, setValue] = useState("");
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [tab, messages.length, clues.length]);

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!value.trim()) return;
		onSend?.(value.trim());
		setValue("");
	}

	return (
		<div
			className="card mb-0! flex h-full min-h-0 flex-col border-2 bg-transparent"
			style={{ borderColor: "#15113A" }}
		>
			<div className="border-card-border-2 -mx-5 mb-2 flex gap-6 border-b px-5 pb-3">
				{TABS.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						onClick={() => onTabChange(id)}
						className={`text-title cursor-pointer font-bold ${tab === id ? "text-accent-purple" : "text-gray-low"}`}
					>
						{label}
					</button>
				))}
			</div>
			<div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				{tab === "chat" ? (
					messages.map((message) => (
						<ChatMessage
							key={message.id}
							name={message.name}
							text={message.text}
							time={message.time}
							avatarUrl={message.avatarUrl}
						/>
					))
				) : (
					<ClueList clues={clues} />
				)}
			</div>
			{tab === "chat" && (
				<form onSubmit={handleSubmit} className="mt-3">
					<input
						type="text"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						placeholder="Type a message..."
						className="input h-10 py-2 text-sm"
					/>
				</form>
			)}
		</div>
	);
}

export default ChatBox;
