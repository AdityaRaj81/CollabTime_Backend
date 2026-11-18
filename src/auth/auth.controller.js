import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { success } from '../common/response.js';
import { decorateBody, decorateController, decorateMethodGuard, decoratePost, decorateRequest, decorateResponse } from '../common/decorators.js';
import { JwtAuthGuard } from './auth.guard.js';

export class AuthController {
  constructor(authService) { this.authService = authService; }
  async signup(body) {
    validateSignup(body);
    const result = await this.authService.signup(body);
    return success('Account created successfully. Please verify your email.', {
      email: result.email, accountStatus: result.accountStatus, verificationToken: process.env.NODE_ENV === 'production' ? undefined : result.verificationToken,
    });
  }
  async verifyEmail(body) {
    await this.authService.verifyEmail(body.token);
    return success('Email verified successfully.');
  }
  async login(body, response) {
    if (!body?.email || !body?.password) throw new BadRequestException('Email and password are required.');
    const result = await this.authService.login(body.email, body.password);
    const secure = process.env.NODE_ENV === 'production';
    response.cookie('accessToken', result.accessToken, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
    response.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return success('Login successful', { user: result.user.toSafeObject() });
  }
  async logout(request, response) {
    if (request.user) await this.authService.logout(request.user._id);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return success('Logout successful');
  }
}
Injectable()(AuthController);
UseGuards(ThrottlerGuard)(AuthController);
decorateController(AuthController, 'api/v1/auth');
decoratePost(AuthController, 'signup', 'signup'); decorateBody(AuthController, 'signup', 0); decorateResponse(AuthController, 'signup', 1);
decoratePost(AuthController, 'verifyEmail', 'verify-email'); decorateBody(AuthController, 'verifyEmail', 0);
decoratePost(AuthController, 'login', 'login'); decorateBody(AuthController, 'login', 0); decorateResponse(AuthController, 'login', 1);
decoratePost(AuthController, 'logout', 'logout'); decorateRequest(AuthController, 'logout', 0); decorateResponse(AuthController, 'logout', 1);
decorateMethodGuard(AuthController, 'logout', JwtAuthGuard);

function validateSignup(body = {}) {
  if (!body.fullName?.trim()) throw new BadRequestException('Full name is required.');
  if (!body.email && !body.phoneNumber) throw new BadRequestException('An email address or phone number is required.');
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new BadRequestException('Please provide a valid email address.');
  if (body.phoneNumber && !/^\+?[0-9\s-]{7,15}$/.test(body.phoneNumber)) throw new BadRequestException('Please provide a valid phone number.');
  if (!body.password || body.password.length < 8 || !/[A-Za-z]/.test(body.password) || !/[0-9]/.test(body.password)) {
    throw new BadRequestException('Password must be at least 8 characters and include a letter and a number.');
  }
}
