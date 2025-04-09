import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.urlencoded({extended: true,limit:"10mb"}))
app.use(express.json({limit: "10mb"}))
app.use(cookieParser())

export { app };