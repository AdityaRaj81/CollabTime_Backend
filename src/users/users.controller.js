import { Injectable, UseGuards } from '@nestjs/common';
import { success } from '../common/response.js';
import { decorateController, decorateGet, decorateRequest } from '../common/decorators.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

export class UsersController {
  async me(request) { return success('Current user retrieved successfully.', request.user.toSafeObject()); }
}
Injectable()(UsersController);
decorateController(UsersController, 'api/v1/users');
decorateGet(UsersController, 'me', 'me'); decorateRequest(UsersController, 'me', 0);
UseGuards(JwtAuthGuard)(UsersController);
