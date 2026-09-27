import { OctagonXIcon } from "lucide-react";

interface ErrorPageProps {
  error: string;
}

function ErrorPage({error}: ErrorPageProps) {
	return (
		<div className="page items-center justify-center">
			<div className="flex flex-col items-center gap-3 rounded-2xl border border-defeat/30 bg-defeat/5 p-8">
				<OctagonXIcon className="size-9 text-defeat" />
				<p className="text-defeat font-semibold"> Something went wrong : </p>
				<p className="text-defeat font-bold"> {error} </p>
				<p className="text-text-dim"> try to refresh the page</p>
			</div>
			</div>
	);
}

export default ErrorPage;
