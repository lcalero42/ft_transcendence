interface ChatMessageProps {
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
}

function ChatMessage({ name, text, time, avatarUrl }: ChatMessageProps) {
	return (
		<div className="flex items-start gap-2">
			<img src={avatarUrl} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-body font-semibold">{name}</span>
					<span className="text-gray-low text-small">{time}</span>
				</div>
				<p className="text-body break-words">{text}</p>
			</div>
		</div>
	);
}

export default ChatMessage;
