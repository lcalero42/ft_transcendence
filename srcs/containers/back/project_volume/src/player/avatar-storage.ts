import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  AVATAR_DIR,
  AVATAR_URL_PREFIX,
  AVATAR_OUTPUT_SIZE,
  AVATAR_MAX_INPUT_PIXELS,
} from './avatar.constants';

export async function saveAvatar(buffer: Buffer): Promise<string> {
  const filename = `${randomUUID()}.webp`;
  await sharp(buffer, { limitInputPixels: AVATAR_MAX_INPUT_PIXELS })
    .rotate()
    .resize(AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(join(AVATAR_DIR, filename));
  return `${AVATAR_URL_PREFIX}${filename}`;
}
