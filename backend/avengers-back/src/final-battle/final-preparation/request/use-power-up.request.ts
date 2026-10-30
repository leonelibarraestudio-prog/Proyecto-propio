import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UsePowerUpRequest {
  @ApiProperty({ example: 'ap-major' })
  @IsString()
  itemId!: string;

  @ApiPropertyOptional({
    example: 'kitty-pryde',
    description: 'Only for items whose target scope is HERO.',
  })
  @IsOptional()
  @IsString()
  targetHeroId?: string;
}
