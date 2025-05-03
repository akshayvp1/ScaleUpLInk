import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import fullRouter from './routes/router';
import payment from "./routes/paymentRouter";
import './config/container'
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();

app.use((req,res,next)=>{
  console.log(req.originalUrl,"ooooo");
  
  if(req.originalUrl==='/payments/webhook'){
    next()
  }else{
    express.json({limit:'50mb'})(req,res,next)
  }
    
})
app.use((req,res,next)=>{
  if(req.originalUrl==='/payments/webhook'){
    next()
  }else{
    express.urlencoded({limit:'50mb',extended:true})(req,res,next)
  }
})

const PORT = process.env.PORT || 4040;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MongoDB URI is not set in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection lost:", err);
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', fullRouter);
app.use('/payments',payment)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
