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
    'http://localhost:5173',
    'http://localhost:3000',
    'https://my-app-frontend-gpo8.onrender.com',
    process.env.CLIENT_URL
].filter(Boolean); // Removes undefined values if CLIENT_URL is not set

// 2. Configure CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server requests)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy violation: ${origin} is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 // Legacy browser support for preflight requests
}));

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