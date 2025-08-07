# 🌟 Dark Themed Portfolio Website

A modern, responsive portfolio website built with React.js frontend and Express.js backend, featuring 3D animations, admin panel, and MongoDB integration.

## ✨ Features

- **🎨 Dark Theme Design** - Modern and attractive dark-themed UI
- **📱 Fully Responsive** - Works seamlessly on all devices
- **🎭 3D Animations** - Beautiful 3D loader and skill slider with Framer Motion
- **⚡ Fast Performance** - Optimized React.js frontend
- **🔐 Admin Panel** - Secure admin login and project management
- **📊 MongoDB Integration** - Dynamic project and contact data storage
- **🎯 Interactive Components** - Smooth animations and transitions
- **📧 Contact Form** - Functional contact form with backend integration

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Framer Motion** - Animation library
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/portfolio
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or run them separately:
   # Backend (from backend folder)
   npm run dev
   
   # Frontend (from frontend folder)  
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin/login

## 🔐 Admin Access

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Important**: Change these credentials in production by updating the `.env` file.

## 📁 Project Structure

```
portfolio/
├── frontend/                 # React.js frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── About/
│   │   │   ├── Admin/
│   │   │   ├── Contact/
│   │   │   ├── Footer/
│   │   │   ├── Hero/
│   │   │   ├── Loader/
│   │   │   ├── Navbar/
│   │   │   ├── Projects/
│   │   │   └── Skills/
│   │   ├── App.jsx          # Main App component
│   │   └── index.jsx        # Entry point
│   ├── tailwind.config.js   # TailwindCSS config
│   └── package.json
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Server entry point
│   └── package.json
└── package.json            # Root package.json
```

## 🎯 Key Components

### 3D Skill Slider
- Rotating 3D carousel showcasing technical skills
- Responsive design for all device sizes
- Smooth animations with CSS transforms

### 3D Loader
- Animated 3D cube with gradient effects
- Loading progress indicator
- Floating particles background

### Admin Dashboard
- Secure JWT-based authentication
- CRUD operations for projects
- Contact message management
- Responsive admin interface

### Contact Form
- Form validation
- Email integration ready
- Success/error feedback
- MongoDB storage

## 🎨 Customization

### Colors
Update colors in `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: { 500: '#6366f1' },
  accent: { 500: '#8b5cf6' },
  dark: { 100: '#0f0f0f' }
}
```

### Skills
Update skills in `frontend/src/components/Skills/Skills.jsx`:
```javascript
const skills = [
  { name: 'HTML', image: '/assets/html.jpg' },
  // Add more skills...
];
```

### Projects
Add projects via the admin panel or directly in the database.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: > 768px
- **iPhone SE**: < 375px (special handling)

## 🔧 API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify` - Verify token
- `GET /api/admin/dashboard` - Dashboard data

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get messages (Admin)
- `PUT /api/contact/:id/status` - Update status (Admin)

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the `backend` folder
3. Update frontend API URLs

### Database
- Use MongoDB Atlas for cloud database
- Update `MONGODB_URI` in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Suhas**
- Portfolio: [Your Portfolio URL]
- GitHub: [Your GitHub]
- LinkedIn: [Your LinkedIn]

---

⭐ **Star this repo if you found it helpful!**
