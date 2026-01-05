import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../../database/database.module'
import { UserAddressController } from './controllers/user-address.controller'
import { UsersController } from './users.controller'
import { UserObserver } from './observers/user.observer'
import { UserAddressService } from './services/user-address.service'
import { UsersService } from './users.service'

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'lead-queue',
    }),
  ],
  controllers: [UsersController, UserAddressController],
  providers: [UsersService, UserAddressService, UserObserver],
  exports: [UsersService, UserAddressService],
})
export class UsersModule {}
