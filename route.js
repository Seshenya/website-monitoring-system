import express from "express";
import { addUser } from "./users/api/index.js";
import {
  addWebsiteData,
  fetchWebsiteData,
  stopWebsiteCrawling,
} from "./websites/api/index.js";

const router = express.Router();

router.post("/api/v1/user", addUser);

router.get("/api/v1/website/:id", fetchWebsiteData);
router.post("/api/v1/website", addWebsiteData);
router.patch("/api/v1/website/:id", stopWebsiteCrawling);

export default router;
