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
		<form onSubmit={handleSubmit} className="mx-auto flex w-full min-w-[265px] max-w-2xl flex-col gap-2">
			<p className="hidden text-center text-[clamp(14px,1vw,24px)] font-semibold md:block">
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
		</form>
	);
}

export default TurnInput;
