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
    return this.classService.findStudentClasses(req.user.sub || req.user.id);
  }
}
