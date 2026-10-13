
import { Module } from '@nestjs/common';
import { AwardsController } from './awards/awards.controller';
import { AwardsService } from './awards/awards.service';

@Module({
  controllers: [AwardsController],
  providers: [AwardsService],
})
export class ResultsModule {}