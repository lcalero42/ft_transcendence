interface ChatMessageProps {
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
	isSelf?: boolean;
}

function ChatMessage({ name, text, time, avatarUrl, isSelf }: ChatMessageProps) {
	return (
		<div className="flex items-start gap-3">
			<img
				src={avatarUrl}
				alt={name}
				className="mt-1 size-8 shrink-0 rounded-full object-cover"
			/>
			<div
				className={`flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border px-4 py-3 ${isSelf ? "border-accent-purple/40 bg-accent-purple/15" : "border-card-border-2 bg-white/5"}`}
			>
				<div className="flex items-baseline justify-between gap-2">
					<span className={`text-body font-bold ${isSelf ? "text-accent-purple" : ""}`}>{name}</span>
					<span className="text-gray-low text-small">{time}</span>
				</div>
				<p className="text-small text-left break-words whitespace-pre-wrap">{text}</p>
			</div>
		</div>
	);
}

export default ChatMessage;
