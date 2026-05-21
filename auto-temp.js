/**
 * AUTO-TEMP.JS
 * Automatic file and folder initialization system
 * Creates all required directories and default files on startup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define all required folders
const requiredFolders = [
  'public',
  'public/img',
  'public/pv-img',
  'public/css',
  'public/js',
  'routes',
  'auth',
  'auth/accounts',
  'uploads',
  'logs'
];

// ✅ Define all required files with content
const requiredFiles = {
  'auth/accounts/accounts.json': JSON.stringify([
    {
      id: 'demo-user-001',
      fullName: 'Demo User',
      nickname: 'Demo',
      age: 18,
      username: 'demo',
      password: '$2b$10$demo', // bcrypt hash example
      email: 'demo@example.com',
      profileImage: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ], null, 2),
  
  'auth/uploads-metadata.json': JSON.stringify([], null, 2),
  
  '.env.example': `# ENVIRONMENT VARIABLES
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=*

# GitHub API (Optional - for auto file creation)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=Xayztech
GITHUB_REPO=School-Trip-Archive-Gallery

# Database (if using)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_trip_gallery
DB_USER=admin
DB_PASSWORD=password

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp,mp4,mkv
`,

  '.gitignore': `node_modules/
.env
.env.local
.env.*.local
dist/
build/
*.log
logs/
.DS_Store
.vscode/
.idea/
vercel.json
auth/accounts/*
!auth/accounts/accounts.json
public/pv-img/*
!public/pv-img/.gitkeep
`,

  'README.md': `# 🎓 School Trip Archive Gallery & Album System

> **Ultra Modern, Elegant, Gaming, Neon, Premium Multi-Platform Deployment Ready**

## 📚 Overview
School Trip Archive Gallery adalah sistem manajemen galeri foto terpadu yang mendukung berbagai platform deployment:
- ✅ GitHub Pages
- ✅ Vercel
- ✅ Serverless (AWS Lambda, Google Cloud)
- ✅ VPS (Digital Ocean, Linode, AWS EC2)
- ✅ Docker & Kubernetes

## 🎯 Fitur Utama

### Authentication
- 👤 Guest Mode (tanpa login)
- 📝 Sign Up (Nama Lengkap, Nickname, Umur, Username, Password)
- 🔐 Login dengan verifikasi file JSON
- 🚪 Logout & Session Management
- 🎫 JWT Token Authentication

### Gallery Management
- 📤 Upload file (Public/Private)
- 🖼️ Gallery publik dengan pagination
- 🎲 Random image showcase
- 🔍 Search & Filter
- ⚙️ Settings & Metadata management

### API Documentation
- 📚 API Docs lengkap
- 💻 Code examples (JS, Python, PHP, Java, Go, Rust, dll)
- 🔄 Multi-method support (GET, POST, PUT, DELETE)

## 🚀 Installation

\`\`\`bash
# Clone repository
git clone https://github.com/Xayztech/School-Trip-Archive-Gallery.git
cd School-Trip-Archive-Gallery

# Install dependencies
npm install

# Setup (auto create files)
npm run setup

# Copy environment
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
School-Trip-Archive-Gallery/
├── public/
│   ├── index.html
│   ├── home.html
│   ├── login.html
│   ├── signup.html
│   ├── upload.html
│   ├── album.html
│   ├── api-docs.html
│   ├── api-usage.html
│   ├── profile.html
│   ├── css/
│   │   ├── main.css
│   │   ├── auth.css
│   │   ├── home.css
│   │   ├── upload.css
│   │   ├── album.css
│   │   ├── profile.css
│   │   └── neon.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── home.js
│   │   ├── upload.js
│   │   ├── gallery.js
│   │   ├── profile.js
│   │   ├── api-client.js
│   │   └── utils.js
│   ├── img/
│   └── pv-img/
├── routes/
│   ├── auth-routes.js
│   ├── upload-routes.js
│   ├── gallery-routes.js
│   └── api-routes.js
├── auth/
│   └── accounts/
│       └── accounts.json
├── script-index.js
├── auto-temp.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
\`\`\`

## 🔌 API Endpoints

### Authentication
\`POST /api/auth/signup\` - Create new account
\`POST /api/auth/login\` - Login user
\`POST /api/auth/logout\` - Logout user
\`POST /api/auth/guest\` - Enter guest mode
\`POST /api/auth/verify\` - Verify token

### Upload
\`POST /api/upload/file\` - Upload image/file
\`GET /api/upload/list\` - List user uploads
\`GET /api/upload/:id\` - Get upload details
\`PUT /api/upload/:id\` - Update upload
\`DELETE /api/upload/:id\` - Delete upload

### Gallery
\`GET /api/gallery/public\` - Get public gallery
\`GET /api/gallery/random\` - Get random images
\`GET /api/gallery/search\` - Search gallery

## 🎨 Design Features

✨ **Ultra Modern Neon Gaming Style**
- Neon glowing text effects
- Dark mode by default
- Light mode support
- Animated transitions
- Premium glassmorphism UI
- Responsive design

## 🌐 Deployment

### Vercel
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Docker
\`\`\`bash
docker build -t school-trip-gallery .
docker run -p 3000:3000 school-trip-gallery
\`\`\`

### GitHub Pages
Push ke branch \`gh-pages\` untuk auto deploy.

## 👥 Author
**S.H.A**

## 📄 License
MIT License - feel free to use this project

## 🤝 Contributing
Contributions are welcome! Feel free to submit issues and pull requests.

---

**Made with ❤️ by S.H.A**
`
};

// ✅ Main initialization function
export async function autoTempInitializer() {
  try {
    console.log('\n🔧 Starting auto-initialization...');
    
    // Create all required folders
    console.log('📁 Creating folders...');
    for (const folder of requiredFolders) {
      const folderPath = path.join(__dirname, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`  ✅ Created: ${folder}`);
      } else {
        console.log(`  ⏭️  Already exists: ${folder}`);
      }
    }
    
    // Create all required files
    console.log('\n📝 Creating files...');
    for (const [filePath, content] of Object.entries(requiredFiles)) {
      const fullPath = path.join(__dirname, filePath);
      const fileDir = path.dirname(fullPath);
      
      // Ensure directory exists
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✅ Created: ${filePath}`);
      } else {
        console.log(`  ⏭️  Already exists: ${filePath}`);
      }
    }
    
    // Create .gitkeep files for empty directories
    console.log('\n🔐 Creating .gitkeep files...');
    const gitkeepFolders = ['public/img', 'public/pv-img', 'uploads', 'logs'];
    for (const folder of gitkeepFolders) {
      const gitkeepPath = path.join(__dirname, folder, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '', 'utf8');
        console.log(`  ✅ Created: ${folder}/.gitkeep`);
      }
    }
    
    console.log('\n✅ Auto-initialization completed successfully!');
    console.log('📌 Next steps:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Update your configuration in .env');
    console.log('   3. Run: npm start\n');
    
  } catch (error) {
    console.error('\n❌ Auto-initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initializer if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  autoTempInitializer().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
