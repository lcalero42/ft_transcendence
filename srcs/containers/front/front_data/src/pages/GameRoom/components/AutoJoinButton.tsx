import { useState } from "react";
import { UserPlus } from "lucide-react";

function AutoJoinButton() {
	const [autoJoin, setAutoJoin] = useState(false);

	return (
		<button
			type="button"
			onClick={() => setAutoJoin((current) => !current)}
			className={`badge badge-action hoverable rounded-lg! shrink-0 gap-[max(0.6vw,8px)] ${autoJoin ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<UserPlus className="size-[clamp(15px,1.1vw,24px)]" />
			Auto-Join
		</button>
	);
}

export default AutoJoinButton;
