import { useState } from "react";
import { UserPlus } from "lucide-react";

function AutoJoinButton() {
	const [autoJoin, setAutoJoin] = useState(false);

	return (
		<button
			type="button"
			onClick={() => setAutoJoin((current) => !current)}
			className={`badge hoverable shrink-0 gap-2 px-5 py-2.5 text-base ${autoJoin ? "border-accent-purple text-accent-purple" : ""}`}
		>
			<UserPlus size={20} />
			Auto-Join
		</button>
	);
}

export default AutoJoinButton;
