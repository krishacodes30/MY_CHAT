import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
// import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import aiRoutes
    from './routes/ai.routes.js'

import messageRoutes
    from './routes/message.routes.js'
connect();


const app = express();

const allowedOrigins = [
  'http://localhost:5173', // Vite default port
  'http://localhost:3000', // React default port
  process.env.CLIENT_URL   // Live Vercel Frontend URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Mobile apps or Postman) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true
}))

// app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.VERCEL ? 'production (vercel)' : 'development (localhost)'
  })
})

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use(
    '/ai',
    aiRoutes
)

app.use(
    '/messages',
    messageRoutes
)
// app.use("/ai", aiRoutes)



app.get('/', (req, res) => {
    res.send('Hello World!');
});

// if (!process.env.VERCEL) {
//   const PORT = process.env.PORT || 5000
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running locally on http://localhost:${PORT}`)
//   })
// }

export default app; 