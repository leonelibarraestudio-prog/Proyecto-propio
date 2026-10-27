import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from 'src/basic/abstract.controller';
import { ResponseObject } from 'src/basic/response-object.interface';
import { FinalBattleService } from './final-battle.service';
import { BattleReceipt, FinalBattleModel } from './model/final-battle.model';
import { PlayFinalBattleRequest } from './request/play-final-battle.request';

@ApiTags('Final Battle')
@Controller('final-stage')
export class FinalBattleController extends AbstractController {
  constructor(private readonly finalbattleService: FinalBattleService) {
    super();
  }

  // Get the current final battle data and return it to Angular.
  @Get()
  @ApiOperation({ summary: 'Read the complete current final battle view.' })
  async getBattle(): Promise<ResponseObject<FinalBattleModel>> {
    return this.createOkResponse(await this.finalbattleService.getBattle());
  }

  // Receive battle commands from Angular and return the result.
  @Post('play')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start, choose a legal action, or abandon the current final.' })
  @ApiBody({ type: PlayFinalBattleRequest })
  async play(@Body() request: PlayFinalBattleRequest): Promise<ResponseObject<BattleReceipt>> {
    return this.createOkResponse(await this.finalbattleService.play(request));
  }
}

