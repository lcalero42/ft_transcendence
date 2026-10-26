import { MessageRateLimiter } from './messageRateLimiter';

describe('MessageRateLimiter', () => {
  let limiter: MessageRateLimiter;

  beforeEach(() => {
    limiter = new MessageRateLimiter(3, 1000);
  });

  it('should allow messages up to the limit and drop the next one', () => {
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('a', 100)).toBe(true);
    expect(limiter.allow('a', 200)).toBe(true);
    expect(limiter.allow('a', 300)).toBe(false);
  });

  it('should allow messages again once the window has passed', () => {
    limiter.allow('a', 0);
    limiter.allow('a', 100);
    limiter.allow('a', 200);

    expect(limiter.allow('a', 999)).toBe(false);
    expect(limiter.allow('a', 1000)).toBe(true);
  });

  it('should not count dropped messages against the window', () => {
    limiter.allow('a', 0);
    limiter.allow('a', 0);
    limiter.allow('a', 0);
    limiter.allow('a', 500);

    expect(limiter.allow('a', 1000)).toBe(true);
  });

  it('should track each session independently', () => {
    limiter.allow('a', 0);
    limiter.allow('a', 0);
    limiter.allow('a', 0);

    expect(limiter.allow('a', 0)).toBe(false);
    expect(limiter.allow('b', 0)).toBe(true);
  });

  it('should reset a session when it is forgotten', () => {
    limiter.allow('a', 0);
    limiter.allow('a', 0);
    limiter.allow('a', 0);
    limiter.forget('a');

    expect(limiter.allow('a', 0)).toBe(true);
  });
});
