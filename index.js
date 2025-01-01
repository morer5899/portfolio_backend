import express from "express";
import dotenv from "dotenv";
import cors from "cors";;
import {router as userRoutes} from "./routes/user.routes.js";
import path from "path";
const app=express();
const _dirname=path.resolve();

app.use(cors({
  origin:"*",
  credentials:true
}));
app.use(express.json());
dotenv.config();
app.use("/user",userRoutes);
const PORT=process.env.PORT || 8080;
app.use(express.static(path.join(_dirname,"/frontend/dist")));
app.get("*",(req,res)=>{
  res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"));
})
app.listen(PORT,()=>{
  console.log(`Server is running on port no ${PORT}`);
})
