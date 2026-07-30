import Logo from "../../components/Logo/Logo";
import Credit from "../../components/Credit/Credit";
import InputField  from "../../components/InputField/InputField";
import UserIcon from "../../assets/icons/user.svg";
import PassIcon from "../../assets/icons/lock.svg";

function Login() {

	return (
		<div className="page">
			<header className="flex w-full items-center justify-center md:justify-start px-[10vw] py-5 shadow-sm text-outline">
				<Logo />
			</header>

			<main className="page-main flex flex-col items-center">

				<h1 className="mb-6 md:text-center text-3xl md:text-5xl font-semibold" style={{color: "var(--color-white-low)"}}>
				  Bienvenue sur <span style={{color: "var(--color-purple-500)"}}>Undercover</span>
				</h1>

				<h5 className="mb-6
				md:text-center
				font-semibold"
				style={{color: "var(--color-gray-low)"}}>
					Connecte toi pour continuer ton undercover journey !
				</h5>

				<div className="w-full max-w-sm md:max-w-3xl">
				  <p className="text-left py-3 px-5 text-purple-300 text-xs font-bold">
				    Email ou login
				  </p>
				  <InputField
				    iconSrc={UserIcon}
				    type="text"
				    placeholder="Entre ton email ou login"
				  />
				</div>

				<div className="w-full max-w-sm md:max-w-3xl">
				<p className="text-left py-3 px-4 text-purple-300 text-xs font-bold">
					Mot de passe
				</p>
				<InputField
				  iconSrc={PassIcon}
				  type="password"
				  placeholder="Entre ton mot de passe"
				/>
				</div>

			</main>

			<Credit />

		</div>
	);
}

export default Login;
