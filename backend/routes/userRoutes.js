import express from "express"; 
import User from "../models/user.js" ; 

const router = express.Router()

router.post("/register" , async(req , res) => {
    try{
        const{name,role,email,password} = req.body ; 

        const newUser = await User.create({
            name , 
            role , 
            email , 
            password
        }) ;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
        }}) ;
    
    }
    catch(error){
        res.status(400).json({
            success:false , 
            message:error.message
        });
    }   
});

export default router ; 