import { apiFetch } from "./auth/client";

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
	return apiFetch<WordPair[]>("/word-pair");
}

export async function createWordPair(data: CreateWordPairDto) {
  return apiFetch<WordPair>("/word-pair", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function deleteWordPair(id: number) {
  return apiFetch<void>(`/word-pair/${id}`, {
    method: "DELETE",
  });
}
