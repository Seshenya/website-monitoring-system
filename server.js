import "./config/env.js";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import router from "./route.js";
import { startMonitoring } from "./websites/api/index.js";

const app = express();

app.use(express.json());

app.use("/", router);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");

    startMonitoring(); // Start monitoring after DB connection
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
