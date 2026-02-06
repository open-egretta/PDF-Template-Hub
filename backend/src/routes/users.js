// src/routes/users.js
import express from 'express';
import userService from '../services/user.service.js';
import { 
  authenticate, 
  requireAdmin, 
  requireOwnerOrAdmin 
} from '../middleware/auth.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword
} from '../middleware/validate.js';

const router = express.Router();

// 所有路由都需要認證
router.use(authenticate);

// Admin 建立用戶
router.post('/', requireAdmin, validateCreateUser, async (req, res) => {
  try {
    const { email, password, username, role } = req.body;
    const user = await userService.createUser({ email, password, username, role });
    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 取得所有使用者（僅管理員）
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const users = await userService.getAll(organizationId);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 取得單一使用者
router.get('/:id', requireOwnerOrAdmin, async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// 更新使用者資訊
router.put('/:id', requireOwnerOrAdmin, validateUpdateUser, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await userService.update(req.params.id, { username, email });
    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 修改密碼
router.post('/:id/change-password', requireOwnerOrAdmin, validateChangePassword, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      req.params.id, 
      oldPassword, 
      newPassword
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 刪除使用者（軟刪除，僅管理員）
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await userService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;