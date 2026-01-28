// src/middleware/auth.js
import userService from '../services/user.service.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    
    // 驗證使用者是否仍存在且啟用
    const user = await userService.getById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // 將使用者資訊附加到 request
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Invalid token' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: error.message });
  }
};

// 檢查管理員權限
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// 檢查是否為本人或管理員
export const requireOwnerOrAdmin = (req, res, next) => {
  const targetUserId = parseInt(req.params.id, 10);
  
  if (req.user.id !== targetUserId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};