import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";


const app = express();



app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

export default app;
