import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField from "../../components/FormField/FormField";
import UserIcon from "../../assets/icons/user.svg";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 12;

function Guest() {
	const { guest, isAuth } = useAuth();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from ?? "/home";

	const [name, setName] = useState("");
	const [nameError, setNameError] = useState<string | undefined>();
	const [authError, setAuthError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isAuth) {
		return <Navigate to={from} replace />;
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setName(e.target.value);
	}

	function validate(): string | undefined {
		const trimmed = name.trim();
		if (!trimmed) return "Username is required.";
		if (trimmed.length < NAME_MIN_LENGTH) return `Username must be at least ${NAME_MIN_LENGTH} characters.`;
		if (trimmed.length > NAME_MAX_LENGTH) return `Username must be at most ${NAME_MAX_LENGTH} characters.`;
		return undefined;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAuthError(null);

		const error = validate();
		setNameError(error);
		if (error) return;

		setIsSubmitting(true);
		try {
			await guest(name.trim());
		} catch (err) {
			setAuthError(err instanceof Error ? err.message : "Could not join as guest");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<AuthLayout
			subtitle="Pick a name and jump into the game !"
			icon="🕵️"
			heading="Play as a guest"
			description="No account needed, just choose a username."
			onSubmit={(e) => { void handleSubmit(e); }}
			submitLabel={isSubmitting ? "Joining..." : "Play as guest"}
			showSocialLogin={false}
			footer={
				<p className="mt-4 text-center text-sm text-gray-low">
					Already have an account ?{" "}
					<Link to="/login" className="font-semibold text-accent-purple hover:underline">
						Log in
					</Link>
				</p>
			}
		>
			<FormField
				id="name"
				label="Username"
				iconSrc={UserIcon}
				type="text"
				placeholder="SneakyFox"
				value={name}
				onChange={handleChange}
				error={nameError}
			/>
			{authError && (
				<p className="mt-2 text-center text-sm" style={{color:"var(--color-defeat)"}}>
					{authError}
				</p>
			)}
		</AuthLayout>
	);
}

export default Guest;
