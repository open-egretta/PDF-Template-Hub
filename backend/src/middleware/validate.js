// src/middleware/validate.js
import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 註冊驗證
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  validateRequest
];

// 登入驗證
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

// 修改密碼驗證
export const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('New password must contain a number'),
  validateRequest
];

// Admin 建立用戶驗證
export const validateCreateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  validateRequest
];

// 更新使用者驗證
export const validateUpdateUser = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  validateRequest
];