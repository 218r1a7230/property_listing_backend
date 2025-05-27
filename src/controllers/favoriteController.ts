import { Request, Response } from 'express';
import User from '../models/User';
import Property from '../models/Property';

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: propertyId } }
    );
    
    res.status(200).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: propertyId } }
    );
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user?.favorites || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};