import { useState } from "react";
import { UserPlus } from "lucide-react";

function AutoJoinButton() {
	const [autoJoin, setAutoJoin] = useState(false);

	return (
		<button
			type="button"
			onClick={() => setAutoJoin((current) => !current)}
			className={`badge hoverable shrink-0 gap-[max(0.6vw,8px)] px-[max(1.2vw,14px)] py-[max(0.7vw,8px)] text-[max(0.8vw,13px)] ${autoJoin ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<UserPlus className="size-[max(1.1vw,15px)]" />
			Auto-Join
		</button>
	);
}

export default AutoJoinButton;
