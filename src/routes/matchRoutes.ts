import express from 'express';
import { getPotentialMatches, likeOrPassUser, getMatches } from '../controllers/matchController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// All routes are protected and require authentication
router.use(authenticateUser);

// Get potential matches
router.get('/potential', getPotentialMatches);

// Like or pass a user
router.post('/action', likeOrPassUser);

// Get all matches (mutual likes)
router.get('/', getMatches);

export default router;