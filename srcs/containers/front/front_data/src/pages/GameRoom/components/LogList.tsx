import { useTranslation } from "react-i18next";

interface ClueEntry {
	id: string;
	name: string;
	word: string;
	round: number;
}

interface EliminationEntry {
	id: string;
	name: string;
	role: string;
	round: number;
}

interface RevealedWords {
	civilian: string;
	undercover: string;
}

interface LogListProps {
	clues: ClueEntry[];
	eliminations: EliminationEntry[];
	words?: RevealedWords | null;
}

function LogList({ clues, eliminations, words }: LogListProps) {
	const { t } = useTranslation();

	if (clues.length === 0 && eliminations.length === 0 && !words) {
		return <p className="text-gray-low text-small">{t("game.noLog")}</p>;
	}

	const rounds = [...new Set([...clues, ...eliminations].map((entry) => entry.round))].sort((a, b) => a - b);

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
					{eliminations
						.filter((elimination) => elimination.round === round)
						.map((elimination) => (
							<p
								key={elimination.id}
								className="border-defeat/40 bg-defeat/10 text-defeat text-small rounded-2xl border px-4 py-2 text-left font-bold break-words"
							>
								{t("game.eliminatedEntry", {
									name: elimination.name,
									role: t(`roles.${elimination.role}`),
								})}
							</p>
						))}
				</div>
			))}
			{words && (
				<div className="flex flex-col gap-2">
					<p className="border-victory/40 bg-victory/10 text-victory text-small rounded-2xl border px-4 py-2 text-left font-bold break-words">
						{t("game.civilianWordWas", { word: words.civilian })}
					</p>
					<p className="border-defeat/40 bg-defeat/10 text-defeat text-small rounded-2xl border px-4 py-2 text-left font-bold break-words">
						{t("game.undercoverWordWas", { word: words.undercover })}
					</p>
				</div>
			)}
		</>
	);
}

export default LogList;
