import express from 'express';
import { 
  login, 
  register 
} from '../controllers/authController';
import { 
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties
} from '../controllers/propertyController';
import { 
  addFavorite,
  removeFavorite,
  getFavorites
} from '../controllers/favoriteController';
import { 
  recommendProperty,
  getRecommendations
} from '../controllers/recommendationController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Property routes
router.get('/properties', searchProperties);
router.get('/properties/:id', getProperty);
router.post('/properties', authMiddleware, createProperty);
router.put('/properties/:id', authMiddleware, updateProperty);
router.delete('/properties/:id', authMiddleware, deleteProperty);

// Favorite routes
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites/:propertyId', authMiddleware, addFavorite);
router.delete('/favorites/:propertyId', authMiddleware, removeFavorite);

// Recommendation routes
router.post('/recommend', authMiddleware, recommendProperty);
router.get('/recommendations', authMiddleware, getRecommendations);

export default router;