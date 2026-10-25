# HerHealth

React + Express. No database server needed: data is saved in `server/data.json`.

## Run (two terminals)
```
cd server
npm install
npm start          -> http://localhost:5000

cd client
npm install
npm run dev        -> http://localhost:5173
```
Optional: copy `server/.env.example` to `server/.env` and set JWT_SECRET (and ANTHROPIC_API_KEY for AI summaries).
Forgot password: the reset code is printed in the server terminal (no email service is connected).
