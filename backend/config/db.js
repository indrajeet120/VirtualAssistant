

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


// import mongoose from "mongoose";

// const connectDb = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connected successfully");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// export default connectDb;

import mongoose from "mongoose";
import dns from "dns";

// Ensure Node.js uses Google Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Fallback gracefully if custom DNS servers cannot be set
}

const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("❌ Error: MONGO_URI is not defined in environment variables.");
      process.exit(1);
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    
    // In production, we want the process to exit so Render can restart the container
    process.exit(1);
  }
};

export default connectDb;


