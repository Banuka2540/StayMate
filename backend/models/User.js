import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//user schema
const userSchema = new mongoose.Schema(
    {
        name:{
            type : String , 
            required:true
        } , 

        role: {
            type:String ,
            enum:[ "User" , "Admin" , "Provider" ] ,  
            default: "User" ,
            required:true
        }, 

        email:{
            type:String ,
            required:true 
        } , 

        password:{
            type:String , 
            required:true
        }
    }
)

//hash the password 
userSchema.pre("save", async function () {

    // Check whether password was modified
    if (!this.isModified("password")) {
        return;
    }

    // Hash password
    this.password = await bcrypt.hash(this.password, 10);

});

const User = mongoose.model("User" , userSchema) ;
export default User ; 