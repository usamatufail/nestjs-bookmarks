import { Controller, Get, UseGuards } from '@nestjs/common';
import { User as UserType } from '@prisma/client';
import { User } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@User() user: UserType) {
    return user;
  }
}
