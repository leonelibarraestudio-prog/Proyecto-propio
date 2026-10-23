import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { ResponseObject } from '../../basic/response-object.interface';
import { GroupStageService } from './group-stage.service';
import { FaseDeGruposApi } from './fase-de-grupos.model';

@ApiTags('group-stage')
@Controller('journey/group-stage')
export class GroupStageController extends AbstractController {
  constructor(private readonly groupstageService: GroupStageService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Ver los grupos del journey actual.' })
  async obtenerEtapasActuales(): Promise<ResponseObject<FaseDeGruposApi>> {
    return this.createOkResponse(
      await this.groupstageService.obtenerEtapasActuales(),
    );
  }
}
