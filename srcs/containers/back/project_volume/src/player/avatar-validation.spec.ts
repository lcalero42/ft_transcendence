import { detectImageType } from './avatar-validation';

const pad = (bytes: number[]) =>
  Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

describe('detectImageType', () => {
  it('detects png', () => {
    expect(
      detectImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe('png');
  });

  it('detects jpeg', () => {
    expect(detectImageType(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
  });

  it('detects gif (87a and 89a)', () => {
    expect(detectImageType(Buffer.from('GIF87a' + '\0'.repeat(10)))).toBe(
      'gif',
    );
    expect(detectImageType(Buffer.from('GIF89a' + '\0'.repeat(10)))).toBe(
      'gif',
    );
  });

  it('detects webp', () => {
    const buf = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WEBP'),
      Buffer.alloc(8),
    ]);
    expect(detectImageType(buf)).toBe('webp');
  });

  it('rejects RIFF files that are not webp (e.g. wav)', () => {
    const buf = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WAVE'),
      Buffer.alloc(8),
    ]);
    expect(detectImageType(buf)).toBeNull();
  });

  it('rejects text and html content', () => {
    expect(
      detectImageType(Buffer.from('<html><script>alert(1)</script></html>')),
    ).toBeNull();
  });

  it('rejects a buffer that is too short', () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff]))).toBeNull();
  });
});
