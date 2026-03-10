import dotenv from "dotenv";
dotenv.config();

import db from "./db/index.js";
import app from './app.js'
import config from './config/config.js'

if (db) {
    console.log("Database connected successfully");
    console.log(db.$client.options.connectionString);
    try {
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        })
    }
    catch (error) {
        console.log(error);
    }
}
