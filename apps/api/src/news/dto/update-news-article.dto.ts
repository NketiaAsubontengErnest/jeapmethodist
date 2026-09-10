import { PartialType } from '@nestjs/swagger';
import { CreateNewsArticleDto } from './create-news-article.dto';

export class UpdateNewsArticleDto extends PartialType(CreateNewsArticleDto) {}
