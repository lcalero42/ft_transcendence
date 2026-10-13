import type { LucideIcon } from "lucide-react";
import UnreadDot from "@/pages/GameRoom/components/UnreadDot";

interface MobileDrawerTriggerProps {
	icon: LucideIcon;
	label: string;
	hasUnread?: boolean;
	onClick: () => void;
}

function MobileDrawerTrigger({ icon: Icon, label, hasUnread, onClick }: MobileDrawerTriggerProps) {
	return (
		<button type="button" onClick={onClick} aria-label={label} className="text-accent-purple relative">
			<Icon className="size-6" />
			{hasUnread && <UnreadDot className="-top-0.5 -right-0.5" />}
		</button>
	);
}

export default MobileDrawerTrigger;
