// src/services/userService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getOne, getMany, query } from '../db/helpers.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

class UserService {
  // 註冊
  async register({ email, password, username, organizationId = null }) {
    // 檢查 email 是否已存在
    const existingUser = await getOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // 建立使用者
    const user = await getOne(
      `INSERT INTO users (email, password, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, role, created_at`,
      [email, passwordHash, username]
    );
    
    return user;
  }
  
  // 登入
  async login(email, password) {
    // 查詢使用者
    const user = await getOne(
      `SELECT id, email, username, password, role, is_active
       FROM users
       WHERE email = $1`,
      [email]
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.is_active) {
      throw new Error('Account is inactive');
    }
    
    // 驗證密碼
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // 生成 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 移除密碼 hash
    delete user.password;
    
    return { user, token };
  }
  
  // 取得使用者資訊
  async getById(id) {
    const user = await getOne(
      `SELECT id, email, username, role, created_at, is_active
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  // 取得所有使用者（管理員功能）
  async getAll(organizationId = null) {
    const sql = organizationId
      ? `SELECT id, email, username, role, organization_id, is_active, created_at, last_login
         FROM users
         WHERE organization_id = $1
         ORDER BY created_at DESC`
      : `SELECT id, email, username, role, organization_id, is_active, created_at, last_login
         FROM users
         ORDER BY created_at DESC`;
    
    const params = organizationId ? [organizationId] : [];
    return await getMany(sql, params);
  }
  
  // 更新使用者資訊
  async update(id, { username, email }) {
    const user = await getOne(
      `UPDATE users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           updated_at = NOW()
       WHERE id = $3 AND is_active = true
       RETURNING id, email, username, role, organization_id, updated_at`,
      [username, email, id]
    );
    
    if (!user) {
      throw new Error('User not found or inactive');
    }
    
    return user;
  }
  
  // 修改密碼
  async changePassword(id, oldPassword, newPassword) {
    // 取得當前密碼
    const user = await getOne(
      'SELECT password FROM users WHERE id = $1',
      [id]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // 驗證舊密碼
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) {
      throw new Error('Invalid old password');
    }
    
    // Hash 新密碼
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // 更新密碼
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, id]
    );
    
    return { message: 'Password changed successfully' };
  }
  
  // 刪除使用者（軟刪除）
  async delete(id) {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
    
    return { message: 'User deleted successfully' };
  }
  
  // 驗證 Token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new UserService();