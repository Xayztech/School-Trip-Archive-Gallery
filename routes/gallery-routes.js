/**
 * GALLERY-ROUTES.JS
 * Gallery viewing, search, and random image endpoints
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metadataFile = path.join(__dirname, '../auth/uploads-metadata.json');

// ✅ Helper: Read metadata
function readMetadata() {
  try {
    const data = fs.readFileSync(metadataFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ✅ Helper: Get public uploads
function getPublicUploads() {
  const metadata = readMetadata();
  return metadata.filter(u => u.visibility === 'public');
}

// ✅ PUBLIC GALLERY Endpoint (with pagination)
router.get('/public', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const publicUploads = getPublicUploads();
    const total = publicUploads.length;
    const totalPages = Math.ceil(total / limit);
    
    const data = publicUploads.slice(skip, skip + limit);
    
    res.json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery',
      error: error.message
    });
  }
});

// ✅ RANDOM IMAGES Endpoint
router.get('/random', (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 4, 20); // Max 20
    const publicUploads = getPublicUploads();
    
    if (publicUploads.length === 0) {
      return res.json({
        success: true,
        message: 'No public images available',
        data: []
      });
    }
    
    const randomImages = [];
    for (let i = 0; i < Math.min(count, publicUploads.length); i++) {
      const randomIndex = Math.floor(Math.random() * publicUploads.length);
      randomImages.push(publicUploads[randomIndex]);
    }
    
    res.json({
      success: true,
      message: `Generated ${randomImages.length} random images`,
      data: randomImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random images',
      error: error.message
    });
  }
});

// ✅ SEARCH GALLERY Endpoint
router.get('/search', (req, res) => {
  try {
    const { q, author, minDate, maxDate, page = 1, limit = 10 } = req.query;
    let publicUploads = getPublicUploads();
    
    // Filter by search query
    if (q) {
      const searchTerm = q.toLowerCase();
      publicUploads = publicUploads.filter(u => 
        u.description.toLowerCase().includes(searchTerm) ||
        u.fullName.toLowerCase().includes(searchTerm) ||
        u.originalName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by author
    if (author) {
      publicUploads = publicUploads.filter(u => 
        u.fullName.toLowerCase() === author.toLowerCase()
      );
    }
    
    // Filter by date range
    if (minDate) {
      const minDateTime = new Date(minDate).getTime();
      publicUploads = publicUploads.filter(u => 
        new Date(u.uploadedAt).getTime() >= minDateTime
      );
    }
    
    if (maxDate) {
      const maxDateTime = new Date(maxDate).getTime();
      publicUploads = publicUploads.filter(u => 
        new Date(u.uploadedAt).getTime() <= maxDateTime
      );
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    const total = publicUploads.length;
    const totalPages = Math.ceil(total / limit);
    const data = publicUploads.slice(skip, skip + limit);
    
    res.json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

export default router;
