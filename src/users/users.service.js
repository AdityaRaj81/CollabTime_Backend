import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from './user.schema.js';

export class UsersService {
  constructor(model) {
    this.model = model;
  }

  async findByEmail(email, includeSecrets = false) {
    const query = this.model.findOne({ email: email.toLowerCase().trim() });
    if (includeSecrets) query.select('+passwordHash +emailVerificationTokenHash +emailVerificationExpiresAt +refreshTokenHash');
    return query.exec();
  }

  async findById(id, includeSecrets = false) {
    const query = this.model.findById(id);
    if (includeSecrets) query.select('+refreshTokenHash');
    return query.exec();
  }

  async create(data) {
    try {
      return await this.model.create({ ...data, role: UserRole.CREATOR });
    } catch (exception) {
      if (exception?.code === 11000) throw new ConflictException('An account already exists with that email or phone number.');
      throw exception;
    }
  }

  async requireById(id) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
}
Injectable()(UsersService);
