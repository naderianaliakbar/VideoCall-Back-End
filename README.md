# VideoCall Back-End

This is the back-end service for the **VideoCall** project. It provides APIs and WebSocket connections for managing real-time video calls, user authentication, signaling, and data exchange between clients.

## Features

- **WebRTC Signaling Server** for real-time communication.
- **RESTful APIs** for user and room management.
- **Socket.io Integration** for real-time events and message broadcasting.
- **Authentication** (JWT or token-based).
- **Scalable Architecture** designed for handling multiple concurrent video calls.

## Technologies Used

- **Node.js** (JavaScript runtime)
- **Express.js** (HTTP server)
- **Socket.io** (real-time communication)
- **WebRTC** (peer-to-peer connections)
- **MongoDB / Mongoose** (database and data modeling)
- **dotenv** (environment variable management)
- **CORS** (cross-origin resource sharing)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/naderianaliakbar/VideoCall-Back-End.git
   cd VideoCall-Back-End
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file in the root directory and configure the following:

env
Copy
Edit
PORT=5000
MONGO_URI=mongodb://localhost:27017/videocall
JWT_SECRET=your_secret_key
Run the server:

bash
Copy
Edit
npm start
Or for development with auto-reload:

bash
Copy
Edit
npm run dev
API Endpoints
Auth
POST /api/auth/register - Register a new user

POST /api/auth/login - Login and receive a token

Rooms
POST /api/rooms - Create a new call room

GET /api/rooms/:id - Get room details

Signaling
WebSocket (Socket.io) events for WebRTC signaling (offer, answer, candidate).

Project Structure
mathematica
Copy
Edit
VideoCall-Back-End/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
├── .env.example
├── package.json
└── README.md

License
This project is licensed under the MIT License.
