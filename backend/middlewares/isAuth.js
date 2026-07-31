// import jwt from "jsonwebtoken"



// const isAuth = async(req, res,next) =>{
//     try {
//         const token= req.cookies.token
//         if(!token){
//             return res.status(400).json({message:"token not found"})
//         }

//       const verifyToken = await jwt.verify(token,process.env.JWT_SECRET)
//       req.userId=verifyToken.userId

//       next()

//     } catch (error)
//      {
//         console.log(error)
//         return res.status(500).json({message:"is auth error"})
//     }
// } 

// export default isAuth

import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            // 401 is the standard for "Not Authenticated"
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({ message: "Token is not valid" });
    }
};

export default isAuth;