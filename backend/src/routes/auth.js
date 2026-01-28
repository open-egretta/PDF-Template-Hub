// src/routes/auth.js
import express from 'express';
import userService from '../services/user.service.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

// 註冊
router.post('/register', validateRegister, async (req, res) => {
  // 檢查是否允許註冊
  if (process.env.ALLOW_REGISTRATION === 'false') {
    return res.status(403).json({ error: 'Registration is disabled' });
  }

  try {
    const { email, password, username, organizationId } = req.body;
    
    const user = await userService.register({
      email,
      password,
      username,
      organizationId
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 登入
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { user, token } = await userService.login(email, password);
    
    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 驗證 token（取得當前使用者資訊）
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userService.getById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 登出（前端刪除 token 即可，後端可選實作）
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;