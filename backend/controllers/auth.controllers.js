import genToken from "../config/token.js"
import User from "../moduls/user.moduls.js"
import bcrypt from "bcryptjs"


export const signUp = async(req,res)=>{
    try {
        const {name, email,password}=req.body

        // Add validation here
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existEmail=await User.findOne({email});
        if(existEmail){
            return res.status(400).json({message:"email already exist!"})
        }
        if( password.length<6){
            return res.status(400).json({message:"password must be atleast 6 characters !"})

        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            name,password:hashedPassword,email
        })

        const token= await genToken(user._id)

        const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: isHttps ? "none" : "lax",
          secure: isHttps
        };

        res.cookie("token", token, cookieOptions);

        const userData = user.toObject ? user.toObject() : { ...user };
        delete userData.password;
        userData.token = token;

        return res.status(201).json(userData);
    } catch (error) {
        return res.status(500).json({message:`sign up error ${error}`})
        
    }
}


export const Login = async(req,res)=>{
    try {
        const { email,password}=req.body

        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"email dose not  exist!"})
        }
       const isMatch= await bcrypt.compare(password,user.password)
       
       if(!isMatch){
        return res.status(400).json({message:"incorrect password"})
       }

        const token= await genToken(user._id)

        const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: isHttps ? "none" : "lax",
          secure: isHttps
        
        };

        res.cookie("token", token, cookieOptions);

        const userData = user.toObject ? user.toObject() : { ...user };
        delete userData.password;
        userData.token = token;

        return res.status(200).json(userData);
    } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
        
    }
}

export const logOut=async (req,res)=>{
    try {
        const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
        res.clearCookie("token", {
          httpOnly: true,
          sameSite: isHttps ? "none" : "lax",
          secure: isHttps,


        });
        return res.status(200).json({message:"log out successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
    }
}
