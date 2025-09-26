import { HChatDocument, HUserDocument } from "../../database/model"

export interface IProfileResponse{
  url: string
}
export interface IUserProfileResponse{
  user: Partial<HUserDocument>;
  groups ?: Partial<HChatDocument>
}