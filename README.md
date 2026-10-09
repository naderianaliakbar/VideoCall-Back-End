# VideoCall — Back End (Exoroya)

Node.js/Express REST API, Socket.IO call-signaling server and PeerJS signaling service for the [VideoCall front end](https://github.com/naderianaliakbar/VideoCall-Front-End).

## Features and stack

- Email/password registration and JWT login.
- User profiles, contacts and call history.
- Voice/video call records with states: created (0), started (1), accepted (2), rejected (3), busy (4), ended (5), offline (6).
- WebSocket signaling for call preparation, notification, acceptance/rejection and termination.
- PeerJS server for peer discovery/signaling.

The stack is **CommonJS**, Express 4, the native MongoDB driver, Socket.IO 4, `peer`, JWT and `express-validator`. This is **not** a Mongoose/Joi project.

## Setup

Requires Node.js, npm/Yarn and a reachable MongoDB instance. A compatible browser client also needs an accessible Socket.IO endpoint and PeerJS signaling endpoint.

```bash
git clone https://github.com/naderianaliakbar/VideoCall-Back-End.git
cd VideoCall-Back-End
npm install
```

The application loads `.env` using `dotenv`. Variables referenced by the server include:

```dotenv
PORT=5000
TOKEN_SECRET=replace-with-strong-random-secret
MongoDB_DATABASE=exoroya
MongoDB_URL=mongodb://127.0.0.1:27017
```

**Security and setup blocker:** `modules/db.js` currently embeds a database connection URI/credential in source instead of using `MongoDB_URL`. The sample `MongoDB_URL` above will **not** override that hard-coded URI. Replace it with a secure, environment-driven configuration and **rotate any exposed credentials** before running or deploying. Never commit a real `.env`.

```bash
npm start
```

The Express server defaults to port `5000`; `bin/www` also starts a **separate PeerServer on port 9000**. These ports must be accessible or reverse-proxied appropriately. The repository defines no `dev` or `test` npm scripts.

## API surface

All HTTP routes have the `/api/v1` prefix:

| Route | Description |
| --- | --- |
| `POST /api/v1/auth/register` | Register account |
| `POST /api/v1/auth/login` | Login, receive JWT |
| `GET /api/v1/auth/me` | Fetch authenticated user |
| `POST /api/v1/auth/logout` | Logout endpoint |
| `GET /api/v1/contacts` | Contacts operations (see routes) |
| `POST /api/v1/calls` | Create call record (`contactId`, `callType`: 0 voice, 1 video) |
| `GET /api/v1/calls` | Recent calls |
| `GET /api/v1/calls/:id` | Call details |

See `routes/auth.js`, `routes/users.js`, `routes/contacts.js` and `routes/calls.js` for the complete contracts. Protected endpoints use JWT authentication.

## Real-time calling

`modules/websocket.js` attaches Socket.IO to the HTTP server, authenticates with `TOKEN_SECRET`, and requires WebSocket transport. Events include `userConnect`, `prepareCall`, `notifyCall`, `acceptCall`, `callAccepted`, `rejectCall`, `callRejected`, `streamAction`, `getRemoteStreamConfigs` and `endCall`. The dedicated PeerServer enables the PeerJS client. Media is negotiated by browsers; the API server is not a video-transcoding service.

## Security and known limitations

- Registration/login code currently uses **MD5 for passwords**, which is unsuitable for production credential storage. Migrate to a password-hashing algorithm such as Argon2id or bcrypt before real-world deployment.
- Remove embedded database credentials and rotate them.
- Review socket authorization, database API compatibility and production TLS/CORS/peer configuration.
- No automated test suite is configured.

## Structure

`app.js` registers Express middleware/routes; `bin/www` starts servers; `modules/` holds DB, auth and sockets; `routes/` contains HTTP handlers.

## License

No license file is included in this repository.
