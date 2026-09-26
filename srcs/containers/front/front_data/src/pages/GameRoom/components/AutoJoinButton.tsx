import { UserPlus } from "lucide-react";

interface AutoJoinButtonProps {
	enabled: boolean;
	onToggle: () => void;
}

function AutoJoinButton({ enabled, onToggle }: AutoJoinButtonProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`badge badge-action hoverable rounded-lg! shrink-0 gap-[max(0.6vw,8px)] ${enabled ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<UserPlus className="size-[clamp(15px,1.1vw,24px)]" />
			Auto-Join
		</button>
	);
}

export default AutoJoinButton;
