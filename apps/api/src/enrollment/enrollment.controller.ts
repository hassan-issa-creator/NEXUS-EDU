import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('enrollments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN)
  bulkEnroll(@Body() data: { studentIds: string[]; classId: string }) {
    return this.enrollmentService.bulkEnroll(data.studentIds, data.classId);
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByClass(@Param('classId') classId: string) {
    return this.enrollmentService.findByClass(classId);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  findByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentService.findByStudent(studentId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.enrollmentService.delete(id);
  }
}
