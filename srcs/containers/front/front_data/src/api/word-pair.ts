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
	return apiFetch("/word-pair");
}

export async function createWordPair(data: CreateWordPairDto) {
  return apiFetch("/word-pair", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function deleteWordPair(id: number) {
  return apiFetch(`/word-pair/${id}`, {
    method: "DELETE",
  });
}
