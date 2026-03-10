import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import orgRoutes from "./routes/orgRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import teamsRoutes from "./teams/teams.routes.js";
import partnersRoutes from "./partners/partners.routes.js";


const app = express();



app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

// Better Auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// API routes
app.use("/api/org", orgRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/me", meRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/partners", partnersRoutes);

export default app;
