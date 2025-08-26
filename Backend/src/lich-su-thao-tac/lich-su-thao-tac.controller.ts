import { Controller, Get, Param, Query } from '@nestjs/common';
import { LichSuThaoTacService } from './lich-su-thao-tac.service';
import { LichSuThaoTac } from './schemas/lich-su-thao-tac.schema';

@Controller('api/activityLogs')
export class LichSuThaoTacController {
  constructor(private readonly LichSuThaoTacService: LichSuThaoTacService) {}

  @Get(':dataName/:id')
  getActivityLogs(
    @Param('id') id: string,
    @Param('dataName') dataName: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string
  ): Promise<LichSuThaoTac | null> {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.LichSuThaoTacService.findByReference(
      id,
      dataName,
      skipNum,
      limitNum
    );
  }
}
