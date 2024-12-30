import express from "express";
import sendMail from "../utils/sendMail.js";
const router=express.Router();
router.post("/sendEmail",sendMail);
export {router};