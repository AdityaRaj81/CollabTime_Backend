import { Prop, SchemaFactory } from '@nestjs/mongoose';

export const UserRole = Object.freeze({ CREATOR: 'CREATOR', BRAND: 'BRAND', ADMIN: 'ADMIN' });
export const AccountStatus = Object.freeze({
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
});

export class User {
  constructor() {
    this.role = UserRole.CREATOR;
    this.accountStatus = AccountStatus.PENDING_VERIFICATION;
    this.emailVerified = false;
    this.phoneVerified = false;
  }
}

Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 120 })(User.prototype, 'fullName');
Prop({ type: String, lowercase: true, trim: true, sparse: true, unique: true })(User.prototype, 'email');
Prop({ type: String, trim: true, sparse: true, unique: true })(User.prototype, 'phoneNumber');
Prop({ type: String, required: true, select: false })(User.prototype, 'passwordHash');
Prop({ type: String, enum: Object.values(UserRole), default: UserRole.CREATOR })(User.prototype, 'role');
Prop({ type: String, enum: Object.values(AccountStatus), default: AccountStatus.PENDING_VERIFICATION })(User.prototype, 'accountStatus');
Prop({ type: Boolean, default: false })(User.prototype, 'emailVerified');
Prop({ type: Boolean, default: false })(User.prototype, 'phoneVerified');
Prop({ type: Date, required: true })(User.prototype, 'termsAcceptedAt');
Prop({ type: String, select: false })(User.prototype, 'emailVerificationTokenHash');
Prop({ type: Date, select: false })(User.prototype, 'emailVerificationExpiresAt');
Prop({ type: String, select: false })(User.prototype, 'refreshTokenHash');

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('timestamps', true);
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
UserSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email || null,
    phoneNumber: this.phoneNumber || null,
    role: this.role,
    accountStatus: this.accountStatus,
    emailVerified: this.emailVerified,
    phoneVerified: this.phoneVerified,
  };
};
