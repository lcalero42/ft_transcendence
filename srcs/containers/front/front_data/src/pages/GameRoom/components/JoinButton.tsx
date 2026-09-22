interface JoinButtonProps {
	isParticipant: boolean;
	onClick: () => void;
}

function JoinButton({ isParticipant, onClick }: JoinButtonProps) {
	return (
		<button type="button" onClick={onClick} className="badge badge-action hoverable rounded-lg! shrink-0">
			{isParticipant ? "Leave" : "Join"}
		</button>
	);
}

export default JoinButton;