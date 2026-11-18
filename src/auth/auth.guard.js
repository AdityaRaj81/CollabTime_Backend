import { Injectable, UnauthorizedException } from '@nestjs/common';

export class JwtAuthGuard {
  constructor(jwtService, usersService) {
    this.jwtService = jwtService;
    this.usersService = usersService;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.accessToken || request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Authentication is required.');
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.accountStatus !== 'ACTIVE') throw new UnauthorizedException('Authentication is required.');
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Authentication is required.');
    }
  }
}
Injectable()(JwtAuthGuard);
