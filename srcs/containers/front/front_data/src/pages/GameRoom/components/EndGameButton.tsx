interface EndGameButtonProps {
	onClick: () => void;
}

function EndGameButton({ onClick }: EndGameButtonProps) {
	return (
		<button type="button" onClick={onClick} className="badge badge-action hoverable rounded-lg! shrink-0">
			End Game (test)
		</button>
	);
}

export default EndGameButton;