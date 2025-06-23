import express from 'express';
import cors  from 'cors';
import bodyParser  from 'body-parser';
import dotenv  from 'dotenv';
import loginroutes  from './routes/user.js'
import postRoutes from './routes/postRoutes.js'
import likeRoutes from './routes/likeRoutes.js'
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Sample Routes
app.get('/', (req, res) => {
  res.send('Event Management API is running');
});

// USERS Login
app.use('/api', loginroutes);
app.use('/api/user', postRoutes);
app.use('/api/posts',likeRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

