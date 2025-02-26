import express from 'express';
import { 
    sendMessage, 
    getMessages, 
    getUnreadCount, 
    getConversations 
} from '../controllers/messageController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);

router.post('/send', sendMessage);

router.get('/match/:matchId', getMessages);

router.get('/unread', getUnreadCount);

router.get('/conversations', getConversations);

export default router;