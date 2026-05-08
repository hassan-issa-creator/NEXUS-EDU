import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Smart Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':studentId')
  @ApiOperation({ summary: 'Get smart profile of a student' })
  getStudentProfile(@Param('studentId') studentId: string) {
    return this.profileService.getStudentProfile(studentId);
  }

  @Get(':studentId/skills')
  @ApiOperation({ summary: 'Get skill masteries of a student' })
  getStudentSkills(@Param('studentId') studentId: string) {
    return this.profileService.getStudentSkillMasteries(studentId);
  }

  @Get('subject/:subjectId/skills')
  @ApiOperation({ summary: 'Get all skill nodes for a subject' })
  getSubjectSkills(@Param('subjectId') subjectId: string) {
    return this.profileService.getSubjectSkillNodes(subjectId);
  }
}
