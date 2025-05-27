import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import User from '../models/User';

interface ErrorWithMessage extends Error {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }
    
    const user = new User({ name, email, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: '7d'
    });
    
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (error: unknown) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: '7d'
    });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error: unknown) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
};