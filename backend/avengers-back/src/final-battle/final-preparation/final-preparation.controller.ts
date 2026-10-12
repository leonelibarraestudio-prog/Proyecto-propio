import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { FinalPreparationModel } from './model/store-api.model';
import { FinalPreparationService } from './final-preparation.service';

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

}