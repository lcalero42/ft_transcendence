import Edit from "@/components/Popup/Edit";

type RemoveFriendConfirmProps = {
	name: string;
	onClose: () => void;
	onConfirm: () => void;
};

function RemoveFriendConfirm({ name, onClose, onConfirm }: RemoveFriendConfirmProps) {
	return (
		<Edit onClose={onClose}>
			{(handleClose) => (
				<>
					<h2 className="font-bold text-lg">Remove friend</h2>
					<p className="text-sm text-text-dim">
						Are you sure you want to remove {name} from your friends?
					</p>
					<div className="flex justify-around w-full mt-1">
						<button className="clean-btn text-text-dim hoverable hover:font-black" onClick={handleClose}>
							Cancel
						</button>
						<button
							className="clean-btn text-defeat font-semibold hoverable hover:font-black"
							onClick={() => {
								onConfirm();
								handleClose();
							}}
						>
							Remove
						</button>
					</div>
				</>
			)}
		</Edit>
	);
}

export default RemoveFriendConfirm;
