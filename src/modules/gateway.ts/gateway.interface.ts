import { Socket } from "socket.io"
import { HUserDocument } from "../../database/model"
import { JwtPayload } from "jsonwebtoken"


export interface IAuthSocket extends Socket{
  credentials?:{
    user:Partial<HUserDocument>,
    decoded:JwtPayload
  }

 }
 export interface IMainDto {
  socket: string;
  io: string;
  
 }