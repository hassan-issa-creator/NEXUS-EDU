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
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto } from './dto/create-class.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('classes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

  @Get('student/list')
  @Roles(Role.STUDENT)
  findStudentClasses(@Request() req: any) {
    // Mock data for student classes
    return [
      {
        id: '1',
        name: 'Mathematics 101',
        teacher: 'Dr. Ahmed',
        schedule: 'Mon, Wed 10:00 AM',
        room: 'Room 301',
        nextClass: '2024-12-04T10:00:00Z',
        isLive: true,
        joinLink: '/student/classroom/math101',
      },
      {
        id: '2',
        name: 'Physics 101',
        teacher: 'Prof. Sarah',
        schedule: 'Tue, Thu 11:30 AM',
        room: 'Lab 2',
        nextClass: '2024-12-05T11:30:00Z',
        isLive: false,
        joinLink: '/student/classroom/phys101',
      },
      {
        id: '3',
        name: 'Chemistry 101',
        teacher: 'Dr. Mohammed',
        schedule: 'Mon, Wed 01:00 PM',
        room: 'Lab 1',
        nextClass: '2024-12-04T13:00:00Z',
        isLive: false,
        joinLink: '/student/classroom/chem101',
      },
    ];
  }
}
