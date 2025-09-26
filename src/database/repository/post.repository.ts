import { DatabaseRepository, Lean } from "./database.repository";
import {CommentModel, IPost as TDocument} from "../model"
import { HydratedDocument, Model, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery } from "mongoose";
import { CommentRepository } from "./comment.repository";



export class PostRepository extends DatabaseRepository<TDocument>{
private commentModel = new CommentRepository(CommentModel)
  constructor(protected override readonly model:Model<TDocument>){
    super(model)
  }
  async findCursor ({
  filter,
  options,
  select,
  }:{
    filter?:RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> |undefined;
    options?: QueryOptions<TDocument> |undefined;
  }):Promise<HydratedDocument<TDocument>[] | []| Lean<TDocument>[] | any>{
let result =[]  
    const cursor = this.model
 .find(filter || {})
 .select(select || "")
 .populate(options?.populate as PopulateOptions[])
 .cursor()
 for (let doc = await cursor.next(); doc !=null; doc=await cursor.next()) {
   

  const comments = await this.commentModel.find({
    filter:{
      postId:doc._id,
      commentId:{$exists:false}
    }
  })
  result.push({post:doc,comments})
  
 }
return  result
}
}