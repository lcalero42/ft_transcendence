export class MessageRateLimiter {
  private readonly timestamps = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  allow(sessionId: string, now = Date.now()) {
    const recent = (this.timestamps.get(sessionId) ?? []).filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    if (recent.length >= this.limit) {
      this.timestamps.set(sessionId, recent);
      return false;
    }
    recent.push(now);
    this.timestamps.set(sessionId, recent);
    return true;
  }

  retryAfterMs(sessionId: string, now = Date.now()) {
    const recent = (this.timestamps.get(sessionId) ?? []).filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    if (recent.length < this.limit) {
      return 0;
    }
    return this.windowMs - (now - recent[0]);
  }

  forget(sessionId: string) {
    this.timestamps.delete(sessionId);
  }
}
