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
		<form onSubmit={handleSubmit} className="card mx-auto w-full max-w-2xl">
			<p className="text-center text-lg font-semibold">
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
				className="border-grey-border placeholder:text-gray-low focus:border-accent-purple w-full rounded-lg border bg-transparent px-4 py-2 text-white focus:outline-none disabled:opacity-50"
			/>
		</form>
	);
}

export default TurnInput;
