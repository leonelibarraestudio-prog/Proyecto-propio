import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { FinalPreparationModel } from './model/store-api.model';
import { FinalPreparationService } from './final-preparation.service';
import { PurchasePowerUpRequest } from './request/purchase-power-up.request';
import { request } from 'node_modules/axios/index.cjs';
import { UsePowerUpRequest } from './request/use-power-up.request';
import { SavePreparationRequest } from './request/save-preparation.request';

@ApiTags('final-preparation')
@Controller('final-stage/preparation')
export class FinalPreparationController extends AbstractController {
  constructor(private readonly finalPreparationService: FinalPreparationService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Read store, inventory and reward points for the final preparation.' })
  async getPreparation(): Promise<ResponseObject<FinalPreparationModel>> {
    return this.createOkResponse(await this.finalPreparationService.getPreparation());
  }

  @Post('purchases')
  @ApiOperation({ summary: 'Buy one power-up with the available reward points.'})
  async purchase(
    @Body() request: PurchasePowerUpRequest,
  ): Promise<ResponseObject<FinalPreparationModel>> {
    return this.createOkResponse(await this.finalPreparationService.purchase(request));
  }

  @Put()
  @ApiOperation({ summary: 'Save the active Heroes and the combat strategy of the final preparation.' })
  async savePreparation(
    @Body() request: SavePreparationRequest,
  ): Promise<ResponseObject<FinalPreparationModel>> {
    return this.createOkResponse(await this.finalPreparationService.savePreparation(request));
  }



  @Post('items')
  @ApiOperation({ summary: 'use one owned power-up, with a Hero target when it requires one.' })
  async useItem(
    @Body() request: UsePowerUpRequest,
  ): Promise<ResponseObject<FinalPreparationModel>> {
    return this.createOkResponse(await this.finalPreparationService.useItem(request));
  }
}