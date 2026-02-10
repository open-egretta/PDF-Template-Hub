// app.js
import express from "express";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db/helpers.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import templateRoutes from './routes/templates.js';
import setupRoutes from './routes/setup.js';
import fontRoutes from './routes/fonts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 確保 uploads/fonts 目錄存在
const uploadsFontsDir = path.join(__dirname, '../uploads/fonts');
fs.mkdirSync(uploadsFontsDir, { recursive: true });

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 靜態檔案：字型（UUID 命名，immutable 快取）
app.use('/api/fonts/static', express.static(uploadsFontsDir, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/fonts', fontRoutes);

// 自動建立 fonts 表
async function initDB() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS fonts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        is_builtin BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Fonts table ready');
  } catch (error) {
    console.error('Failed to init fonts table:', error.message);
  }
}
initDB();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});