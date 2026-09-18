import AvatarDefault from "@/assets/profile-photo/avatar-default.svg";

interface ChatMessageProps {
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
}

function ChatMessage({ name, text, time, avatarUrl }: ChatMessageProps) {
	return (
		<div className="flex items-start gap-2">
			<img src={avatarUrl || AvatarDefault} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-[max(0.85vw,12px)] font-semibold">{name}</span>
					<span className="text-gray-low text-[max(0.7vw,10px)]">{time}</span>
				</div>
				<p className="text-[max(0.85vw,12px)] break-words">{text}</p>
			</div>
		</div>
	);
}

export default ChatMessage;
