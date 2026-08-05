import CheckIcon from "../../../../assets/icons/check.svg";

type CheckboxProps = {
	id: string;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
				<input
					id={id}
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-accent-purple bg-transparent checked:bg-accent-purple checked:border-accent-purple"
				/>
				<span
					className="mask-icon pointer-events-none absolute h-2.5 w-2.5 bg-white opacity-0 peer-checked:opacity-100"
					style={{
						WebkitMaskImage: `url("${CheckIcon}")`,
						maskImage: `url("${CheckIcon}")`,
					}}
				/>
			</div>
			<label htmlFor={id} className="text-sm text-gray-low cursor-pointer">
				{label}
			</label>
		</div>
	);
}

export default Checkbox;
