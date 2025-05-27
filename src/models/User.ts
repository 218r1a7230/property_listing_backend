import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
  recommendationsReceived: Array<{
    property: mongoose.Types.ObjectId;
    recommendedBy: mongoose.Types.ObjectId;
    date?: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  recommendationsReceived: [{
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>('User', UserSchema);