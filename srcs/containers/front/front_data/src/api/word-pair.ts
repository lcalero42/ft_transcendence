import { apiFetch } from "./auth/client";

export type CreateWordPairDto = {
	civilianWord: string;
	undercoverWord: string;
	civilianWordFr: string;
	undercoverWordFr: string;
	civilianWordEs: string;
	undercoverWordEs: string;
};

export interface WordPair extends CreateWordPairDto {
	id: number;
}

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
