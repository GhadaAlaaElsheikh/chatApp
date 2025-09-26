import {Server as HttpServer} from 'node:http'
import {Server} from 'socket.io'
import { decodedToken, TokenEnum } from '../../utils/security/token.security'
import { IAuthSocket } from './gateway.interface';
import { ChatGateway } from '../chat';
import { BadRequest } from '../../utils/response/error.response';
 
export const connectedSocket= new Map<string, string[]>()
let io:undefined | Server = undefined
export const initializeIo =(httpServer:HttpServer)=>{
    const io = new Server({
    cors:{
      origin:"*"
    },
  });
//middleware
    io.use(async(socket:IAuthSocket,next)=>{
    try{
     const {user,decoded}=await decodedToken({
authorization: socket.handshake?.auth.authorization ||'',
tokenType:TokenEnum.access
     })
   
     const usertapes = connectedSocket.get(user._id.toString()) || []
     usertapes.push(socket.id)
     connectedSocket.set(user._id.toString(),usertapes)
    socket.credentials ={user,decoded}
     //next(new BadRequest("fail in authentication"))
    next()
    }catch(error:any){
      next(error)
    }
  })
  //disconnection
  function disconnect(socket:IAuthSocket){
    return   socket.on("disconnect",()=>{
      const userId = socket.credentials?.user._id?.toString() as string
      let remainingTabs =
      connectedSocket.get(userId)?.filter((tab:string)=>{
      return  tab != socket.id
      }) ||[]
      if (remainingTabs?.length) {
        connectedSocket.set(userId,remainingTabs)
      }else{
              connectedSocket.delete(userId)  
      getIo().emit("offline_user",userId)
      }
      console.log(`logout :: ${socket.id}`);
 
        console.log("after_logout::",connectedSocket);
        
      })
  }

  //  listen to =>http://localhost:3000/
  const chatGateway :ChatGateway= new ChatGateway()
  io.on("connection",(socket:IAuthSocket)=>{
   chatGateway.register(socket, getIo())
    disconnect(socket)
 
    })
 }
 export const getIo =(): Server =>{
  if (!io) {
    throw new BadRequest("fail to stablish server socket Io")
  }
  return io
 }