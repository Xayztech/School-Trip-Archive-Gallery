/**
 * AUTH-ROUTES.JS
 * Authentication endpoints: signup, login, logout, guest mode
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ File paths
const accountsFile = path.join(__dirname, '../auth/accounts/accounts.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// ✅ Helper: Read accounts
function readAccounts() {
  try {
    const data = fs.readFileSync(accountsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// ✅ Helper: Write accounts
function writeAccounts(accounts) {
  fs.writeFileSync(accountsFile, JSON.stringify(accounts, null, 2), 'utf8');
}

// ✅ Helper: Generate token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

// ✅ Helper: Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ✅ SIGNUP Endpoint
router.post('/signup', async (req, res) => {
  try {
    const { fullName, nickname, age, username, password, email } = req.body;
    
    // Validation
    if (!fullName || !nickname || !age || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    const accounts = readAccounts();
    
    // Check if username exists
    if (accounts.some(acc => acc.username === username)) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      fullName,
      nickname,
      age: parseInt(age),
      username,
      password: hashedPassword,
      email: email || '',
      profileImage: '',
      theme: 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to accounts
    accounts.push(newUser);
    writeAccounts(accounts);
    
    // Generate token
    const token = generateToken(newUser);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        nickname: newUser.nickname,
        username: newUser.username,
        profileImage: newUser.profileImage
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// ✅ LOGIN Endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const accounts = readAccounts();
    const user = accounts.find(acc => acc.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        nickname: user.nickname,
        username: user.username,
        profileImage: user.profileImage,
        theme: user.theme
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// ✅ LOGOUT Endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ✅ GUEST MODE Endpoint
router.post('/guest', (req, res) => {
  const guestToken = jwt.sign(
    { id: 'guest-' + uuidv4(), username: 'guest', isGuest: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    message: 'Guest mode activated',
    token: guestToken,
    user: {
      id: 'guest',
      username: 'guest',
      isGuest: true
    }
  });
});

// ✅ VERIFY TOKEN Endpoint
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  res.json({
    success: true,
    message: 'Token is valid',
    user: decoded
  });
});

export default router;
