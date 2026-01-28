// src/routes/setup.js
import express from 'express';
import { getOne } from '../db/helpers.js';
import userService from '../services/user.service.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// 檢查系統是否已初始化（是否有任何用戶）
router.get('/status', async (req, res) => {
  try {
    const user = await getOne('SELECT id FROM users LIMIT 1');

    res.json({
      initialized: !!user,
      registrationEnabled: process.env.ALLOW_REGISTRATION !== 'false'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 初始化設置 - 創建第一個管理員（僅當無用戶時可用）
router.post(
  '/init',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('username').trim().isLength({ min: 2 })
  ],
  async (req, res) => {
    try {
      // 驗證輸入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 檢查是否已有用戶
      const existingUser = await getOne('SELECT id FROM users LIMIT 1');
      if (existingUser) {
        return res.status(403).json({
          error: 'System already initialized'
        });
      }

      const { email, password, username } = req.body;

      // 創建管理員用戶
      const user = await userService.register({
        email,
        password,
        username
      });

      // 將用戶設為管理員
      await getOne(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id',
        ['admin', user.id]
      );

      res.status(201).json({
        message: 'Admin user created successfully',
        user: { ...user, role: 'admin' }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
