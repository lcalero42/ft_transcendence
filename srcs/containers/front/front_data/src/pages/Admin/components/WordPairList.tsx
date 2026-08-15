import { useEffect,useState  } from "react";
import {getWordPairs} from "@/api/word-pair"
import { deleteWordPair } from "@/api/word-pair";
import { createWordPair } from "@/api/word-pair";
import { toast } from "@/components/ui/toast";
type WordPairListPros = {
	id: number;
	civilianWord: string;
	undercoverWord: string;
};
function CreateWordPair({ onAdded }: { onAdded: (newPair: WordPairListPros) => void }) {
	const [civilianWord, setCivilianWord] = useState("");
	const [undercoverWord, setUndercoverWord] = useState("");

	function handleSubmit() {
		if (!civilianWord.trim() && !undercoverWord.trim()) {
			toast.add({
				title: "Failed add the word pair:",
				description: "Missing civilian and undercover words",
			});
			return;
		} else if (!civilianWord.trim()) {
			toast.add({
				title: "Failed add the word pair:",
				description: "Missing civilian word",
			});
			return;
		} else if (!undercoverWord.trim()) {
			toast.add({
				title: "Failed add the word pair:",
				description: "Missing undercover word",
			});
			return;
		}
		else if (undercoverWord === civilianWord) {
			toast.add({
				title: "Failed add the word pair:",
				description: "The words civil and undercover are identical"
			});
			return;
		}
		createWordPair({ civilianWord, undercoverWord })
			.then((newPair) => {
				onAdded(newPair);
				setCivilianWord("");
				setUndercoverWord("");
			})
			.catch((err) =>
				toast.add({
					title: "An error occured",
					description: err.message,
				})
			);
			toast.add({
				title: "succes",
				description: "the word pair was registered"
			})
	}
	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleSubmit();
		}
	}
	return (
		<div className="card mb-3 flex flex-row justify-between items-center border border-card-border-2">
			<div className="flex flex-col md:grid md:grid-cols-3 flex-1 md:items-center gap-2 text-xs font-semibold">
				<input className="text-blue-400 w-35 md:w-32 outline-none focus:border-blue-400 border border-card-border-2 rounded-full p-2 hoverable hover:font-black"
					type="text"
					placeholder="civil word..."
					value={civilianWord}
					onChange={(e) => setCivilianWord(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<input className="text-orange-400 w-35 outline-none focus:border-orange-400 border border-card-border-2 rounded-full p-2 hoverable hover:font-black"
					type="text"
					placeholder="undercover word..."
					value={undercoverWord}
					onChange={(e) => setUndercoverWord(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
			</div>
			<div className="flex items-center">
				<button className="text-victory hoverable hover:font-black"
				onClick={handleSubmit}>
					add
				</button>
			</div>
		</div>
	);
}

function WordPairList() {
	const [WordPairs, setWordPairs] = useState<WordPairListPros[]>([]);

	useEffect(() => {
	getWordPairs()
		.then((data) => setWordPairs(data))
		.catch((err) =>
			toast.add({
				title: "An error occured",
				description: err.message,
			})
		);
	}, []);

	function handleRemove(id: number) {
		deleteWordPair(id)
			.then(() => {
				setWordPairs((prev) => prev.filter((wp) => wp.id !== id));//pr ps refresh
				toast.add({
					title: "Success",
					description: "Word pair deleted",
				});
			})
			.catch((err) =>
				toast.add({
					title: "An error occured",
					description: err.message,
				})
			);
	}

	function handleAdded(newPair: WordPairListPros) {
		setWordPairs((prev) => [...prev, newPair]);//pr ps refresh
	}

	return (
		<div className="card w-full md:bg-transparent border border-card-border-2 ">
			<div className="flex justify-between mb-3">
				<div className="font-bold text-xl"> Word Pairs </div>
			</div>
			<CreateWordPair onAdded={handleAdded}/>
			<div className="flex flex-col max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{WordPairs.map((WordPair) => (
					<div className="card flex-row justify-between items-center border border-card-border-2" key={WordPair.id}>
						<div className="flex flex-col  md:grid md:grid-cols-3 md:items-center gap-2 font-semibold text-left flex-1">
							<p className="text-blue-400 truncate">
								{WordPair.civilianWord}
							</p>
							<p className="text-orange-400 truncate">
								{WordPair.undercoverWord}
							</p>
						</div>
						<div className="flex items-center">
							<button className="text-defeat hoverable hover:font-black"
							onClick={() =>handleRemove(WordPair.id)}>
								remove
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);

}
export default WordPairList;
