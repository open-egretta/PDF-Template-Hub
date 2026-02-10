import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getMany, getOne, transaction } from '../db/helpers.js';
import { clearFontCache } from '../services/template.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/fonts');

const router = express.Router();

// Multer 設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uuid = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid}${ext}`);
  },
});

const allowedExtensions = ['.ttf', '.otf', '.otc'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('只允許上傳 .ttf, .otf, .otc 格式的字型檔'));
    }
    cb(null, true);
  },
});

// GET /api/fonts - 取得所有字型列表
router.get('/', async (req, res) => {
  try {
    const fonts = await getMany('SELECT * FROM fonts ORDER BY is_builtin DESC, id ASC');
    const data = fonts.map(f => ({
      ...f,
      download_url: f.is_builtin ? null : `/api/fonts/static/${f.file_name}`,
    }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/fonts - 上傳新字型 (Admin only)
router.post('/', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      // 刪除已上傳的檔案
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ error: '請提供字型名稱' });
    }

    if (!file) {
      return res.status(400).json({ error: '請上傳字型檔案' });
    }

    // 檢查名稱是否已存在
    const existing = await getOne('SELECT id FROM fonts WHERE name = $1', [name.trim()]);
    if (existing) {
      fs.unlinkSync(file.path);
      return res.status(409).json({ error: '字型名稱已存在' });
    }

    let result;
    await transaction(async (client) => {
      const queryResult = await client.query(
        `INSERT INTO fonts (name, file_name, original_name, file_size, is_builtin, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name.trim(), file.filename, file.originalname, file.size, false, req.user.id]
      );
      result = queryResult.rows[0];
    });

    clearFontCache();
    res.status(201).json({ data: result });
  } catch (error) {
    // 上傳失敗時清除檔案
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/fonts/:id - 刪除自訂字型 (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const font = await getOne('SELECT * FROM fonts WHERE id = $1', [req.params.id]);

    if (!font) {
      return res.status(404).json({ error: '字型不存在' });
    }

    if (font.is_builtin) {
      return res.status(403).json({ error: '無法刪除內建字型' });
    }

    await transaction(async (client) => {
      await client.query('DELETE FROM fonts WHERE id = $1', [req.params.id]);
    });

    // 刪除檔案
    const filePath = path.join(uploadDir, font.file_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    clearFontCache();
    res.json({ message: '字型已刪除', data: font });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fonts/:id/file - 取得字型檔案
router.get('/:id/file', async (req, res) => {
  try {
    const font = await getOne('SELECT * FROM fonts WHERE id = $1', [req.params.id]);

    if (!font) {
      return res.status(404).json({ error: '字型不存在' });
    }

    const filePath = path.join(uploadDir, font.file_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '字型檔案不存在' });
    }

    const ext = path.extname(font.file_name).toLowerCase();
    const mimeTypes = {
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };

    res.set({
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${font.original_name}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
