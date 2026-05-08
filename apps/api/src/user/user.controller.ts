import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Get currently logged-in user's own profile */
  @Get('me')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  getMe(@Request() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.userService.findById(userId);
  }

  /** Update currently logged-in user's profile (name, phone, avatar) */
  @Patch('me')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  updateMe(@Request() req: any, @Body() updateDto: UpdateUserDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    // Strip admin-only fields
    const { role, schoolId, ...safeData } = updateDto as any;
    return this.userService.update(userId, safeData);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() filters: UserFilterDto) {
    return this.userService.findAll(filters);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.userService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
