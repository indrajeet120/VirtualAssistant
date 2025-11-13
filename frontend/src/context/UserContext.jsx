



import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "https://virtualassistantbakend1.onrender.com";
  const [userData, setUserData] = useState(null);

  // 🔹 Extra states for images and selection
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
      console.log("Current user:", res.data);
    } catch (error) {
      console.error("Not logged in:", error);
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
        { command },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      return { response: "Failed to get response.", type: "error" };
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
