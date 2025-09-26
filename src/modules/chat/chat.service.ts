import type { Request, Response } from "express";
import { BadRequest, NotFoundException } from "../../utils/response/error.response";
import { ICreateChatGroupDto, IGetChatDto, IGetChatGroupDto, IGetChatQueryDto, IJoinRoomDto, ISayHiDto, ISendGroupMessageDto, ISendMessageDto } from "./chat.dto";
import { successResponse } from "../../utils/response/success.response";
import { ChatRepository, UserRepository } from "../../database/repository";
import { ChatModel, UserModel } from "../../database/model";
import { Types } from "mongoose";
import { IGetChatResponse } from "./chat.entites";
import { connectedSocket } from "../gateway.ts";
import { deleteFile, uploadFile } from "../../utils/multer/s3.config";
import {v4 as uuid} from 'uuid'
 


export class ChatService {
  private chatModel :ChatRepository = new ChatRepository(ChatModel)
  private userModel :UserRepository = new UserRepository(UserModel)
  constructor(){}

  getChat = async (req:Request, res:Response):Promise<Response> =>{
    const {userId} = req.params as IGetChatDto;
    const {page ,size}: IGetChatQueryDto = req.query  ;
    const chat = await this.chatModel.findOne({
      filter:{
        participants:{
          $all :[req.user?._id as Types.ObjectId,
          Types.ObjectId.createFromHexString(userId)
         ]},
         group:{$exists:false}
      },
      options:{
        populate:[{path:"participants",
          select:"firstName lastName email gender profilePicture"
        }]
      },
      page,
      size,
    })
    if (!chat) {
      throw new BadRequest("fail to find matching chatting instance")
    }
return successResponse<IGetChatResponse>({res,data:{chat}})
  }
   getChatGroup = async (req:Request, res:Response):Promise<Response> =>{
    const {groupId} = req.params as IGetChatGroupDto;
    const {page ,size}: IGetChatQueryDto = req.query  ;
    const chat = await this.chatModel.findOneChat({
      filter:{
        _id: Types.ObjectId.createFromHexString(groupId),
        participants:{
         $in:req.user?._id as Types.ObjectId},
         group:{$exists:true}
      },
      options:{
        populate:[{path:"messages.createdBy",
          select:"firstName lastName email gender profilePicture"
        }]
      },
      page,
      size,
    })
    if (!chat) {
      throw new BadRequest("fail to find matching chatting instance")
    }
return successResponse<IGetChatResponse>({res,data:{chat}})
  }
 
  sayHi =async({message,socket,callback, io}: ISayHiDto)=>{
try{
    console.log({message});
    throw new BadRequest("some error")
  callback? callback ("hello BE to FE"): undefined;
}catch(error){
  return socket.emit("custom_error", error)
}
  }

   sendMessage =async({content,socket,sendTo, io}: ISendMessageDto)=>{
try{
   const createdBy = socket.credentials?.user._id as Types.ObjectId
   const user = await this.userModel.findOne({
    _id: Types.ObjectId.createFromHexString(sendTo),
    friends:{$in:createdBy}
   })
   if (!user) {
    throw new NotFoundException("invalid recipient friend")
   }
   const chat = await this.chatModel.findOneAndUpdate({
      filter:{
        participants:{
          $all :[createdBy as Types.ObjectId,
          Types.ObjectId.createFromHexString(sendTo)
         ]},
         group:{$exists:false}
      },
      update:{
        $addToSet:{
          messages:{content, createdBy}
        }
      }
   })
if (!chat) {
  const [newChat] = await this.chatModel.create({
data:[{
  createdBy,
  messages:[{content, createdBy}],
  participants:[
    createdBy as Types.ObjectId,
    Types.ObjectId.createFromHexString(sendTo)
  ]
}]
  })|| []
  if (!newChat) {
    throw new BadRequest("fail to create this chat")
  }
}
io?.to(
  connectedSocket.get(createdBy.toString() as string) as string[]).emit("successMessage", {content})
  
  io?.to(
  connectedSocket.get(sendTo ) as string[])
  .emit("newMessage", {content, from :socket.credentials?.user})
  
}catch(error){
  return socket.emit("custom_error", error)
}
  }
    createChatGroup = async (req:Request, res:Response):Promise<Response> =>{
    const {group, participants} : ICreateChatGroupDto= req.body
 const dbParticipants = participants.map((participant:string)=>{
  return Types.ObjectId.createFromHexString(participant)
 })
    const users = await this.chatModel.find({
      filter:{
         _id:{$in: dbParticipants},
         friends: {$in:req.user?._id as Types.ObjectId}
      },
     
    })
    if (participants.length != users.length) {
      throw new NotFoundException(" some or all recipiant all invalid")
    }
    let group_image:string |undefined = undefined;
    const roomId = group.replaceAll(/\s/g,"_")+""+uuid()
    if (req.file) {
      group_image= await uploadFile({
        file:req.file as Express.Multer.File,
        path :`chat/${roomId}`})
    }
    dbParticipants.push(req.user?._id as Types.ObjectId )
    const [chat] = await this.chatModel.create({
      data:[{
        createdBy:req.user?._id as Types.ObjectId,
        group,
        roomId,
        group_image: group_image as string,
        messages:[],
        participants:dbParticipants
      }]
    })||[]
    if (!chat) {
      if (group_image) {
        await deleteFile({Key: group_image})
      }
      throw new BadRequest("fail to generate group")
    }
return successResponse<IGetChatResponse>({res,statusCode:201,data:{chat:newGroup}})
  }
   joinRoom =async({roomId,socket, io}: IJoinRoomDto)=>{
try{
  const chat = await this.chatModel.findOne({
    filter:{
      roomId,
      group:{$exists: true},
      participants: {$in :socket.credentials?.user._id}
    }
  })
  if (!chat) {
    throw new NotFoundException("fail to find matching room")
  }
  console.log({join :roomId});
  
  socket.join(chat.roomId as string);
  
}catch(error){
  return socket.emit("custom_error", error)
}
  }
    sendGroupMessage =async({
      content,socket,groupId, io}: ISendGroupMessageDto)=>{
try{
   const createdBy = socket.credentials?.user._id as Types.ObjectId
   
   const chat = await this.chatModel.findOneAndUpdate({
      filter:{
        _id: Types.ObjectId.createFromHexString(groupId),
        participants:{
          $in :createdBy as Types.ObjectId
        },
         group:{$exists:true}
      },
      update:{
        $addToSet:{
          messages:{content, createdBy}
        }
      }
   })
if (!chat) {
 throw new BadRequest("fail to find matching room")
}
io?.to(
  connectedSocket.get(createdBy.toString() as string)as string[]
).emit("successMessage", {content})

socket?.to(chat.roomId as string).emit(
  "newMessage",{
    content,
    from: socket.credentials?.user,
    groupId,
  }
)
}catch(error){
  return socket.emit("custom_error", error)
}
  }
}