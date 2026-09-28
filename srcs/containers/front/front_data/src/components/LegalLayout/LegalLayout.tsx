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

			<main className="page-main flex flex-col items-center">
				<article className="w-full max-w-3xl">
					<h1 className="mb-2 text-2xl md:text-4xl font-semibold">{title}</h1>
					<p className="mb-8 text-sm text-gray-low">
						Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
					</p>

					{sections.map((section) => (
						<section key={section.title} className="mb-8">
							<h2 className="mb-3 text-lg md:text-xl font-semibold text-accent-purple">
								{section.title}
							</h2>
							{section.paragraphs?.map((paragraph) => (
								<p key={paragraph} className="mb-3 leading-relaxed text-gray-high">
									{paragraph}
								</p>
							))}
							{section.items && (
								<ul className="mb-3 list-disc space-y-2 pl-6 leading-relaxed text-gray-high">
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
