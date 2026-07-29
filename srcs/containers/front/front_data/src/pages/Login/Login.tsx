import Logo from "../../components/Logo/Logo";
import Credit from "../../components/Credit/Credit";

function Login() {

	return (
		<div className="page">
			<header className="flex w-full items-center justify-center md:justify-start px-4 py-3 shadow-sm">
				<Logo />
			</header>

			<main className="page-main">

				<h1 className="mb-6
				md:text-center
				font-semibold"
				style={{color: "var(--color-white-low)"}}>
					Bienvenue sur
				</h1>


					<h5 className="mb-6
					md:text-center
					font-semibold"
					style={{color: "var(--color-gray-low)"}}>
						Connecte toi pour continuer ton undercover journey !
				</h5>
			</main>
			<Credit />
		</div>
	);
}

export default Login;
