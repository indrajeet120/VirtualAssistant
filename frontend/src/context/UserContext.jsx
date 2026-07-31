// import React, { createContext, useEffect, useState } from 'react'

// export const userDataContext = createContext();
// import axios from 'axios';



// function UserContext({children}) {
//     const serverUrl="http://localhost:8000"
//     const  [userData, setUserData] = useState(null)
//         const [frontendImage, setFrontendImage] = useState(null)
//         const [backendImage, setBackendImage] = useState(null)
//         const [selectedImage, setSelectedImage] = useState(null)


//     const handleCurrentUser= async ()=>{
//       try {
        
//         const result= await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
//         setUserData(result.data)
//         console.log(result.data)

//       } catch (error) {
//         console.log(error)
//       }
//     }


//     //feth the response from gemini
//     const getGeminiResponse= async(command)=>{
//       try {
//         const result = await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
//         return result.data
//       } catch (error) {
//         console.log(error)
        
//       }
//     }



//     useEffect(()=>{
//       handleCurrentUser()
//     },[])

//     const value={
//          serverUrl,
//          userData, setUserData,backendImage, setBackendImage
//          ,frontendImage, setFrontendImage,selectedImage ,setSelectedImage,
//          getGeminiResponse
//     };
//   return (
    
//         <userDataContext.Provider value={value}>
//       {children}
//         </userDataContext.Provider>
     
  
//   );
// }

// export default UserContext;
//export {userDataContext};



// import React, { createContext, useEffect, useState } from "react";
// import axios from "axios";

// export const userDataContext = createContext();

// function UserContext({ children }) {
//   const serverUrl = "http://localhost:8000";
//   const [userData, setUserData] = useState(null);

//   // 🔹 Extra states for images and selection
//   const [frontendImage, setFrontendImage] = useState(null);
//   const [backendImage, setBackendImage] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);

//   // Fetch current logged-in user
//   const handleCurrentUser = async () => {
//     try {
//       const res = await axios.get(`${serverUrl}/api/user/current`, {
//         withCredentials: true,
//       });
//       setUserData(res.data);
//       console.log("Current user:", res.data);
//     } catch (error) {
//       console.error("Not logged in:", error);
//       setUserData(null);
//     }
//   };

//   // Ask Gemini assistant
//   const getGeminiResponse = async (command) => {
//     if (!command || command.trim().length === 0) {
//       return { response: "I didn't hear anything. Please try again.", type: "general" };
//     }

//     try {
//       const res = await axios.post(
//         `${serverUrl}/api/user/asktoassistant`,
//         { command },
//         { withCredentials: true }
//       );
//       return res.data;
//     } catch (error) {
//       console.error("Error fetching Gemini response:", error);
//       return { response: "Failed to get response.", type: "error" };
//     }
//   };

//   useEffect(() => {
//     handleCurrentUser();
//   }, []);

//   return (
//     <userDataContext.Provider
//       value={{
//         serverUrl,
//         userData,
//         setUserData,
//         getGeminiResponse,
//         frontendImage,
//         setFrontendImage,
//         backendImage,
//         setBackendImage,
//         selectedImage,
//         setSelectedImage,
//       }}
//     >
//       {children}
//     </userDataContext.Provider>
//   );
// }

// export default UserContext;




import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const userDataContext = createContext();

function UserContext({ children }) {
  // 1. DYNAMIC SERVER URL
  // This automatically detects if you are working locally or on Render
  const serverUrl = window.location.hostname === "localhost" 
    ? "http://localhost:8000" 
    : "https://your-backend-service-name.onrender.com"; // <-- Replace with your real Render Backend URL

  const [userData, setUserData] = useState(null);

  // Extra states for images and selection
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch current logged-in user
  const handleCurrentUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(res.data);
      console.log("✅ User session restored:", res.data);
    } catch (error) {
      // 2. SILENT ERROR HANDLING
      // We check for 401 (Unauthorized) which means guest user.
      // This prevents the console from being filled with scary error messages.
      if (error.response?.status === 401) {
        console.log("ℹ️ Guest User: No active session found.");
      } else {
        console.warn("⚠️ Could not connect to server:", error.message);
      }
      setUserData(null);
    }
  };

  // Ask Gemini assistant
  const getGeminiResponse = async (command) => {
    if (!command || command.trim().length === 0) {
      return { response: "I didn't hear anything. Please try again.", type: "general" };
    }

    try {
      const res = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command }, // Ensure your backend controller expects 'command' or 'prompt'
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      // 3. RATE LIMIT HANDLING (429)
      if (error.response?.status === 429) {
         return { response: "I am a bit busy right now. Please wait a minute.", type: "error" };
      }
      console.error("❌ Assistant Error:", error.response?.data || error.message);
      return { response: "Sorry, I encountered an error. Please try again.", type: "error" };
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <userDataContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        getGeminiResponse,
        frontendImage,
        setFrontendImage,
        backendImage,
        setBackendImage,
        selectedImage,
        setSelectedImage,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;







