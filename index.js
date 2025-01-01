import express from "express";
import dotenv from "dotenv";
import cors from "cors";;
import {router as userRoutes} from "./routes/user.routes.js";
import path from "path";
const app=express();
const _dirname=path.resolve();

app.use(cors({
  origin:"https://portfolio-frontend-opal-pi.vercel.app/",
  credentials:true
}));
app.use(express.json());
dotenv.config();
app.use("/user",userRoutes);
const PORT=process.env.PORT || 8080;
app.listen(PORT,()=>{
  console.log(`Server is running on port no ${PORT}`);
})
