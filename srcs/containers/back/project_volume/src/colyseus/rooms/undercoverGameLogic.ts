export type Role = 'civilian' | 'undercover';

export function buildTurnOrder(
  alive: string[],
  rng: () => number = Math.random,
): string[] {
  const order = [...alive];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function tallyVotes(
  votes: { voterSessionId: string; targetSessionId: string }[],
  alive: string[],
): { eliminatedSessionId: string | null } {
  const counts = new Map<string, number>();
  for (const sessionId of alive) {
    counts.set(sessionId, 0);
  }
  for (const vote of votes) {
    if (!counts.has(vote.targetSessionId)) {
      continue;
    }
    counts.set(
      vote.targetSessionId,
      (counts.get(vote.targetSessionId) ?? 0) + 1,
    );
  }

  let topCount = -1;
  let topCandidates: string[] = [];
  for (const [sessionId, count] of counts) {
    if (count > topCount) {
      topCount = count;
      topCandidates = [sessionId];
    } else if (count === topCount) {
      topCandidates.push(sessionId);
    }
  }

  if (topCount <= 0 || topCandidates.length !== 1) {
    return { eliminatedSessionId: null };
  }
  return { eliminatedSessionId: topCandidates[0] };
}

export function checkWinCondition(
  alive: string[],
  roles: Map<string, Role>,
): 'civilians' | 'undercover' | null {
  let undercoverCount = 0;
  let civilianCount = 0;
  for (const sessionId of alive) {
    if (roles.get(sessionId) === 'undercover') {
      undercoverCount++;
    } else {
      civilianCount++;
    }
  }

  if (undercoverCount === 0) {
    return 'civilians';
  }
  if (undercoverCount >= civilianCount) {
    return 'undercover';
  }
  return null;
}

export function assignRoles(
  participants: string[],
  rng: () => number = Math.random,
): Map<string, Role> {
  const roles = new Map<string, Role>();
  const undercoverIndex = Math.floor(rng() * participants.length);
  participants.forEach((sessionId, index) => {
    roles.set(sessionId, index === undercoverIndex ? 'undercover' : 'civilian');
  });
  return roles;
}
