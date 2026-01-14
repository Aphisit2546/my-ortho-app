# 🦷 OrthoTrack

**ระบบติดตามการจัดฟัน** - Web Application สำหรับบันทึกและติดตามความคืบหน้าการรักษาจัดฟัน

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

---

## ✨ Features

- 📊 **Dashboard** - ภาพรวมค่าใช้จ่าย ระยะเวลา และนัดหมายครั้งถัดไป
- 📋 **บันทึกการรักษา** - เพิ่ม/แก้ไข/ดูประวัติการรักษาทั้งหมด
- 👤 **โปรไฟล์** - จัดการข้อมูลส่วนตัวและข้อมูลการรักษา
- 🔐 **Authentication** - ระบบ Login/Register ด้วย Supabase Auth
- 📱 **Responsive** - รองรับทุกขนาดหน้าจอ

---

## 🎨 Design System

| Role | Color | Hex |
|------|-------|-----|
| Background | Cream | `#F1EFEC` |
| Surface/Card | Warm Beige | `#D4C9BE` |
| Primary | Deep Navy | `#123458` |
| Text | Jet Black | `#030303` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Supabase Account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/my-ortho-app.git
cd my-ortho-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📁 Project Structure

```
my-ortho-app/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (protected)/     # Dashboard, Treatments, Profile
│   ├── globals.css      # Global styles & Design System
│   └── layout.tsx       # Root layout
├── components/
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Sidebar, Header
│   ├── profile/         # Profile form
│   ├── treatments/      # Treatment list, form, card
│   └── ui/              # UI components (Button, Card, Input, etc.)
├── lib/
│   ├── supabase/        # Supabase client (server & client)
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form**: React Hook Form + Zod
- **Icons**: Lucide React
- **Fonts**: Geist Sans

---

## 📝 License

This project is for personal use.

---

## 👨‍💻 Developer

**Aphisit Janmunee** - [apisit9048@gmail.com]
