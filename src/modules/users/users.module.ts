import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { UserAddressController } from './controllers/user-address.controller'
import { UsersController } from './users.controller'
import { UserAddressService } from './services/user-address.service'
import { UsersService } from './users.service'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, UserAddressController],
  providers: [UsersService, UserAddressService],
  exports: [UsersService, UserAddressService],
})
export class UsersModule {}

