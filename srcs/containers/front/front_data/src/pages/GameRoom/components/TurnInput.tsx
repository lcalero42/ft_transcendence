import { useState } from "react";

interface TurnInputProps {
	isMyTurn: boolean;
	activePlayerName?: string;
	onSubmit?: (value: string) => void;
}

function TurnInput({ isMyTurn, activePlayerName, onSubmit }: TurnInputProps) {
	const [value, setValue] = useState("");

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!isMyTurn || !value.trim()) return;
		onSubmit?.(value.trim());
		setValue("");
	}

	return (
		<form onSubmit={handleSubmit} className="card mb-0! mx-auto w-full min-w-[265px] max-w-2xl p-[max(1vw,12px)]">
			<p className="text-center text-[clamp(14px,1vw,24px)] font-semibold">
				{isMyTurn ? (
					<>
						C'est à <span className="text-accent-purple">votre tour</span>
					</>
				) : (
					<>
						C'est au tour de <span className="text-accent-purple">{activePlayerName}</span>
					</>
				)}
			</p>
			<input
				type="text"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				disabled={!isMyTurn}
				placeholder="Écrivez votre message..."
				className="input disabled:opacity-50"
			/>
		</form>
	);
}

export default TurnInput;
