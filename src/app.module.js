import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration.js';
import { UsersModule } from './users/users.module.js';
import { UsersService } from './users/users.service.js';
import { User, UserSchema } from './users/user.schema.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.controller.js';
import { JwtAuthGuard } from './auth/auth.guard.js';
import { UsersController } from './users/users.controller.js';
import { DashboardController } from './dashboard/dashboard.controller.js';
import { JwtService } from '@nestjs/jwt';

export class AppModule {}
Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config) => ({ uri: config.get('mongoUri') }) }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config) => ({ secret: config.get('jwtAccessSecret'), signOptions: { expiresIn: config.get('accessTokenTtl') } }) }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    UsersModule,
  ],
  controllers: [AuthController, UsersController, DashboardController],
  providers: [
    { provide: AuthService, useFactory: (users, jwt, config) => new AuthService(users, jwt, config), inject: [UsersService, JwtService, ConfigService] },
    { provide: JwtAuthGuard, useFactory: (jwt, users) => new JwtAuthGuard(jwt, users), inject: [JwtService, UsersService] },
    { provide: AuthController, useFactory: (auth) => new AuthController(auth), inject: [AuthService] },
  ],
})(AppModule);
