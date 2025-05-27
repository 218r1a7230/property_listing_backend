import { Request, Response } from 'express';
import User from '../models/User';
import Property from '../models/Property';

export const recommendProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, recipientEmail } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }
    
    await User.findByIdAndUpdate(recipient._id, {
      $push: {
        recommendationsReceived: {
          property: propertyId,
          recommendedBy: req.user._id
        }
      }
    });
    
    res.status(200).json({ message: 'Property recommended successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id)
      .populate('recommendationsReceived.property')
      .populate('recommendationsReceived.recommendedBy', 'name email');
    
    res.json(user?.recommendationsReceived || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};