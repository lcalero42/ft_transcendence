import AuthLayout from "@/components/AuthLayout/AuthLayout";
import FormField from "@/components/FormField/FormField";
import UserIcon from "@/assets/icons/user.svg";
import PassIcon from "@/assets/icons/lock.svg";
import { toast } from "@/components/ui/toast";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/context/useAuth.ts";
import { Link, useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterForm = {
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const initialForm: RegisterForm = {
	email: "",
	username: "",
	password: "",
	confirmPassword: "",
};

function Register() {
	const [form, setForm] = useState<RegisterForm>(initialForm);
	const [errors, setErrors] = useState<RegisterErrors>({});
	//for auth
	const { register } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function validate(): RegisterErrors {
		const nextErrors: RegisterErrors = {};

		if (!form.email.trim()) {
			nextErrors.email = "Email is required.";
		} else if (!EMAIL_REGEX.test(form.email)) {
			nextErrors.email = "Enter a valid email address.";
		}

		if (!form.username.trim()) {
			nextErrors.username = "Username is required.";
		} else if (form.username.trim().length < 3) {
			nextErrors.username = "Username must be at least 3 characters.";
		}

		if (!form.password) {
			nextErrors.password = "Password is required.";
		} else if (form.password.length < 8) {
			nextErrors.password = "Password must be at least 8 characters.";
		}

		if (form.confirmPassword !== form.password) {
			nextErrors.confirmPassword = "Passwords do not match.";
		}

		return nextErrors;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const nextErrors = validate();
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await register(form.email, form.password, form.username);
			toast.add({
			  title: "Account registered",
			  description: "You can now enjoy the best experience of your life.",
			})
			navigate("/home");
		} catch (err) {
			toast.add({
				title: "Registration failed",
				description: err instanceof Error ? err.message : "Something went wrong." //for compilo but its not hapy
			})
		} finally {
			setIsSubmitting(false);
		}

		console.log("submit fired", form);
	}

	return (
		<AuthLayout
			subtitle="Register to continue your Undercover journey !"
			icon="🥷"
			heading="Register your account"
			description="Enter your credentials to access to your new account."
			onSubmit={handleSubmit}
  			submitLabel={isSubmitting ? "Registering..." : "Register"}
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
				id="username"
				label="Username"
				iconSrc={UserIcon}
				type="text"
				placeholder="VeryCoolAndGentle67"
				value={form.username}
				onChange={handleChange}
				error={errors.username}
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

			<FormField
				id="confirmPassword"
				label="Confirm password"
				iconSrc={PassIcon}
				type="password"
				placeholder="Coolpassword31#"
				value={form.confirmPassword}
				onChange={handleChange}
				error={errors.confirmPassword}
			/>
		</AuthLayout>
	);
}

export default Register;
