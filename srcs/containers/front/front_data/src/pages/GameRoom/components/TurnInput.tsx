import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

const CLUE_MAX_LENGTH = 30;

interface TurnInputProps {
	isMyTurn: boolean;
	activePlayerName?: string;
	onSubmit?: (value: string) => void;
}

function TurnInput({ isMyTurn, activePlayerName, onSubmit }: TurnInputProps) {
	const [value, setValue] = useState("");
	const { t } = useTranslation();
	const isAtLimit = isMyTurn && value.length >= CLUE_MAX_LENGTH;

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!isMyTurn || !value.trim()) return;
		onSubmit?.(value.trim());
		setValue("");
	}

	return (
		<form onSubmit={handleSubmit} className="card mb-0! mx-auto w-full min-w-[265px] max-w-2xl p-[max(1vw,12px)]">
			<p className="text-center text-[clamp(14px,1vw,24px)] font-semibold">
				<Trans
					i18nKey={isMyTurn ? "game.yourTurn" : "game.playerTurn"}
					values={{ name: activePlayerName || t("game.aPlayer") }}
					components={{ accent: <span className="text-accent-purple" /> }}
				/>
			</p>
			<input
				type="text"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				maxLength={CLUE_MAX_LENGTH}
				disabled={!isMyTurn}
				placeholder={isMyTurn ? t("game.typeGuess") : t("game.waitTurn")}
				className={`input disabled:opacity-50 ${isAtLimit ? "border-defeat" : ""}`}
			/>
			{isMyTurn && (
				<p
					aria-live="polite"
					className={`text-small mt-1 text-right transition-colors duration-200 ${isAtLimit ? "text-defeat font-bold" : "text-gray-low"}`}
				>
					{value.length}/{CLUE_MAX_LENGTH}
				</p>
			)}
		</form>
	);
}

export default TurnInput;
