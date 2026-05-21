/**
 * API-ROUTES.JS
 * General API endpoints and documentation
 */

import express from 'express';

const router = express.Router();

// ✅ API Status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ API Info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'School Trip Archive Gallery API',
    description: 'Multi-platform deployment ready API for gallery management',
    version: '1.0.0',
    author: 'S.H.A',
    endpoints: {
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        guestMode: 'POST /api/auth/guest',
        verifyToken: 'POST /api/auth/verify'
      },
      uploads: {
        uploadFile: 'POST /api/upload/file',
        listUploads: 'GET /api/upload/list',
        getUpload: 'GET /api/upload/:id',
        updateUpload: 'PUT /api/upload/:id',
        deleteUpload: 'DELETE /api/upload/:id'
      },
      gallery: {
        publicGallery: 'GET /api/gallery/public',
        randomImages: 'GET /api/gallery/random',
        searchGallery: 'GET /api/gallery/search'
      }
    }
  });
});

// ✅ Supported methods
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.json({ supported: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] });
});

export default router;
