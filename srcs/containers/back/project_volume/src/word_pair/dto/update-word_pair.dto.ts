import { PartialType } from '@nestjs/mapped-types';
import { CreateWordPairDto } from './create-word_pair.dto';

export class UpdateWordPairDto extends PartialType(CreateWordPairDto) {}
