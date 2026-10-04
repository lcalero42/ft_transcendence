export type ImageType = 'png' | 'jpeg' | 'webp' | 'gif';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function detectImageType(buf: Buffer): ImageType | null {
 if (buf.length < 12) return null;
  if (buf.subarray(0, 8).equals(PNG_SIGNATURE)) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  const gif = buf.subarray(0, 6).toString('ascii');
  if (gif === 'GIF87a' || gif === 'GIF89a') return 'gif';
  return null;
}
