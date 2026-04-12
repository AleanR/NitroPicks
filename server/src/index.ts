import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.MONGO_DB_URL && !process.env.MONGODB_URI) {
  dotenv.config(); // fallback to server-local .env
}

const app = express();

const envAllowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'https://nitropicks.xyz',
  'https://www.nitropicks.xyz',
  ...envAllowedOrigins,
]);

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      allowedOrigins.has(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.Promise = Promise;
const mongoUri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
if (!mongoUri) throw new Error('No MongoDB URI found in environment variables');
mongoose.connect(mongoUri);

mongoose.connection.on('error', (error: Error) => console.log(error));

app.use('/api', router());

// Serve the built React client in production only
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
