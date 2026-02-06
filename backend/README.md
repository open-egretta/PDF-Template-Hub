# PDF-Template-Hub Backend

PDF 模板管理系統後端服務，使用 Express.js + PostgreSQL 建構。

## 開發環境版本

- **Node.js** >= 24.x
- **npm** >= 11.x
- **PostgreSQL** >= 17.x

## 安裝步驟

### 1. 安裝依賴

```bash
cd backend
npm install
```

### 2. 設定環境變數

複製範例檔案：

```bash
cp .env.example .env
```

編輯 `.env`：

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_template
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT
JWT_SECRET=your_jwt_secret

# Features
ALLOW_REGISTRATION=false
```

### 3. 建立資料庫

參考 `init.sql`：

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  schema TEXT,
  description TEXT,
  thumbnail TEXT,
  view VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 4. 啟動服務

```bash
# 開發模式 (支援 hot reload)
npm run dev
```

服務預設運行在 `http://localhost:3001`

### 5. 初始化管理員帳號

首次啟動後，呼叫初始化 API 建立管理員：

```bash
curl -X POST http://localhost:3001/api/setup/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password",
    "username": "admin"
  }'
```

## API 端點

### 系統設定

| 方法 | 路徑                | 說明               | 權限     |
| ---- | ------------------- | ------------------ | -------- |
| GET  | `/api/setup/status` | 檢查系統初始化狀態 | 公開     |
| POST | `/api/setup/init`   | 初始化管理員帳號   | 僅限首次 |

### 認證

| 方法 | 路徑                 | 說明 | 權限          |
| ---- | -------------------- | ---- | ------------- |
| POST | `/api/auth/login`    | 登入 | 公開          |
| POST | `/api/auth/register` | 註冊 | 公開 (可關閉) |

### 使用者管理

| 方法   | 路徑                            | 說明     | 權限         |
| ------ | ------------------------------- | -------- | ------------ |
| POST   | `/api/users`                    | 建立用戶 | 管理員       |
| GET    | `/api/users`                    | 取得所有用戶 | 管理員   |
| GET    | `/api/users/:id`                | 取得單一用戶 | 本人/管理員 |
| PUT    | `/api/users/:id`                | 更新用戶資訊 | 本人/管理員 |
| POST   | `/api/users/:id/change-password`| 修改密碼 | 本人/管理員 |
| DELETE | `/api/users/:id`                | 刪除用戶 | 管理員       |

### 模板

| 方法   | 路徑                        | 說明             | 權限   |
| ------ | --------------------------- | ---------------- | ------ |
| GET    | `/api/templates`            | 取得所有公開模板 | 公開   |
| GET    | `/api/templates/:id`        | 取得單一模板     | 公開   |
| GET    | `/api/templates/admin/all`  | 取得所有模板     | 管理員 |
| POST   | `/api/templates`            | 建立模板         | 管理員 |
| PUT    | `/api/templates/:id`        | 更新模板         | 管理員 |
| DELETE | `/api/templates/:id`        | 刪除模板         | 管理員 |
| PATCH  | `/api/templates/:id/active` | 切換模板啟用狀態 | 管理員 |
