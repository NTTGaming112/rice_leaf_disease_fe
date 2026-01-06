# Rice Leaf Disease Detection - Frontend

Web application để phát hiện các triệu chứng thiếu dinh dưỡng trên lá lúa sử dụng AI.

## 📋 Mô tả

Frontend của hệ thống Rice Leaf Disease Detection, cho phép người dùng upload hình ảnh lá lúa và nhận được chẩn đoán tức thì về tình trạng thiếu dinh dưỡng (N, P, K) thông qua nhiều mô hình Deep Learning.

### Tính năng chính:

- 🖼️ **Upload & Predict** - Upload ảnh đơn lẻ hoặc batch (ZIP)
- 🤖 **Multi-Model Support** - So sánh kết quả từ 5 models khác nhau
- 💡 **AI Recommendations** - Nhận lời khuyên điều trị từ Gemini AI
- 📊 **History Tracking** - Xem lại lịch sử dự đoán
- 📱 **Responsive Design** - Tối ưu cho mọi thiết bị
- 🎨 **Modern UI** - Sử dụng Ant Design + Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Iconsax React
- **Animations**: Framer Motion

## 📦 Yêu cầu hệ thống

- Node.js 16+
- npm hoặc pnpm (khuyến nghị)

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd demo/fe/rice_leaf_disease_fe
```

### 2. Cài đặt dependencies

**Sử dụng pnpm (khuyến nghị):**

```bash
pnpm install
```

**Hoặc sử dụng npm:**

```bash
npm install
```

### 3. Cấu hình environment variables

Copy file `.env.example` thành `.env.local`:

```bash
# Windows
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

Chỉnh sửa file `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Lưu ý:** Đảm bảo backend đang chạy tại URL này.

### 4. Chạy development server

```bash
# pnpm
pnpm dev

# npm
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

## 🏗️ Build cho Production

```bash
# pnpm
pnpm build

# npm
npm run build
```

Build output sẽ được tạo trong thư mục `dist/`

### Preview production build

```bash
# pnpm
pnpm preview

# npm
npm run preview
```

## 📁 Cấu trúc Project

```
rice_leaf_disease_fe/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── pages/          # Page components
│   │   ├── About.tsx   # Trang giới thiệu
│   │   ├── History.tsx # Lịch sử dự đoán
│   │   └── predict/    # Trang dự đoán
│   │       ├── index.tsx
│   │       ├── ImageInput.tsx
│   │       └── BatchImageInput.tsx
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── package.json
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS config
└── tsconfig.json       # TypeScript config
```

## 🔧 Scripts

```bash
# Development
pnpm dev          # Chạy dev server với HMR
pnpm build        # Build cho production
pnpm preview      # Preview production build
pnpm lint         # Chạy ESLint

# Type checking
pnpm type-check   # Kiểm tra TypeScript errors
```

## 🌐 API Integration

Frontend giao tiếp với backend thông qua REST API:

- **Base URL**: Định nghĩa trong `VITE_API_BASE_URL`
- **Endpoints**:
  - `GET /models` - Lấy danh sách models
  - `POST /predict-image/{model_key}` - Dự đoán từ ảnh đơn
  - `POST /predict-batch/{model_key}` - Dự đoán từ batch ảnh
  - `GET /history` - Lấy lịch sử dự đoán
  - `DELETE /history` - Xóa lịch sử

## 🎨 Customization

### Thay đổi theme

Chỉnh sửa Ant Design theme trong `App.tsx`:

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#52c41a', // Màu chính
      // Các token khác...
    },
  }}
>
```

### Thêm Tailwind classes

Chỉnh sửa `tailwind.config.js` để customize Tailwind:

```js
export default {
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
    },
  },
};
```

## 🐛 Troubleshooting

### Port 5173 đã được sử dụng

Vite sẽ tự động chọn port khác. Hoặc chỉ định port trong `vite.config.ts`:

```ts
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### API connection errors

- Kiểm tra backend có đang chạy không
- Verify `VITE_API_BASE_URL` trong `.env.local`
- Kiểm tra CORS configuration ở backend

### Build errors

```bash
# Clear cache và node_modules
rm -rf node_modules .vite
pnpm install
pnpm build
```

## 📝 License

MIT License

## 🔗 Links

- Backend Repository: [(https://github.com/NTTGaming112/rice_leaf_disease_BE)]