// require('dotenv').config();
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: "./env"
});

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is running on port ${process.env.PORT}`);
    });
    app.on("error", (error) => {
        console.error(`Express error: ${error}`);
        throw error;
    });
 }).catch((error) => { console.log("Mongo db Connection failesd !!!!", error); })














/* 
import express from "express";

const app = express()

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error(`Express error: ${error}`);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`);

        });
    } catch (error) {
        console.error(error)
        throw error
    }
})() */