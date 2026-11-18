import { Injectable, UseGuards } from '@nestjs/common';
import { success } from '../common/response.js';
import { decorateController, decorateGet, decorateRequest } from '../common/decorators.js';
import { JwtAuthGuard } from '../auth/auth.guard.js';

export class DashboardController {
  async getDashboard(request) {
    const user = request.user;
    return success('Dashboard data retrieved successfully.', {
      welcomeMessage: `Welcome back, ${user.fullName}!`,
      fullName: user.fullName, role: user.role, accountStatus: user.accountStatus,
    });
  }
}
Injectable()(DashboardController);
decorateController(DashboardController, 'api/v1/dashboard');
decorateGet(DashboardController, 'getDashboard', ''); decorateRequest(DashboardController, 'getDashboard', 0);
UseGuards(JwtAuthGuard)(DashboardController);
