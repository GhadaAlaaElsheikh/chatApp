 import {resolve} from 'node:path'
 import {config} from "dotenv"
 config({path: resolve("./config/.env.development")})
 import  type  { Request,  Express, Response} from 'express'
import express from "express"
import cors from 'cors'
import helmet from 'helmet'
import {rateLimit} from 'express-rate-limit'
import {authRouter , postRouter, userRouter} from './modules'
//import {router as authRouter} from './modules/auth/'
// import authController from './modules/auth/auth.controller'
//import userController from './modules/user/user.controller'
//import { router as userRouter } from './modules/user'
import { globalErrorHandling } from './utils/response/error.response';
import { connectDB } from './database/database.connection';
 
 import {promisify} from "node:util"
import {pipeline} from "node:stream"
import { chatRouter } from './modules/chat'
 
 
const createS3WriteStreamPipe = promisify(pipeline)
 

 
 const bootstrap = async(): Promise<void> =>{
  const port: string | number = process.env.PORT || 5000
   
const app:Express = express();

app.use(express.json())

  app.use(cors())
  app.use(helmet())
  const limiter = rateLimit({
    windowMs: 60 * 60000,
    limit :2000,
    message:{error:"too many request please try again"},
    statusCode:429,
  });
  app.use(limiter)

  app.get("/",(req:Request,res:Response)=>{
    res.json({message:`welcome ${process.env.APPLICATION_NAME}`})
  })

  app.use("/auth",authRouter)
  app.use("/user", userRouter)
   app.use ("/post", postRouter)
   app.use("/chat", chatRouter)
 
  
 
 

  app.use(globalErrorHandling)
  await connectDB()
  
 
const httpServer=  app.listen(port,()=>{
    console.log(`server is running on port :: ${port}`);
    
  })
 initializeIo(httpServer)
 
 
    
}

  export default bootstrap;