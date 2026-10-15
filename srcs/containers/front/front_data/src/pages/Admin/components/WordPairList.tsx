import { useEffect,useState  } from "react";
import {getWordPairs, deleteWordPair, createWordPair, type WordPair, type CreateWordPairDto} from "@/api/word-pair"
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

type WordPairField = keyof CreateWordPairDto;

const LANGUAGE_FIELDS: { label: string; civilian: WordPairField; undercover: WordPairField }[] = [
	{ label: "EN", civilian: "civilianWord", undercover: "undercoverWord" },
	{ label: "FR", civilian: "civilianWordFr", undercover: "undercoverWordFr" },
	{ label: "ES", civilian: "civilianWordEs", undercover: "undercoverWordEs" },
];

const EMPTY_WORDS: CreateWordPairDto = {
	civilianWord: "",
	undercoverWord: "",
	civilianWordFr: "",
	undercoverWordFr: "",
	civilianWordEs: "",
	undercoverWordEs: "",
};

function CreateWordPair({ onAdded }: { onAdded: (newPair: WordPair) => void }) {
	const { t } = useTranslation();
	const [words, setWords] = useState<CreateWordPairDto>(EMPTY_WORDS);

	function handleSubmit() {
		const trimmed = Object.fromEntries(
			Object.entries(words).map(([field, word]) => [field, word.trim()]),
		) as CreateWordPairDto;

		if (Object.values(trimmed).some((word) => !word)) {
			toast.add({
				title: t("admin.addFailed"),
				description: t("admin.missingWords"),
			});
			return;
		}
		if (LANGUAGE_FIELDS.some(({ civilian, undercover }) => trimmed[civilian] === trimmed[undercover])) {
			toast.add({
				title: t("admin.addFailed"),
				description: t("admin.identicalWords"),
			});
			return;
		}
		createWordPair(trimmed)
			.then((newPair) => {
				onAdded(newPair);
				setWords(EMPTY_WORDS);
				toast.add({
					title: t("common.success"),
					description: t("admin.pairRegistered"),
				});
			})
			.catch((err: unknown) =>
				toast.add({
					title: t("common.errorOccurred"),
					description: err instanceof Error ? err.message : t("common.somethingWentWrong"),
				})
			);
	}
	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleSubmit();
		}
	}
	function handleChange(field: WordPairField, value: string) {
		setWords((prev) => ({ ...prev, [field]: value }));
	}
	return (
		<div className="card mb-3 flex flex-row justify-between items-center border border-card-border-2">
			<div className="flex flex-col flex-1 gap-2 text-xs font-semibold">
				{LANGUAGE_FIELDS.map(({ label, civilian, undercover }) => (
					<div className="flex flex-col md:flex-row md:items-center gap-2" key={label}>
						<span className="w-6 text-left text-text-dim">{label}</span>
						<input className="text-blue-400 w-35 outline-none focus:border-blue-400 border border-card-border-2 rounded-full p-2 hoverable hover:text-blue-300"
							type="text"
							placeholder={t("admin.civilianPlaceholder")}
							value={words[civilian]}
							onChange={(e) => handleChange(civilian, e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<input className="text-orange-400 w-35 outline-none focus:border-orange-400 border border-card-border-2 rounded-full p-2 hoverable hover:text-orange-300"
							type="text"
							placeholder={t("admin.undercoverPlaceholder")}
							value={words[undercover]}
							onChange={(e) => handleChange(undercover, e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
				))}
			</div>
			<div className="flex items-center">
				<button className="text-victory hoverable hover:text-green-300"
				onClick={handleSubmit}>
					{t("admin.add")}
				</button>
			</div>
		</div>
	);
}

function WordPairList() {
	const { t } = useTranslation();
	const [WordPairs, setWordPairs] = useState<WordPair[]>([]);

	useEffect(() => {
	getWordPairs()
		.then((data) => setWordPairs(data))
		.catch((err: unknown) =>
			toast.add({
				title: i18n.t("common.errorOccurred"),
				description: err instanceof Error ? err.message : i18n.t("common.somethingWentWrong"),
			})
		);
	}, []);

	function handleRemove(id: number) {
		deleteWordPair(id)
			.then(() => {
				setWordPairs((prev) => prev.filter((wp) => wp.id !== id));
				toast.add({
					title: t("common.success"),
					description: t("admin.pairDeleted"),
				});
			})
			.catch((err: unknown) =>
				toast.add({
					title: t("common.errorOccurred"),
					description: err instanceof Error ? err.message : t("common.somethingWentWrong"),
				})
			);
	}

	function handleAdded(newPair: WordPair) {
		setWordPairs((prev) => [...prev, newPair]);
	}

	return (
		<div className="card w-full md:bg-transparent border border-card-border-2 ">
			<div className="flex justify-between mb-3">
				<div className="font-bold text-xl"> {t("admin.wordPairs")} </div>
			</div>
			<CreateWordPair onAdded={handleAdded}/>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{WordPairs.map((WordPair) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={WordPair.id}>
						<div className="flex flex-col gap-2 font-semibold text-left flex-1 min-w-0">
							{LANGUAGE_FIELDS.map(({ label, civilian, undercover }) => (
								<div className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2" key={label}>
									<span className="text-xs text-text-dim">{label}</span>
									<p className="text-blue-400 truncate">
										{WordPair[civilian]}
									</p>
									<p className="text-orange-400 truncate">
										{WordPair[undercover]}
									</p>
								</div>
							))}
						</div>
						<div className="flex items-center">
							<button className="text-defeat hoverable hover:text-red-300"
							onClick={() =>handleRemove(WordPair.id)}>
								{t("admin.remove")}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default WordPairList;
