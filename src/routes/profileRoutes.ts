import express from 'express';
import { 
  createProfile,
  getProfile, 
  updateProfile, 
  uploadProfilePicture 
} from '../controllers/profileController';
import { authenticateUser } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Routes remain exactly the same
router.use(authenticateUser);

router.post('/me', createProfile);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.post('/me/picture', upload.single('picture'), uploadProfilePicture);

export default router;