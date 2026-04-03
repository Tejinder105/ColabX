import dotenv from "dotenv";
dotenv.config();

import { sql } from "drizzle-orm";
import db from "./db/index.js";
import app from './app.js'
import config from './config/config.js'

const startServer = async () => {
    try {
        await db.execute(sql`select 1`);
        console.log("Database connectivity check passed");

        const server = app.listen(config.port, () => {
            console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
        });

        const shutdown = (signal: NodeJS.Signals) => {
            console.log(`${signal} received, shutting down HTTP server`);
            server.close((error?: Error) => {
                if (error) {
                    console.error("Error during server shutdown", error);
                    process.exit(1);
                }
                process.exit(0);
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};

void startServer();
