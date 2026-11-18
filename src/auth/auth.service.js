import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { AccountStatus } from '../users/user.schema.js';

export class AuthService {
  constructor(usersService, jwtService, configService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
    this.config = configService;
  }

  async signup({ fullName, email, phoneNumber, password, termsAccepted }) {
    if (!termsAccepted) throw new ConflictException('You must accept the Terms and Conditions.');
    if (!email && !phoneNumber) throw new ConflictException('An email address or phone number is required.');
    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail && await this.usersService.findByEmail(normalizedEmail)) {
      throw new ConflictException('An account already exists with that email.');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.usersService.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber?.trim() || undefined,
      passwordHash,
      termsAcceptedAt: new Date(),
      emailVerificationTokenHash: this.hashToken(verificationToken),
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { email: user.email, accountStatus: user.accountStatus, verificationToken };
  }

  async verifyEmail(token) {
    const hash = this.hashToken(token);
    const user = await this.usersService.model.findOne({
      emailVerificationTokenHash: hash,
      emailVerificationExpiresAt: { $gt: new Date() },
    }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');
    if (!user) throw new UnauthorizedException('The verification link is invalid or expired.');
    user.emailVerified = true;
    user.accountStatus = AccountStatus.ACTIVE;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();
    return user;
  }

  async login(email, password) {
    const user = await this.usersService.findByEmail(email, true);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (user.accountStatus !== AccountStatus.ACTIVE || !user.emailVerified) {
      throw new UnauthorizedException('Please verify your account before logging in.');
    }
    const accessToken = await this.jwtService.signAsync({ sub: user._id.toString(), role: user.role });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user._id.toString(), type: 'refresh' },
      { secret: this.config.get('jwtRefreshSecret'), expiresIn: this.config.get('refreshTokenTtl') },
    );
    user.refreshTokenHash = this.hashToken(refreshToken);
    await user.save();
    return { user, accessToken, refreshToken };
  }

  async logout(id) {
    const user = await this.usersService.findById(id, true);
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
Injectable()(AuthService);
