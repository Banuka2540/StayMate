import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type : String , 
            required:true
        } , 

        email:{
            type:email ,
            required:true 
        } , 

        role: {
            type:String ,
            enum:[ "User" , "Admin" , "Provider" ] ,  
            default: "User"
        }
    }
)