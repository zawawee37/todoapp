# Todo Application

แอปพลิเคชัน Todo ที่สร้างด้วย React TypeScript และ Express.js พร้อมระบบ Authentication ที่สมบูรณ์

## 📋 คุณสมบัติหลัก

### Frontend Features
- ✅ **Todo Management** - เพิ่ม แก้ไข ลบ และจัดการรายการ Todo
- 🔐 **Authentication System** - ระบบเข้าสู่ระบบและสมัครสมาชิก
- 🔑 **Password Reset** - ระบบรีเซ็ตรหัสผ่าน
- 📱 **Responsive Design** - รองรับการใช้งานบนอุปกรณ์ทุกขนาด
- 🎨 **Modern UI** - ใช้ Tailwind CSS สำหรับการออกแบบ

### Backend Features
- 🚀 **RESTful API** - API ที่ออกแบบตามมาตรฐาน REST
- 🔒 **JWT Authentication** - ระบบ Authentication ด้วย JSON Web Token
- 🗄️ **SQLite Database** - ฐานข้อมูล SQLite สำหรับเก็บข้อมูล
- 📝 **Request Logging** - บันทึกการเรียกใช้ API
- ✅ **Input Validation** - ตรวจสอบความถูกต้องของข้อมูลนำเข้า

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - JavaScript Library สำหรับสร้าง UI
- **TypeScript** - Static Type Checking
- **Vite** - Build Tool และ Development Server
- **Tailwind CSS** - Utility-first CSS Framework
- **Lucide React** - Icon Library
- **Supabase** - Backend as a Service (Optional)

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **SQLite3** - Database
- **JWT** - JSON Web Token สำหรับ Authentication
- **bcryptjs** - Password Hashing
- **CORS** - Cross-Origin Resource Sharing
- **Express Validator** - Input Validation

## 📁 โครงสร้างโปรเจค

```
project/
├── src/                          # Frontend Source Code
│   ├── components/
│   │   ├── Auth/                 # Authentication Components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── PasswordRequirements.tsx
│   │   └── Todo/                 # Todo Components
│   │       ├── TodoList.tsx
│   │       ├── TodoItem.tsx
│   │       └── AddTodoForm.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication Context
│   ├── services/
│   │   └── todoService.ts        # API Service Functions
│   ├── lib/
│   │   └── supabase.ts          # Supabase Configuration
│   ├── App.tsx                   # Main App Component
│   └── main.tsx                  # Entry Point
├── api/                          # Backend Source Code
│   ├── config/
│   │   └── database.js          # Database Configuration
│   ├── controllers/             # Route Controllers
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   └── passwordController.js
│   ├── middleware/
│   │   └── auth.js              # Authentication Middleware
│   ├── routes/                  # API Routes
│   │   ├── auth.js
│   │   ├── todos.js
│   │   └── password.js
│   ├── utils/
│   │   ├── logger.js            # Logging Utility
│   │   └── validation.js        # Validation Helpers
│   ├── logs/                    # Log Files
│   ├── server.js                # Main Server File
│   ├── database.sqlite          # SQLite Database
│   └── sessions.sqlite          # Session Storage
└── supabase/                    # Supabase Configuration
    └── migrations/
```

## 🚀 การติดตั้งและเรียกใช้

### ข้อกำหนดเบื้องต้น
- Node.js (เวอร์ชัน 18 หรือสูงกว่า)
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd project
```

### 2. ติดตั้ง Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd api
npm install
cd ..
```

### 3. ตั้งค่า Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (api/.env)
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4. เรียกใช้แอปพลิเคชัน

#### เรียกใช้ Backend
```bash
cd api
npm run dev
```
Backend จะทำงานที่ `http://localhost:3001`

#### เรียกใช้ Frontend (Terminal ใหม่)
```bash
npm run dev
```
Frontend จะทำงานที่ `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
สมัครสมาชิกใหม่
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### POST /api/auth/login
เข้าสู่ระบบ
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/logout
ออกจากระบบ

### Todo Endpoints

#### GET /api/todos
ดึงรายการ Todo ทั้งหมด

#### POST /api/todos
สร้าง Todo ใหม่
```json
{
  "title": "Todo Title",
  "description": "Todo Description"
}
```

#### PUT /api/todos/:id
อัปเดต Todo
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "completed": true
}
```

#### DELETE /api/todos/:id
ลบ Todo

### Password Reset Endpoints

#### POST /api/password/forgot
ขอรีเซ็ตรหัสผ่าน
```json
{
  "email": "user@example.com"
}
```

#### POST /api/password/reset
รีเซ็ตรหัสผ่าน
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

## 🔧 การพัฒนา

### Available Scripts

#### Frontend
- `npm run dev` - เรียกใช้ development server
- `npm run build` - สร้าง production build
- `npm run preview` - ดูตัวอย่าง production build
- `npm run lint` - ตรวจสอบ code style

#### Backend
- `npm start` - เรียกใช้ production server
- `npm run dev` - เรียกใช้ development server พร้อม auto-reload

### Code Style
- ใช้ ESLint สำหรับ linting
- ใช้ TypeScript สำหรับ type safety
- ใช้ Prettier สำหรับ code formatting (แนะนำ)

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔒 Security Features

- **Password Hashing** - ใช้ bcryptjs สำหรับ hash รหัสผ่าน
- **JWT Authentication** - ระบบ token-based authentication
- **Input Validation** - ตรวจสอบข้อมูลนำเข้าทุกครั้ง
- **CORS Protection** - จำกัดการเข้าถึงจาก domain ที่อนุญาต
- **SQL Injection Prevention** - ใช้ prepared statements

## 🚀 Deployment

### Frontend Deployment
1. สร้าง production build
```bash
npm run build
```

2. Deploy ไฟล์ใน `dist/` folder ไปยัง hosting service เช่น:
   - Vercel
   - Netlify
   - GitHub Pages

### Backend Deployment
1. ตั้งค่า environment variables บน hosting service
2. Deploy ไปยัง service เช่น:
   - Railway
   - Render
   - Heroku
   - DigitalOcean

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📝 License

โปรเจคนี้อยู่ภายใต้ MIT License

## 📞 Support

หากมีปัญหาหรือข้อสงสัย สามารถ:
- เปิด Issue ใน GitHub
- ติดต่อผู้พัฒนา

---

**Happy Coding! 🎉**