export class CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  name?: string;
  lastName?: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  phone?: string;
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  name?: string;
  lastName?: string;
  role?: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  phone?: string;
  isActive?: boolean;
}

export class UserFilterDto {
  role?: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  search?: string;
  page?: number;
  limit?: number;
}
