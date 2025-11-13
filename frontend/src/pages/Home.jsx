// import React, { useContext, useEffect, useState, useRef } from "react";
// import { userDataContext } from "../context/UserContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import aiImg from "../assets/ai.gif"
// import userImg from "../assets/user.gif"
// import { VscListSelection } from "react-icons/vsc";
// import { VscChromeClose } from "react-icons/vsc";

// function Home() {
//   const { userData, serverUrl, setUserData, getGeminiResponse } =
//     useContext(userDataContext);
//   const navigate = useNavigate();
//   const [listening, setListening] = useState(false);
//   const [userText,setUserText]=useState("")
//   const [aiText,setAiText]=useState("")
//   const isSpeakingRef = useRef(false);
//   const recognitionRef = useRef(null);
//   const [ham,setHam]= useState(false)
//   const isRecognizingRef=useRef(false)
//   const synth = window.speechSynthesis

//   const handeLogOut = async () => {
//     try {
//       const result = await axios.get(`${serverUrl}/api/auth/logout`, {
//         withCredentials: true,
//       });
//       setUserData(null);
//       navigate("/signin");
//     } catch (error) {
//       setUserData(null);
//       console.log(error);
//     }
//   };


// //function for startrecognition---
// const startRecognition=()=>{
  
//     if(!isSpeakingRef.current && !isRecognizingRef.current){
//      try {

//      recognitionRef.current?.start();
//      //setListening(true);
//      console.log("Recoginition requested to start");
//   } catch (error) {
//     // if(!error.message.includes("start")){
//     //   console.error("recognition error:", error);
//     // }
//     if(error.name !== "InvalidStateError"){
//       console.error("Start error:", error);
//     }
//   }
//   }
// };


//  // speak function----
//    const speak=(text)=>{
//     const utterence=new SpeechSynthesisUtterance(text)
//     utterence.lang='hi-IN';
//     const voice= window.speechSynthesis.getVoices()
//     const hindiVoice=voice.find(v=>v.lang==='hi-IN');
//     if(hindiVoice){
//       utterence.voice=hindiVoice;
//     }

//   isSpeakingRef.current=true
//     utterence.onend=()=>{
//       setAiText("")
//       isSpeakingRef.current=false;
//       setTimeout(()=>{
//          startRecognition(); //delay se race consition avoid hoti hai
//       },800);
     
//     }
//     synth.cancel(); //pahle se koi speech ho to band karo
//     synth.speak(utterence);
//    }
 
 
//   //google ko search karne bade-----
//    const handleCommand=(data)=>{
//       const {type,userInput, response} = data
//       speak(response);

//       if(type==='google-search'){
//         const query = encodeURIComponent(userInput);
//         window.open(`https://www.google.com/search?q=${query}`,'_blank');
//       }

//       if(type === 'calculater-open'){
//         window.open(`https://www.google.com/search?q=calculator`,'_blank');
//       }
//       if(type === 'instagram-open'){
//         window.open(`https://www.instagram.com`,'_blank');
//       }
//       if(type === 'facebook-open'){
//         window.open(`https://www.facebook.com`,'_blank');
//       }
//       if(type === 'weather-show'){
//         window.open(`https://www.google.com/search?q=weather`,'_blank');
//       }
//       if(type=== 'youtube-search' || type ==='youtube-play'){
//         const query = encodeURIComponent(userInput);
//         window.open(`https://www.youtube.com/results?search_query=$
//           {query}`,'_blank');
//       }

//    }

//   //  //web voice api--
//   useEffect(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true,
//     recognition.lang = "en-US";
//     recognition.interimResults= false;

//     recognitionRef.current=recognition;

//     let isMounted = true; // flag to avoid setstate on unmounted component

//     //start recognition after 1 second delay only if component still mounted
//     const startTimeout = setTimeout(()=>{
//       if(!isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
//         try {
//           recognition.start();
//           console.log("Recognition requested to start");
//         } catch (e) {
//           if(e.name !== "InvalidStateError"){
//             console.error(e);
//           }
//         }
//       }
//     },1000);


//     // const safeRecognition=()=>{
//     //   if(!isSpeakingRef.current && ! !isRecognizingRef.current){
//     //     try {
//     //       recognition.start();
//     //       console.log("Recognition requested to start");
//     //     } catch (err) {
//     //       if(err.name !== "InvalidStateError"){
//     //         console.error("Start error:", err);
//     //       }
//     //     }
//     //   }
//     // }

//     recognition.onstart =()=>{
//       //console.log("Recognition started");
//       isRecognizingRef.current= true;
//       setListening(true);
//     };

//     recognition.onend = () => {
    
//      isRecognizingRef.current=false;
//      setListening(false);

//      if( isMounted && !isSpeakingRef.current){
//       setTimeout(()=>{
//         if(isMounted){
//           try {
//             recognition.start();
//              console.log("Recognition restarted");
//           } catch (e) {
//             if(e.name !== "InvalidStateError") console.error(e);
//           }
//         }
        
//       },1000); //delay avoids rapid loop
//      }


//     };

//     recognition.onerror=(event)=>{
//       console.warn("Recognition error:", event.error);
//       isRecognizingRef.current=false;
//       setListening(false);
//       if(event.error !== "aborted" && isMounted && !isSpeakingRef.current){
//         setTimeout(()=>{
//           if(isMounted){
//             try {
//               recognition.start();
//               console.log("Recognition restarted after error");
//             } catch (e) {
//               if(e.name !== "InvalidStateError") console.error(e);
//             }
//           }
//           //safeRecognition();

//         },1000);
//       }
//     };



//     recognition.onresult = async (e) => {
//       const transcript = e.results[e.results.length-1][0].transcript.trim();
//       console.log("heard:" + transcript);

//         if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
//          setAiText("");
//           setUserText(transcript);
//           recognition.stop();
//          isRecognizingRef.current=false;
//          setListening(false);
//          const data = await getGeminiResponse(transcript);
//          //console.log(data);
//           handleCommand(data);
//           setAiText(data.response);
//           setUserText("");

//       }

//     };


//     window.speechSynthesis.onvoiceschanged=()=>{
//       const greeting = new SpeechSynthesisUtterance(`Hello $
//         {userData.name}, what can I help you with?`);
//         greeting.lang ='hi-IN';
//         greeting.onend = ()=>{
//           startTimeout(); //start listening after speech
//         };
//         window.speechSynthesis.speak(greeting);
//     };

//       return()=>{
//       isMounted=false;
//       clearTimeout(startTimeout);
//     recognition.stop();
//     setListening(false);
//     isRecognizingRef.current=false;
    
//   };
    
      
//   } , []);

//   // const fallback=setInterval(()=>{
//   //   if(!isSpeakingRef.current && !isRecognizingRef.current){
//   //     safeRecognition()
//   //   }
//   // },1000)
//   // safeRecognition()



  
//   return (
//     <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col relative overflow-hidden lg:overflow-x-hidden">
      
//       <VscListSelection className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] " onClick={()=> setHam(true)} />
//       <div className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-center ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
//         <VscChromeClose className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]" onClick={()=> setHam(false)}/>
//      <button
//         className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700  mt-[20px] ml-2  rounded-full text-[20px]"
//         onClick={handeLogOut}
//       >
//         Log Out
//       </button>
//       <button
//         className="min-w-[150px] h-[60px] cursor-pointer text-center text-black mt-[10px] ml-2 font-semibold bg-blue-700   rounded-full px-[20px] py-[10px] text-[20px]"
//         onClick={() => navigate("/customize")}
//       >
//         Customize your assistant
//       </button>

//       <div className="w-full h-[2px] bg-gray-400"></div>
//       <h1 className="text-white font-semibold text-[19px]">History</h1>
//       <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate ">
//         {userData.history?.map((his)=>(
//           <div className="text-gray-200 text-[18px] w-full h-[30px] ">{his}</div>
//         ))}
//       </div>
//       </div>

//       <button
//         className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700 absolute hidden lg:block top-[20px] right-[20px] rounded-full text-[20px]"
//         onClick={handeLogOut}
//       >
//         Log Out
//       </button>
//       <button
//         className="min-w-[150px] h-[60px] cursor-pointer text-center text-black font-semibold bg-blue-700  absolute hidden lg:block top-[100px] right-[20px] rounded-full px-[20px] py-[10px] text-[20px]"
//         onClick={() => navigate("/customize")}
//       >
//         Customize your assistant
//       </button>

//       <div
//         className="w-[300px] h-[400px] flex justify-center items-center
//        overflow-hidden rounded-4xl shadow-lg"
//       >
//         <img
//           src={userData?.assistantImage}
//           alt=""
//           className="h-full object-cover"
//         />
//       </div>

//       <h1 className="text-white text-[18px] font-semibold mt-3">
//         I'm {userData?.assistantName}
//       </h1>

//       {!aiText&& <img src={userImg} alt="" className='w-[200px]'/>}
//        {aiText&& <img src={aiImg} alt="" className='w-[200px]'/>}

//        <h1 className="text-white text-[18px] font-bold text-wrap">{userText?userText:aiText?aiText:null}</h1>
//     </div>
//   );
// }

// export default Home;

import React, { useContext, useEffect, useState, useRef } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { VscListSelection, VscChromeClose } from "react-icons/vsc";

function Home() {
  const { userData, getGeminiResponse, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [conversation, setConversation] = useState({ user: "", ai: "" });
  const [ham, setHam] = useState(false);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;
  const typingIntervalRef = useRef(null);

  const handleLogOut = () => {
    setUserData(null);
    navigate("/signin");
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e.name !== "InvalidStateError") console.error(e);
      }
    }
  };

  // Type AI response while speaking
  const speakAndType = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";

    const voices = synth.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) utterance.voice = hindiVoice;

    isSpeakingRef.current = true;

    // Clear previous typing
    clearInterval(typingIntervalRef.current);
    setConversation((prev) => ({ ...prev, ai: "" }));

    let index = 0;
    const totalDuration = 2000 + text.length * 50; // approximate duration
    const intervalTime = totalDuration / text.length;

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setConversation((prev) => ({ ...prev, ai: prev.ai + text[index] }));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
      }
    }, intervalTime);

    utterance.onend = () => {
      clearInterval(typingIntervalRef.current);
      setConversation((prev) => ({ ...prev, ai: text }));
      isSpeakingRef.current = false;
      setTimeout(() => startRecognition(), 500);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput } = data;
    if (type === "google-search")
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
    if (type === "youtube-search" || type === "youtube-play")
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
    if (type === "calculater-open")
      window.open("https://www.google.com/search?q=calculator", "_blank");
    if (type === "instagram-open") window.open("https://www.instagram.com", "_blank");
    if (type === "facebook-open") window.open("https://www.facebook.com", "_blank");
    if (type === "weather-show") window.open("https://www.google.com/search?q=weather", "_blank");
  };

  useEffect(() => {
    if (!userData) return;

    // Assistant Welcome Message
    const welcomeMsg = `Hello! I am ${userData.assistantName}. How can I help you today?`;
    setConversation({ user: "", ai: "" });
    speakAndType(welcomeMsg);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      if (!isSpeakingRef.current) setTimeout(() => startRecognition(), 500);
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      if (event.error !== "aborted" && !isSpeakingRef.current) setTimeout(() => startRecognition(), 500);
    };

    recognition.onresult = async (e) => {
      let transcript = e.results[e.results.length - 1][0].transcript.trim();

      if (!transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) return;

      recognition.stop();
      isRecognizingRef.current = false;

      transcript = transcript.replace(new RegExp(userData.assistantName, "gi"), "").replace(/[?.!,]/g, "").trim();
      if (!transcript) return;

      setConversation({ user: transcript, ai: "..." });

      try {
        const data = await getGeminiResponse(transcript);
        speakAndType(data.response);
        handleCommand(data);
      } catch (err) {
        console.error("Gemini response error:", err);
        speakAndType("Sorry, I could not understand.");
      }
    };

    setTimeout(() => startRecognition(), 500);

    return () => {
      recognition.stop();
      clearInterval(typingIntervalRef.current);
      isRecognizingRef.current = false;
    };
  }, [userData]);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col relative overflow-hidden lg:overflow-x-hidden">

      {/* Hamburger Menu */}
      <VscListSelection className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]" onClick={() => setHam(true)} />
      <div className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-center ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <VscChromeClose className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]" onClick={() => setHam(false)} />
        <button className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700 mt-[20px] ml-2 rounded-full text-[20px]" onClick={handleLogOut}>
          Log Out
        </button>
        <button className="min-w-[150px] h-[60px] cursor-pointer text-center text-black mt-[10px] ml-2 font-semibold bg-blue-700 rounded-full px-[20px] py-[10px] text-[20px]" onClick={() => navigate("/customize")}>
          Customize your assistant
        </button>
      </div>

      {/* Top Right Buttons */}
      <button className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700 absolute hidden lg:block top-[20px] right-[20px] rounded-full text-[20px]" onClick={handleLogOut}>
        Log Out
      </button>
      <button className="min-w-[150px] h-[60px] cursor-pointer text-center text-black font-semibold bg-blue-700 absolute hidden lg:block top-[100px] right-[20px] rounded-full px-[20px] py-[10px] text-[20px]" onClick={() => navigate("/customize")}>
        Customize your assistant
      </button>

      {/* Assistant Image */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img src={userData?.assistantImage} alt="" className="h-full object-cover" />
      </div>

      <h1 className="text-white text-[18px] font-semibold mt-3">
        I'm {userData?.assistantName}
      </h1>

      {/* AI / User Animations */}
      {!conversation.user && !conversation.ai && <img src={userImg} alt="" className="w-[200px]" />}
      {(conversation.user || conversation.ai) && <img src={aiImg} alt="" className="w-[200px]" />}

      {/* Conversation Box */}
      <div className="w-[80%] lg:w-[60%] max-h-[300px] overflow-y-auto mt-4 flex flex-col gap-2 bg-[#00000050] p-3 rounded-lg">
        {conversation.user && <div className="text-blue-300 text-center text-[18px]">🧑 You: {conversation.user}</div>}
        {conversation.ai && <div className="text-green-400 text-center text-[18px]">🤖 {userData?.assistantName}: {conversation.ai}</div>}
      </div>
    </div>
  );
}

export default Home;


