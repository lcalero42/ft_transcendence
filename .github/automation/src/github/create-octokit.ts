import { Octokit } from 'octokit';

export interface RepositoryContext {
	owner: string;
	repo: string;
}

export function createOctokit(token = process.env.GITHUB_TOKEN): Octokit {
	if (!token) {
		throw new Error('Missing GITHUB_TOKEN');
	}

	return new Octokit({ auth: token });
}

export function getRepositoryContext(repository = process.env.GITHUB_REPOSITORY): RepositoryContext {
	if (!repository) {
		throw new Error('Missing GITHUB_REPOSITORY');
	}

	const [owner, repo] = repository.split('/');

	if (!owner || !repo) {
		throw new Error(`Invalid GITHUB_REPOSITORY: "${repository}"`);
	}

	return { owner, repo };
}
