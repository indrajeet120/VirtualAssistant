

// const connectDb=async () =>{
//     try{
//         await mongoose.connect(ProcessingInstruction.evn.MONGODB_URL)
//         console.log("db connected")
//     }catch(error)
//     {
//         console.log(error)

//     }
// }

// export default connectDb


import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDb;


