#  MyTube - Complete Video Hosting Platform

A comprehensive video hosting website built with Node.js, Express.js, and MongoDB - similar to YouTube with full backend functionality.

##  Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## About

MyTube is a complete backend implementation of a video hosting platform inspired by YouTube. This project demonstrates industry-standard practices for building scalable web applications with features like user authentication, video management, social interactions, and more.


##  Features

###  Authentication & Authorization
- User registration and login
- JWT-based authentication
- Access tokens and refresh tokens
- Password encryption with bcrypt
- Secure session management

###  Video Management
- Video upload and storage
- Video streaming
- Video metadata management
- Video search and filtering

###  Social Features
- Like and dislike videos
- Comment system with replies
- Subscribe/Unsubscribe to channels
- User profiles and channel management

### Security Features
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Secure HTTP headers
- Error handling and logging

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose ODM

**Authentication & Security:**
- JSON Web Tokens (JWT)
- bcrypt for password hashing


**File Handling:**
- Multer for file uploads
- Cloudinary for media storage

**Development Tools:**
- nodemon
- dotenv
- cors

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ay05h/MyTube.git
   cd MyTube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://127.0.0.1:27017/mytube
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your-access-token-secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:8000`

##  Usage

### API Base URL
```
http://localhost:8000/api/v1
```

### Main Endpoints

**Authentication:**
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `POST /users/logout` - User logout
- `POST /users/refresh-token` - Refresh access token

**Videos:**
- `GET /videos` - Get all videos
- `POST /videos` - Upload new video
- `GET /videos/:id` - Get video by ID
- `PATCH /videos/:id` - Update video
- `DELETE /videos/:id` - Delete video

**Social Features:**
- `POST /likes/toggle/v/:videoId` - Toggle video like
- `POST /comments/:videoId` - Add comment
- `POST /subscriptions/c/:channelId` - Toggle subscription

##  Project Structure

```
MyTube/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database schemas
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middleware
│   ├── utils/          # Utility functions
│   ├── db/            # Database configuration
│   └── app.js         # Express app setup
├── public/            # Static files
├── .env.sample       # Environment variables template
├── .gitignore
├── package.json
└── README.md
```


##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Hitesh Choudhary** for the comprehensive backend tutorial series

##  Contact

**Project Maintainer**: [ay05h](https://github.com/ay05h)
