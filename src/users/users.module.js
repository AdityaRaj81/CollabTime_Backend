import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema.js';
import { UsersService } from './users.service.js';
import { getModelToken } from '@nestjs/mongoose';

export class UsersModule {}
Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [{ provide: UsersService, useFactory: (model) => new UsersService(model), inject: [getModelToken(User.name)] }],
  exports: [UsersService, MongooseModule],
})(UsersModule);
