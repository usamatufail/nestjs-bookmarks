import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User as UserType } from '@prisma/client';
import { User } from '../../auth/decorator';
import { JwtGuard } from '../../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  getMe(@User() user: UserType) {
    return user;
  }

  @Patch()
  update(@User('id') userId: number, @Body() dto: EditUserDto) {
    return this.usersService.editUser(userId, dto);
  }
}
