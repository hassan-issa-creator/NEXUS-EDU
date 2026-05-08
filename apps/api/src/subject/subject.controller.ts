import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('subjects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  findAll() {
    return this.subjectService.findAll();
  }

  /** Student: returns subjects from their active enrollment */
  @Get('my')
  @Roles(Role.STUDENT)
  findMySubjects(@Request() req: any) {
    const studentId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.subjectService.findByStudent(studentId);
  }

  /** Teacher: returns subjects they teach */
  @Get('teacher/my')
  @Roles(Role.TEACHER)
  findMyTeacherSubjects(@Request() req: any) {
    const teacherId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.subjectService.findByTeacher(teacherId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
