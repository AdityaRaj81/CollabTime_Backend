import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

const app = await NestFactory.create(AppModule);
const config = app.get(ConfigService);
app.setGlobalPrefix('');
app.use(cookieParser());
app.enableCors({ origin: config.get('frontendOrigin'), credentials: true });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
app.useGlobalFilters(new HttpExceptionFilter());
await app.listen(config.get('port'));
