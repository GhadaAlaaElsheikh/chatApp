const clientIo = io("http://localhost:3000/",{
  auth:{authorization:"Bearer "}
})
const clientIo2 = io("http://localhost:3000/")


clientIo.on("connect",()=>{
  console.log(`server stablish connection successfully`);
  
})

clientIo.on("connect_error",(error)=>{
  console.log(`connection error ::${error.message}`);
  
})
clientIo.emit("sayHi","hello from FE to BE",(res)=>{
  console.log({res});
  
})
clientIo.on("productStock",(data,callback)=>{
  console.log({product:data});
  callback("done")
  
})