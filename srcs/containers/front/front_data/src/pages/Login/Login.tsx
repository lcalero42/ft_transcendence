import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField from "../../components/FormField/FormField";
import Checkbox from "./components/Checkbox/Checkbox";
import UserIcon from "../../assets/icons/user.svg";
import PassIcon from "../../assets/icons/lock.svg";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginForm = {
	email: string;
	password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

const initialForm: LoginForm = {
	email: "",
	password: "",
};

function Login() {

	const {login} = useAuth();
	const navigate = useNavigate();


	const [form, setForm] = useState<LoginForm>(initialForm);
	const [errors, setErrors] = useState<LoginErrors>({});
	const [rememberMe, setRememberMe] = useState(false);

	const [authError, setAuthError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function validate(): LoginErrors {
		const nextErrors: LoginErrors = {};

		if (!form.email.trim()) {
			nextErrors.email = "Email is required.";
		} else if (!EMAIL_REGEX.test(form.email)) {
			nextErrors.email = "Enter a valid email address.";
		}

		if (!form.password) {
			nextErrors.password = "Password is required.";
		}

		return nextErrors;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAuthError(null);

		const nextErrors = validate();
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await login(form.email, form.password);
			navigate("/");
		} catch (err) {
      		setAuthError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsSubmitting(false);
		}

		console.log("submit fired", { ...form, rememberMe });
	}

	return (
		<AuthLayout
			subtitle="Log in to continue your Undercover journey !"
			icon="🥷"
			heading="Log in to your account"
			description="Enter your credentials to access your account."
			onSubmit={handleSubmit}
			submitLabel="Log in"
			footer={
				<p className="mt-4 text-center text-sm text-gray-low">
					Don't have an account ?{" "}
					<Link to="/register" className="font-semibold text-accent-purple hover:underline">
						Create one
					</Link>
				</p>
			}
		>
			<FormField
				id="email"
				label="Email"
				iconSrc={UserIcon}
				type="email"
				placeholder="example@hello.com"
				value={form.email}
				onChange={handleChange}
				error={errors.email}
			/>

			<FormField
				id="password"
				label="Password"
				iconSrc={PassIcon}
				type="password"
				placeholder="Coolpassword31#"
				value={form.password}
				onChange={handleChange}
				error={errors.password}
			/>

			<div className="mt-2 ml-2">
				<Checkbox
					id="remember-me"
					label="Remember me"
					checked={rememberMe}
					onChange={setRememberMe}
				/>
			</div>
			{authError && (
				<p className="mt-2 text-center text-sm" style={{color:"var(--color-defeat)"}}>
					{authError}
				</p>
			)}
		</AuthLayout>
	);
}

export default Login;
