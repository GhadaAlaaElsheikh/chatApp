import {z} from 'zod'
import { createChatGroup, getChat, getChatGroup } from './chat.validation';
import { IMainDto } from '../gateway.ts';

 


 export type IGetChatDto = z.infer<typeof getChat.params>
  export type IGetChatGroupDto = z.infer<typeof getChatGroup.params>
 export type IGetChatQueryDto = z.infer<typeof getChat.query>
export type ICreateChatGroupDto = z.infer<typeof createChatGroup.body>


export interface ISayHiDto extends IMainDto{
  message:string;
 
}
export interface ISendMessageDto extends IMainDto{
  content:string;
 sendTo: string;
}
export interface IJoinRoomDto extends IMainDto{
  roomId:string;
 
}
export interface ISendGroupMessageDto extends IMainDto{
  content:string;
 groupId: string;
}