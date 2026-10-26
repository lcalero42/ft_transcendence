import Header from "@/components/Header/Header";
import Credit from "@/components/Credit/Credit";

export type LegalSection = {
	title: string;
	paragraphs?: string[];
	items?: string[];
};

type LegalLayoutProps = {
	title: string;
	lastUpdated: string;
	sections: LegalSection[];
};

function LegalLayout({ title, lastUpdated, sections }: LegalLayoutProps) {
	return (
		<div className="page">
			<Header />

			<main className="page-main pt-10 md:pt-10">
				<article className="mx-auto w-full max-w-3xl text-left">
					<h1 className="text-2xl md:text-4xl font-extrabold">{title}</h1>
					<p className="mt-1 mb-6 text-sm text-gray-low">
						Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
					</p>

					{sections.map((section, index) => (
						<section key={section.title} className="card border border-card-border-2 bg-transparent">
							<h2 className="flex items-center gap-3 font-bold">
								<span className="circle-purple size-7 text-sm">{index + 1}</span>
								{section.title}
							</h2>
							{section.paragraphs?.map((paragraph) => (
								<p key={paragraph} className="text-sm leading-relaxed text-text-dim">
									{paragraph}
								</p>
							))}
							{section.items && (
								<ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed text-text-dim marker:text-accent-purple">
									{section.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							)}
						</section>
					))}
				</article>
			</main>

			<Credit />
		</div>
	);
}

export default LegalLayout;
