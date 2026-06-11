import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import channelRoutes from './routes/channelRoutes.js';
import { autoSeedChannels } from './services/seedService.js';
import { validateAllChannels } from './services/channelValidator.js';

// Trigger restart for re-seed
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/channels', channelRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await autoSeedChannels();
  validateAllChannels(true); // Perform a fresh deep check on everything
});
