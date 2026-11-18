import { Catch, HttpException } from '@nestjs/common';
import { error } from './response.js';

export class HttpExceptionFilter {
  catch(exception, host) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof payload === 'object' && payload?.message
      ? (Array.isArray(payload.message) ? payload.message.join(' ') : payload.message)
      : 'Internal server error.';
    response.status(status).json(error(message));
  }
}
Catch()(HttpExceptionFilter);
