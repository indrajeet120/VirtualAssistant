import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors";
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"


const app = express() // express ko call karte hai 
const port = process.env.PORT || 8000;

app.use(express.json())
app.use(cookieParser())


app.use(cors({
  origin: "https://virtualassistant-8gq7.onrender.com",
 
  credentials: true
}));


app.use("/api/auth",authRouter) //middleware
app.use("/api/user",userRouter) //middleware

// app.get("/", (req, res) => {
//   res.send("🚀 Backend server is running");
// });

//for testing the gemini api--
// app.get("/",async (req,res)=>{
//   let prompt=req.query.prompt
//   let data=await geminiResponse(prompt)
//   res.json(data)
// })



// app.listen(port,()=>{ 
//     connectDb() ;   
//     console.log("server started")
// })


// Connect DB first, then start server
const startServer = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`✅ Server started on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
