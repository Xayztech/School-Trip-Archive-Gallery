/**
 * SCRIPT-INDEX.JS
 * Main server entry point for School Trip Archive Gallery
 * Multi-platform compatible (Vercel, GitHub, Serverless, VPS)
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { autoTempInitializer } from './auto-temp.js';

// ✅ Load environment variables
dotenv.config();

// ✅ Auto-initialize required files and folders
await autoTempInitializer();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// ✅ Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Import Routes
import authRoutes from './routes/auth-routes.js';
import uploadRoutes from './routes/upload-routes.js';
import galleryRoutes from './routes/gallery-routes.js';
import apiRoutes from './routes/api-routes.js';

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api', apiRoutes);

// ✅ Main Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/album', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'album.html'));
});

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

app.get('/api-usage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-usage.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: ENVIRONMENT === 'development' ? err.message : 'Server error'
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗`);
  console.log(`║   🎓 SCHOOL TRIP ARCHIVE GALLERY    ║`);
  console.log(`║   ✅ Server Running Successfully    ║`);
  console.log(`║   🌐 Port: ${PORT}`);
  console.log(`║   🔧 Environment: ${ENVIRONMENT}`);
  console.log(`║   📍 URL: http://localhost:${PORT}`);
  console.log(`╚════════════════════════════════════════╝
`);
});

export default app;
