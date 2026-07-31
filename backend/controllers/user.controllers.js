import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../moduls/user.moduls.js"
import geminiResponse from "../gemini.js"
import moment from "moment/moment.js"

export const getCurrentUser = async(req, res)=>{
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        
        if(!user){
            // Use 404 for 'Not Found' instead of 400
            return res.status(404).json({message:"User not found"});
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("GetCurrentUser Error:", error.message);
        return res.status(500).json({message:"Server error fetching user"});
    }
}

export const updateAssistant = async (req,res)=>{
    try {
        const {assistantName, imageUrl} = req.body;
        let assistantImage = imageUrl; // Default to existing URL

        if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path);
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        }, {new:true}).select("-password");

        return res.status(200).json(user);
    } catch (error) {
        console.error("UpdateAssistant Error:", error.message);
        return res.status(500).json({message:"Error updating assistant settings"});
    }
}

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || command.trim() === "") {
      return res.json({
        type: "general",
        userInput: "",
        response: "I didn't hear anything. Please try again.",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save to history
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    // 1️⃣ CALL GEMINI
    const result = await geminiResponse(command, assistantName, userName);

    // 2️⃣ DEFENSIVE CHECK: If result is null/undefined (API failed), handle it gracefully
    if (!result) {
        return res.json({
            type: "general",
            userInput: command,
            response: `${user.assistantName || "Assistant"} is having trouble connecting right now. Please try again later.`,
        });
    }

    // 3️⃣ SAFE PARSING
    let gemResult;
    try {
        // Handle if result is already an object or a string
        if (typeof result === "object") {
            gemResult = result;
        } else {
            const jsonMatch = result.match(/{[\s\S]*}/);
            gemResult = JSON.parse(jsonMatch[0]);
        }
    } catch (err) {
      console.error("JSON Parsing Error:", err.message);
      return res.json({
        type: "general",
        userInput: command,
        response: "I'm a bit confused. Can you say that again?",
      });
    }

    const { type, userInput, response } = gemResult;
    const cleanInput = userInput || command;

    // 4️⃣ RESPONSE LOGIC
    // Using an object to map responses is cleaner than a long switch
    const dateHandlers = {
        "get-date": () => `Current date is ${moment().format("YYYY-MM-DD")}`,
        "get-time": () => `Current time is ${moment().format("hh:mm A")}`,
        "get-day": () => `Today is ${moment().format("dddd")}`,
        "get-month": () => `Current month is ${moment().format("MMMM")}`,
    };

    if (dateHandlers[type]) {
        return res.json({
            type,
            userInput: cleanInput,
            response: dateHandlers[type](),
        });
    }

    // Default handling for search and app opening
    return res.json({
        type: type || "general",
        userInput: cleanInput,
        response: response || "I'm not sure how to help with that yet.",
    });

  } catch (error) {
    console.error("AskAssistant Global Error:", error.message);
    return res.status(500).json({ response: "Internal Assistant Error" });
  }
};