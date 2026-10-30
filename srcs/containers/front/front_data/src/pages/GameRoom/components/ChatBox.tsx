import { useEffect, useRef } from "react";
import ChatMessage from "@/pages/GameRoom/components/ChatMessage";
import LogList from "@/pages/GameRoom/components/LogList";
import UnreadDot from "@/pages/GameRoom/components/UnreadDot";
import { CHAT_MAX_LENGTH } from "@/pages/GameRoom/components/utils";
import { useTranslation } from "react-i18next";

interface ChatEntry {
	id: string;
	name: string;
	text: string;
	time: string;
	avatarUrl?: string;
	isSelf?: boolean;
}

interface ClueEntry {
	id: string;
	name: string;
	word: string;
	round: number;
}

interface EliminationEntry {
	id: string;
	name: string;
	role: string;
	round: number;
}

export type ChatTab = "chat" | "log";

interface ChatBoxProps {
	messages: ChatEntry[];
	clues: ClueEntry[];
	eliminations: EliminationEntry[];
	words?: { civilian: string; undercover: string } | null;
	tab: ChatTab;
	unread: Record<ChatTab, boolean>;
	onTabChange: (tab: ChatTab) => void;
	draft: string;
	onDraftChange: (value: string) => void;
	onSend?: (text: string) => void;
}

const TABS: ChatTab[] = ["chat", "log"];

function ChatBox({
	messages,
	clues,
	eliminations,
	words,
	tab,
	unread,
	onTabChange,
	draft,
	onDraftChange,
	onSend,
}: ChatBoxProps) {
	const { t } = useTranslation();
	const listRef = useRef<HTMLDivElement>(null);
	const isAtLimit = draft.length >= CHAT_MAX_LENGTH;

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [tab, messages.length, clues.length, eliminations.length, words?.civilian]);

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!draft.trim()) return;
		onSend?.(draft.trim());
	}

	return (
		<div
			className="card border-game-panel-border mb-0! flex h-full min-h-0 flex-col border-2 bg-transparent"
		>
			<div className="border-card-border-2 -mx-5 mb-2 flex gap-6 border-b px-5 pb-3">
				{TABS.map((id) => (
					<button
						key={id}
						type="button"
						onClick={() => onTabChange(id)}
						className={`text-title cursor-pointer font-bold ${tab === id ? "text-accent-purple" : "text-gray-low"}`}
					>
						<span className="relative">
							{t(`game.${id}`)}
							{unread[id] && <UnreadDot className="-top-0.5 -right-2.5" />}
						</span>
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
							isSelf={message.isSelf}
						/>
					))
				) : (
					<LogList clues={clues} eliminations={eliminations} words={words} />
				)}
			</div>
			{tab === "chat" && (
				<form onSubmit={handleSubmit} className="mt-3">
					<input
						type="text"
						value={draft}
						onChange={(event) => onDraftChange(event.target.value)}
						maxLength={CHAT_MAX_LENGTH}
						placeholder={t("game.typeMessage")}
						className={`input h-10 py-2 text-sm ${isAtLimit ? "border-defeat" : ""}`}
					/>
				</form>
			)}
		</div>
	);
}

export default ChatBox;
