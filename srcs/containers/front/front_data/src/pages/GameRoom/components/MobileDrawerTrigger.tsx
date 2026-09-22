import type { LucideIcon } from "lucide-react";

interface MobileDrawerTriggerProps {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
}

function MobileDrawerTrigger({ icon: Icon, label, onClick }: MobileDrawerTriggerProps) {
	return (
		<button type="button" onClick={onClick} aria-label={label} className="text-white">
			<Icon className="size-6" />
		</button>
	);
}

export default MobileDrawerTrigger;
