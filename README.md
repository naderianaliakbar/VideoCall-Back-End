## 📦 VideoCall Back‑End

A RESTful API and signaling server setup built with Node.js and Express.js to support real-time video call functionality.

### 🚀 Features

* User authentication via JWT
* Secure password storage using bcrypt
* Establishing and managing video call sessions
* WebRTC signaling implemented with Socket.IO
* MongoDB for user and session data (via Mongoose)
* Input validation using Joi
* Structured error logging and handling

### ⚙️ Tech Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Runtime         | Node.js               |
| Framework       | Express.js            |
| Database        | MongoDB with Mongoose |
| Authentication  | JWT + bcrypt          |
| Real‑time Comm. | Socket.IO + WebRTC    |
| Validation      | Joi                   |

### 🧩 Installation & Setup

```bash
git clone https://github.com/naderianaliakbar/VideoCall-Back-End.git
cd VideoCall-Back-End
npm install
```

Copy `.env.example` to `.env` and configure:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videocall-db
JWT_SECRET=your_jwt_secret
```

### 🏁 Running the Server

```bash
npm run dev     # Development mode with nodemon
npm start       # Production mode
```

Server listens on `http://localhost:5000`.

### 🛠️ API & Signaling Endpoints

* **Auth**

  * `POST /api/auth/register` – Register a new user
  * `POST /api/auth/login` – Login and receive JWT

* **Users** *(protected)*

  * `GET /api/users` – List all users
  * `GET /api/users/:id` – Get user by ID

* **VideoCall Sessions** *(protected)*

  * `POST /api/sessions` – Create a new video call session
  * `GET /api/sessions/:id` – Retrieve session details

* **WebSocket Signaling** (via Socket.IO)

  * `join-session` – User joins a session room
  * `signal` – Exchanging WebRTC offer/answer and ICE candidates
  * `leave-session` – User exits a session

### 📘 Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── socket/
├── middlewares/
├── utils/
└── index.js
```

