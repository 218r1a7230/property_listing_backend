import { Request, Response } from 'express';
import Property from '../models/Property';
import redisClient from '../config/redis';

interface ErrorWithMessage {
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

export const searchProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await Property.find({});
    res.json({ properties });
  } catch (error: unknown) {
    const message = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json(property);
  } catch (error: unknown) {
    const message = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const property = new Property({
      ...req.body,
      createdBy: req.user._id
    });
    await property.save();
    res.status(201).json(property);
  } catch (error: unknown) {
    const message = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!property) {
      res.status(404).json({ error: 'Property not found or unauthorized' });
      return;
    }
    res.json(property);
  } catch (error: unknown) {
    const message = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!property) {
      res.status(404).json({ error: 'Property not found or unauthorized' });
      return;
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error: unknown) {
    const message = isErrorWithMessage(error) ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
};