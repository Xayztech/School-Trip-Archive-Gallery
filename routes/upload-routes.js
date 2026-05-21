/**
 * UPLOAD-ROUTES.JS
 * File upload management endpoints
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const visibility = req.body.visibility || 'public';
    const folder = visibility === 'private' ? 'pv-img' : 'img';
    const uploadPath = path.join(__dirname, `../public/${folder}`);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    const allowedExt = (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif,webp,mp4,mkv').split(',');
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    
    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} not allowed`));
    }
  }
});

// ✅ Metadata file path
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

// ✅ Helper: Write metadata
function writeMetadata(data) {
  fs.writeFileSync(metadataFile, JSON.stringify(data, null, 2), 'utf8');
}

// ✅ UPLOAD FILE Endpoint
router.post('/file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }
    
    const { fullName, description, visibility } = req.body;
    const uploadId = uuidv4();
    const uploadData = {
      id: uploadId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fullName: fullName || 'Anonymous',
      description: description || '',
      visibility: visibility || 'public',
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      url: `/img/${req.file.filename}`,
      rawUrl: `${process.env.DOMAIN || 'http://localhost:3000'}/img/${req.file.filename}`
    };
    
    // Save metadata
    const metadata = readMetadata();
    metadata.push(uploadData);
    writeMetadata(metadata);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: uploadData
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// ✅ LIST UPLOADS Endpoint
router.get('/list', (req, res) => {
  try {
    const metadata = readMetadata();
    res.json({
      success: true,
      count: metadata.length,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to read uploads',
      error: error.message
    });
  }
});

// ✅ GET UPLOAD Endpoint
router.get('/:id', (req, res) => {
  try {
    const metadata = readMetadata();
    const upload = metadata.find(u => u.id === req.params.id);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload',
      error: error.message
    });
  }
});

// ✅ UPDATE UPLOAD Endpoint
router.put('/:id', (req, res) => {
  try {
    const { visibility, description } = req.body;
    const metadata = readMetadata();
    const uploadIndex = metadata.findIndex(u => u.id === req.params.id);
    
    if (uploadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    if (visibility) metadata[uploadIndex].visibility = visibility;
    if (description) metadata[uploadIndex].description = description;
    metadata[uploadIndex].updatedAt = new Date().toISOString();
    
    writeMetadata(metadata);
    
    res.json({
      success: true,
      message: 'Upload updated successfully',
      data: metadata[uploadIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// ✅ DELETE UPLOAD Endpoint
router.delete('/:id', (req, res) => {
  try {
    const metadata = readMetadata();
    const uploadIndex = metadata.findIndex(u => u.id === req.params.id);
    
    if (uploadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    const upload = metadata[uploadIndex];
    const filePath = path.join(__dirname, `../public${upload.url}`);
    
    // Delete file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove metadata
    metadata.splice(uploadIndex, 1);
    writeMetadata(metadata);
    
    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

export default router;
