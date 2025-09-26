import { HChatDocument } from "../../database/model";

export interface IGetChatResponse{
  chat:Partial<HChatDocument>
}