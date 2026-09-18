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
					<span className="text-[clamp(12px,0.85vw,19px)] font-semibold">{name}</span>
					<span className="text-gray-low text-[clamp(10px,0.7vw,17px)]">{time}</span>
				</div>
				<p className="text-[clamp(12px,0.85vw,19px)] break-words">{text}</p>
			</div>
		</div>
	);
}

export default ChatMessage;
