import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../../infrastructure/guards/auth.guard';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  async getAllGames() {
    const data = await this.gamesService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async getGameDetails(@Param('id') id: string) {
    const data = await this.gamesService.findOne(id);
    return { success: true, data };
  }

  @Post(':id/start')
  async startGame(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const session = await this.gamesService.startGameSession(id, userId);
    return { success: true, message: 'Game started', data: session };
  }

  @Post('sessions/:sessionId/finish')
  async finishGame(
    @Param('sessionId') sessionId: string,
    @Body() body: { score: number; duration?: number },
    @Req() req: any
  ) {
    const userId = req.user.sub || req.user.id;
    const result = await this.gamesService.finishGameSession(sessionId, userId, body.score, body.duration);
    return { success: true, message: 'Game finished and score saved', data: result };
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    const data = await this.gamesService.getLeaderboard(id);
    return { success: true, data };
  }
}
