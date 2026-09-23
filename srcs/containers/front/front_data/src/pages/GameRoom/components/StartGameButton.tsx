interface StartGameButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

function StartGameButton({ onClick, disabled }: StartGameButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="badge badge-action hoverable rounded-lg! shrink-0 disabled:opacity-50"
		>
			Start Game
		</button>
	);
}

export default StartGameButton;
