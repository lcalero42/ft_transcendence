import { useTranslation } from "react-i18next";

interface ClueEntry {
	id: string;
	name: string;
	word: string;
	round: number;
}

interface ClueListProps {
	clues: ClueEntry[];
}

function ClueList({ clues }: ClueListProps) {
	const { t } = useTranslation();

	if (clues.length === 0) {
		return <p className="text-gray-low text-small">{t("game.noClues")}</p>;
	}

	const rounds = [...new Set(clues.map((clue) => clue.round))];

	return (
		<>
			{rounds.map((round) => (
				<div key={round} className="flex flex-col gap-2">
					<span className="text-gray-low text-small text-left font-bold">{t("game.round", { round })}</span>
					{clues
						.filter((clue) => clue.round === round)
						.map((clue) => (
							<p
								key={clue.id}
								className="border-winrate/40 bg-winrate/10 text-small rounded-2xl border px-4 py-2 text-left break-words"
							>
								<span className="text-winrate font-bold">{clue.name}</span>
								<span className="text-gray-high"> {t("game.enteredClue")} </span>
								<span className="text-winrate">"{clue.word}"</span>
							</p>
						))}
				</div>
			))}
		</>
	);
}

export default ClueList;
