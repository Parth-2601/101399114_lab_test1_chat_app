# Real-Time Chat Application

A modern, real-time chat application built with Node.js, Socket.IO, and a clean, responsive UI. Users can join different topic-based rooms and communicate with others in real-time.

## Features

- **User Authentication**
  - Secure signup and login system
  - Password protection
  - Session management using localStorage

- **Real-time Communication**
  - Instant messaging using Socket.IO
  - Multiple chat rooms for different topics
  - Typing indicators
  - Join/Leave room notifications

- **Modern UI/UX**
  - Responsive design
  - Dark theme
  - Material Design icons
  - Glass-morphism effects
  - Smooth animations

- **Available Chat Rooms**
  - DevOps
  - Cloud Computing
  - COVID-19
  - Sports
  - NodeJS

## Technology Stack

### Frontend
- HTML5
- CSS3 (with modern features like flexbox and glass-morphism)
- JavaScript (vanilla)
- Material Design Icons
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO

## Project Structure

```
chat-application/
├── models/
│   ├── GroupMessage.js
│   ├── User.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── chat.html
├── routes/
│   ├── auth.js
├──server.js
├── package.json
└── README.md
```

## API Endpoints

### Authentication

#### POST /api/auth/signup
- Register a new user
- Body: `{ username, firstname, lastname, password }`

#### POST /api/auth/login
- Login user
- Body: `{ username, password }`
