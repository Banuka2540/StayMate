//checks the mongodb connection 
import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected ! ");
    }
    catch(error){
        console.log("MongoDB connection Failed ! ");
        process.exit(1);
    }
}

export default connectDB;