//import { use } from "react"
import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../moduls/user.model.js"
import geminiResponse from "../gemini.js"
import moment from "moment/moment.js"
import { truncates } from "bcryptjs"
import { response } from "express"





export const getCurrentUser = async(req, res)=>{

    try {
        const userId= req.userId
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        return res.status(200).json(user)

    } catch (error) {
        return res.status(400).json({message:"get current user error"})
        
    }
}

export const updateAssistant = async (req,res)=>{
    try {
        const {assistantName, imageUrl}=req.body 
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }

        const user=await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        },{new:true}).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"updateassistant error"})
    }
}


export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    // 1️⃣ Check for empty command
    if (!command || command.trim() === "") {
      return res.json({
        type: "general",
        userInput: "",
        response: "I didn't hear anything. Please try again.",
      });
    }

    // 2️⃣ Save command to history
    const user = await User.findById(req.userId);
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    // 3️⃣ Call Gemini
    const result = await geminiResponse(command, assistantName, userName);
    //console.log("gemini ai response:", result);

    // 4️⃣ Parse JSON safely
    const jsonMatch = result.match(/{[\s\S]*}/); // safer regex
    if (!jsonMatch) {
      return res.json({
        type: "general",
        userInput: command,
        response: "Sorry, I can't understand that.",
      });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return res.json({
        type: "general",
        userInput: command,
        response: "Sorry, I can't understand that.",
      });
    }

    const { type } = gemResult;

    // 5️⃣ Handle commands
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res.json({
          type: "general",
          userInput: gemResult.userInput || command,
          response: "I didn't understand that command.",
        });
    }
  } catch (error) {
    console.error("ask assistant error:", error);
    return res.status(500).json({ response: "Ask assistant error" });
  }
};





// export const askToAssistant = async (req, res) => {
//   try {
//     const { command } = req.body;
//     const user = await User.findById(req.userId);
//     const userName = user.name;
//     const assistantName = user.assistantName;

//     const result = await geminiResponse(command, assistantName, userName);

//     let gemResult;
//     try {
//       const jsonPath = result.match(/{[\s\s]*}/);
//       if (jsonPath) {
//         gemResult = JSON.parse(jsonPath[0]);
//       } else {
//         // fallback if AI didn’t return JSON
//         gemResult = {
//           type: "general",
//           userInput: command,
//           response: result
//         };
//       }
//     } catch (parseError) {
//       return res.status(500).json({ response: "Error parsing AI response" });
//     }

//     const { type } = gemResult;

//     switch (type) {
//       case "get-date":
//         return res.json({
//           type,
//           userInput: gemResult.userInput,
//           response: `current date is ${moment().format("YYYY-MM-DD")}`
//         });

//       case "get-time":
//         return res.json({
//           type,
//           userInput: gemResult.userInput,
//           response: `current time is ${moment().format("hh-mm-A")}`
//         });

//       case "get-day":
//         return res.json({
//           type,
//           userInput: gemResult.userInput,
//           response: `today is ${moment().format("dddd")}`
//         });

//       case "get-month":
//         return res.json({
//           type,
//           userInput: gemResult.userInput,
//           response: `today is ${moment().format("MMMM")}`
//         });

//       // all general / search types
//       case "google-search":
//       case "youtube-search":
//       case "youtube-play":
//       case "general":
//       case "calculator-open":
//       case "instagramo-pen":
//       case "facebook-open":
//       case "weather-show":
//         return res.json({
//           type,
//           userInput: gemResult.userInput,
//           response: gemResult.response
//         });

//       default:
//         return res.status(400).json({
//           response: "I didn't understand that command."
//         });
//     }
//   } catch (error) {
//     return res.status(500).json({ response: "ask assistant error" });
//   }
// };
