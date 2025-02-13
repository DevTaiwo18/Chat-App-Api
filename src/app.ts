import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;