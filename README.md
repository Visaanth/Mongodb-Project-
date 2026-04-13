# Smart Lost & Found System (Campus-Based)

A centralized MERN-stack web platform for students and staff to report, search, and recover lost and found items efficiently within a campus.

## 🚀 MERN Stack Architecture

This project is built using:
- **MongoDB**: Database (Local MongoDB compass connection at `mongodb://127.0.0.1:27017/lostfoundDB`)
- **Express.js**: Backend web framework
- **React.js**: Frontend UI library (Responsive & dynamic)
- **Node.js**: Backend runtime environment

## 🌟 Key Features

- **Authentication**: JWT-based secure login & registration (passwords hashed using bcrypt via Mongoose pre-save hooks).
- **Protected Routes**: React frontend and Node backend routes secured for authenticated users.
- **Reporting System**: Post `Lost` or `Found` items with descriptions, mapped locations, tags, and image upload.
- **Advanced Search & Filter**: Real-time searching across names, tags, and locations. Filter by item type (Lost/Found) and category.
- **Smart Matching System**: AI-style matching mechanism that suggests possible matches for your lost or found item based on text, tags, and categories.
- **Direct Messaging**: Contact item posters securely within the app using the Messages inbox system.
- **Dashboard & Item Management**: Manage, update, delete, or mark your own items as 'Resolved'. Edit and update your profile and avatar.
- **Responsive Premium UI**: Beautiful dark-themed dashboard using pure CSS with interactive states, gradients, badges, and modals.

---

## 📂 Project Structure

\`\`\`text
Mongodb Project/
├── client/                     # Frontend React App (localhost:3000)
│   ├── public/                 # Static assets & index.html
│   └── src/
│       ├── api/                # Axios instance configuration (interceptors)
│       ├── components/         # Reusable UI components (Navbar, ItemCard)
│       ├── context/            # React AuthContext (Global User State)
│       ├── pages/              # App Pages (Dashboard, PostItem, etc.)
│       ├── App.js              # Routing Configuration
│       └── index.css           # Premium Custom Dark Theme CSS
│
└── server/                     # Backend Node/Express API (localhost:5000)
    ├── controllers/            # Logic for auth, users, items, messages
    ├── middleware/             # JWT protect middleware, Multer uploads
    ├── models/                 # Database Schemas (User, Item, Message)
    ├── routes/                 # Express REST endpoint routing
    ├── uploads/                # Local storage for user-uploaded images
    ├── .env                    # DB Config & Secrets
    └── server.js               # Main Express Entry Point
\`\`\`

---

## 💻 Prerequisites

Ensure you have the following installed on your machine before running:
- **Node.js** (v14 or higher)
- **MongoDB Server** (Running locally on default port `27017`)
- **MongoDB Compass** (Optional, for database inspection)

---

## ⚙️ How to Run Locally

### 1. Database Setup

Ensure your Local MongoDB is running. The app will automatically create a database named `lostfoundDB`.

### 2. Backend Setup (Server)

Open a terminal window and navigate to the backend folder:

\`\`\`bash
cd server
npm install
\`\`\`

Ensure the `server/.env` file exists with the following configuration:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lostfoundDB
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`
*The server should say: `✅ MongoDB connected successfully to lostfoundDB` and be running on `http://localhost:5000`.*

### 3. Frontend Setup (Client)

Open a **new** terminal window and navigate to the frontend folder:

\`\`\`bash
cd client
npm install
\`\`\`

Start the React frontend application:
\`\`\`bash
npm start
\`\`\`
*The React app should launch and open automatically at `http://localhost:3000`.*

---

## 💡 Usage Guide

1. **Register**: Create a new account with your Student/Staff details.
2. **Dashboard**: Access your personal panel.
3. **Report**: Click *Post Item* to record something you lost or found. You can upload an image.
4. **Browse**: Search the main page or filter lists to find matches.
5. **Connect**: Open an item's details and click **Contact Owner** to send an internal message to coordinate a meetup!
6. **Resolve**: Did you get your item back? Hit **Mark Resolved** on your dashboard!
