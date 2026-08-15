const BASE_URL = import.meta.env.VITE_API_URL;

export interface WordPair {
	id: number;
	undercoverWord: string;
	civilianWord: string;
}

type CreateWordPairDto = {
	civilianWord: string;
	undercoverWord: string;
};

export async function getWordPairs() {
	const res = await fetch(`${BASE_URL}/word-pair`);
	if (!res.ok) throw new Error('Failed to fetch list WordPairs');
	return res.json();
}

export async function createWordPair(data: CreateWordPairDto) {
	const res = await fetch(`${BASE_URL}/word-pair`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error("Failed to create word pair");
	return res.json();
}

export async function deleteWordPair(id: number) {
	const res = await fetch(`${BASE_URL}/word-pair/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) throw new Error(`Failed to remove the ${id}'s word pairs`);
	return res.json();
}
