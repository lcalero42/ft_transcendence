interface ClueEntry {
	id: string;
	name: string;
	word: string;
}

interface ClueListProps {
	clues: ClueEntry[];
}

function ClueList({ clues }: ClueListProps) {
	if (clues.length === 0) return null;

	return (
		<div className="card mb-0! mx-auto flex w-full min-w-[265px] max-w-2xl flex-col gap-2 p-[max(1vw,12px)]">
			{clues.map((clue) => (
				<div key={clue.id} className="flex items-baseline justify-between gap-2">
					<span className="text-body font-bold">{clue.name}</span>
					<span className="text-accent-purple text-body">{clue.word}</span>
				</div>
			))}
		</div>
	);
}

export default ClueList;
