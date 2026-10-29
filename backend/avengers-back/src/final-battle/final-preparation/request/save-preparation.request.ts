import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SavePreparationRequest {
  @ApiProperty({ type: [String], example: ['falcon', 'captain-america', 'hawkeye'] })
  @IsArray()
  @IsString({ each: true })
  activeHeroIds!: string[];

  @ApiProperty({ example: 'BALANCED' })
  @IsString()
  strategy!: string;
}