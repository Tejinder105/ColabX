import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import config from "./config/config.js";
import orgRoutes from "./routes/orgRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import teamsRoutes from "./teams/teams.routes.js";
import partnersRoutes from "./partners/partners.routes.js";
import dealsRoutes from "./deals/deals.routes.js";
import okrRoutes from "./okr/okr.routes.js";
import contactsRoutes from "./contacts/contacts.routes.js";
import collaborationRoutes from "./collaboration/collaboration.routes.js";
import reportsRoutes from "./reports/reports.routes.js";


const app = express();

const allowedOrigins = config.corsOrigins;


app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Better Auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// API routes
app.use("/api/org", orgRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/me", meRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/okr", okrRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api", contactsRoutes);
app.use("/api", collaborationRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    res.status(500).json({ error: message });
});

export default app;
