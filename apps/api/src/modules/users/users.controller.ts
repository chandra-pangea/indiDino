// HTTP routes for listing and fetching demo users.
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users — list all demo users.
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/:id — fetch one user by id.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
