import React, { useContext, useEffect, useState, useRef } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { VscListSelection, VscChromeClose } from "react-icons/vsc";

const openCommandsMap = [
  {
    keywords: ["youtube", "yt"],
    url: "https://www.youtube.com",
    confirmEn: "Opening YouTube.",
    confirmHi: "YouTube khol raha hu.",
  },
  {
    keywords: ["google"],
    url: "https://www.google.com",
    confirmEn: "Opening Google.",
    confirmHi: "Google khol raha hu.",
  },
  {
    keywords: ["github"],
    url: "https://github.com",
    confirmEn: "Opening GitHub.",
    confirmHi: "GitHub khol raha hu.",
  },
  {
    keywords: ["instagram", "insta"],
    url: "https://instagram.com",
    confirmEn: "Opening Instagram.",
    confirmHi: "Instagram khol raha hu.",
  },
  {
    keywords: ["facebook", "fb"],
    url: "https://facebook.com",
    confirmEn: "Opening Facebook.",
    confirmHi: "Facebook khol raha hu.",
  },
  {
    keywords: ["gmail", "email", "mail"],
    url: "https://mail.google.com",
    confirmEn: "Opening Gmail.",
    confirmHi: "Gmail khol raha hu.",
  },
  {
    keywords: ["chatgpt", "chat gpt"],
    url: "https://chatgpt.com",
    confirmEn: "Opening ChatGPT.",
    confirmHi: "ChatGPT khol raha hu.",
  },
  {
    keywords: ["calculator", "calculater"],
    url: "https://www.google.com/search?q=calculator",
    confirmEn: "Opening Calculator.",
    confirmHi: "Calculator khol raha hu.",
  },
  {
    keywords: ["weather", "mausam"],
    url: "https://www.google.com/search?q=weather",
    confirmEn: "Opening Weather.",
    confirmHi: "Mausam dikha raha hu.",
  },
];

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [ham, setHam] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const restartTimerRef = useRef(null);
  const hasGreetedRef = useRef(false);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
      navigate("/signin");
    }
  };

  const startRecognition = () => {
    if (isSpeakingRef.current || isRecognizingRef.current) return;
    try {
      recognitionRef.current?.start();
    } catch (err) {
      if (err.name !== "InvalidStateError") {
        console.warn("Start recognition error:", err);
      }
    }
  };

  const speak = (text, targetLang = "en") => {
    if (!text) return;
    console.log("Speaking response:", text);

    try {
      synth.cancel();
    } catch (e) {}

    // Temporarily stop microphone recognition while assistant speaks
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    isRecognizingRef.current = false;
    setListening(false);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    const isHindiText = targetLang === "hi" || /[\u0900-\u097F]/.test(text) || /\b(kya|hai|batao|karo|hota|raha|hu|kholo|khol)\b/i.test(text);

    if (isHindiText) {
      utterance.lang = "hi-IN";
      const hindiVoice = voices.find((v) => v.lang === "hi-IN" || v.lang.includes("hi"));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = "en-IN";
      const indianVoice = voices.find((v) => v.lang === "en-IN" || v.lang.includes("en-IN"));
      const engVoice = voices.find((v) => v.lang.includes("en"));
      if (indianVoice) utterance.voice = indianVoice;
      else if (engVoice) utterance.voice = engVoice;
    }

    isSpeakingRef.current = true;
    setAiText(text);

    utterance.onend = () => {
      // Keep AI response text visible on screen so user can read it
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 500);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 500);
    };

    synth.speak(utterance);
  };

  const openUrl = (url) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, "_blank");
    }
  };

  // Instant Frontend Intent Detection before Groq API processing
  const checkAndExecuteOpenCommand = (rawQuery) => {
    if (!rawQuery) return false;
    const query = rawQuery.toLowerCase().trim();

    const isHindi = /\b(kholo|khol|chalao|chalu|karo|ho|hai|sunao|gaana)\b/i.test(query);

    // 1. YouTube Play & Song Request (Highest priority for song/video requests)
    const hasPlayTrigger = ["play", "song", "gaana", "chalao", "chalu", "sunao"].some((w) => query.includes(w));
    if (hasPlayTrigger || (query.includes("youtube") && query.includes("search"))) {
      let songQuery = query
        .replace(/shifra|youtube|yt|open|karo|aur|play|song|gaana|chalao|chalu|listen|sunao|kholo|khol|par|on|please|can|you/gi, "")
        .trim();
      const targetQuery = songQuery.length > 0 ? songQuery : "music";
      const confirmText = isHindi ? `YouTube par ${targetQuery} chala raha hu.` : `Playing ${targetQuery} on YouTube.`;
      speak(confirmText, isHindi ? "hi" : "en");
      openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(targetQuery)}`);
      return true;
    }

    // Check if prompt contains explicit open trigger verbs for website/app opening
    const hasOpenTrigger = ["open", "launch", "start", "run", "kholo", "khol"].some((verb) => query.includes(verb));
    if (!hasOpenTrigger) return false;

    // 2. Predefined Mapping Check (YouTube, Google, GitHub, Instagram, Facebook, Gmail, ChatGPT, Calculator, Weather)
    for (const item of openCommandsMap) {
      const matchesKeyword = item.keywords.some((kw) => query.includes(kw));
      if (matchesKeyword) {
        const confirmText = isHindi ? item.confirmHi : item.confirmEn;
        speak(confirmText, isHindi ? "hi" : "en");
        openUrl(item.url);
        return true;
      }
    }

    // 3. Dynamic Website Opening for ANY website (e.g. "Open Indian Express", "Open ISRO", "Open OpenAI", "Open Canva")
    let targetSite = query
      .replace(/shifra|open|launch|start|run|kholo|khol|please|official|website|site/gi, "")
      .trim();

    if (targetSite.length > 0) {
      const confirmText = isHindi ? `${targetSite} website khol raha hu.` : `Opening ${targetSite}.`;
      speak(confirmText, isHindi ? "hi" : "en");

      // Open Google Search for official website (using btnI feeling lucky / official website query)
      const officialSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(targetSite + " official website")}&btnI=1`;
      openUrl(officialSearchUrl);
      return true;
    }

    return false;
  };

  const handleAskQuestion = async (queryText) => {
    if (!queryText) return;
    const cleanQuery = queryText.trim();

    // Stop recognition while processing input
    try {
      recognitionRef.current?.stop();
    } catch (err) {}
    isRecognizingRef.current = false;
    setListening(false);

    // 1. INSTANT FRONTEND INTENT DETECTION (Runs before Groq API)
    const wasOpenCommand = checkAndExecuteOpenCommand(cleanQuery);
    if (wasOpenCommand) {
      console.log("⚡ Executed Open Command directly on frontend for:", cleanQuery);
      return;
    }

    // 2. GENERAL AI QUESTION (Send to Groq API)
    console.log("🤖 Sending query to Groq AI:", cleanQuery);
    setUserText(cleanQuery);
    setAiText("");
    setLoading(true);

    try {
      const data = await getGeminiResponse(cleanQuery);
      setLoading(false);
      if (data && data.response) {
        console.log("AI response received:", data.response, "Language:", data.language);
        setUserText("");
        setAiText(data.response);
        speak(data.response, data.language || "en");
      } else {
        setUserText("");
        speak("Sorry, I could not process that request.", "en");
      }
    } catch (err) {
      setLoading(false);
      setUserText("");
      speak("Sorry, an error occurred while processing.", "en");
    }
  };

  useEffect(() => {
    if (!userData) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Multi-lingual Indian English/Hindi support

    recognitionRef.current = recognition;

    let isMounted = true;

    recognition.onstart = () => {
      console.log("Listening started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onspeechstart = () => {
      console.log("Speech detected");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);

      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }

      if (isMounted && !isSpeakingRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              if (e.name !== "InvalidStateError") console.warn("Recognition restart:", e.message);
            }
          }
        }, 800);
      }
    };

    recognition.onerror = (error) => {
      if (error.error !== "no-speech") {
        console.warn("Recognition error:", error.error);
      }
      isRecognizingRef.current = false;
      setListening(false);
    };

    let speechDebounceTimer = null;

    recognition.onresult = (event) => {
      let currentTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0]?.transcript || "";
      }

      currentTranscript = currentTranscript.trim();
      if (!currentTranscript) return;

      const isFinal = event.results[event.results.length - 1]?.isFinal;

      const processRecognizedText = (text) => {
        if (!text) return;
        const assistantName = (userData?.assistantName || "").trim().toLowerCase();
        let queryText = text;
        if (assistantName && queryText.toLowerCase().includes(assistantName)) {
          const regex = new RegExp(assistantName, "gi");
          queryText = queryText.replace(regex, "").trim();
        }

        const textToSend = queryText.length > 0 ? queryText : text;
        console.log("Sending message to AI:", textToSend);
        handleAskQuestion(textToSend);
      };

      if (isFinal) {
        if (speechDebounceTimer) clearTimeout(speechDebounceTimer);
        processRecognizedText(currentTranscript);
        return;
      }

      // Fast response: Process 450ms after user finishes speaking
      if (speechDebounceTimer) clearTimeout(speechDebounceTimer);
      speechDebounceTimer = setTimeout(() => {
        processRecognizedText(currentTranscript);
      }, 450);
    };

    const speakGreeting = () => {
      const greetingText = `Hello ${userData?.name || ""}, what can I help you with?`;
      const greeting = new SpeechSynthesisUtterance(greetingText);
      greeting.lang = "en-IN";
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.lang.includes("en") || v.lang.includes("hi"));
      if (voice) greeting.voice = voice;

      let started = false;
      const safeStart = () => {
        if (!started && isMounted) {
          started = true;
          startRecognition();
        }
      };

      greeting.onend = safeStart;
      greeting.onerror = safeStart;

      setTimeout(safeStart, 1500);

      try {
        synth.cancel();
        synth.speak(greeting);
      } catch (e) {
        safeStart();
      }
    };

    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      speakGreeting();
    } else {
      startRecognition();
    }

    return () => {
      isMounted = false;
      try {
        recognition.stop();
      } catch (e) {}
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, [userData]);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col relative overflow-hidden lg:overflow-x-hidden p-4">
      
      {/* Mobile Drawer Menu */}
      <VscListSelection className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer z-40" onClick={() => setHam(true)} />
      <div className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-center ${ham ? "translate-x-0" : "translate-x-full"} transition-transform z-50`}>
        <VscChromeClose className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer" onClick={() => setHam(false)} />
        <button
          className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700 mt-[20px] ml-2 rounded-full text-[20px]"
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className="min-w-[150px] h-[60px] cursor-pointer text-center text-black mt-[10px] ml-2 font-semibold bg-blue-700 rounded-full px-[20px] py-[10px] text-[20px]"
          onClick={() => navigate("/customize")}
        >
          Customize your assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>
        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate">
          {userData?.history?.map((his, index) => (
            <div key={index} className="text-gray-200 text-[18px] w-full h-[30px]">{his}</div>
          ))}
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <button
        className="min-w-[150px] h-[50px] cursor-pointer text-center text-black font-semibold bg-blue-700 absolute hidden lg:block top-[20px] right-[20px] rounded-full text-[20px]"
        onClick={handleLogOut}
      >
        Log Out
      </button>
      <button
        className="min-w-[150px] h-[60px] cursor-pointer text-center text-black font-semibold bg-blue-700 absolute hidden lg:block top-[100px] right-[20px] rounded-full px-[20px] py-[10px] text-[20px]"
        onClick={() => navigate("/customize")}
      >
        Customize your assistant
      </button>

      {/* Assistant Image */}
      <div 
        className="w-[260px] h-[340px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={startRecognition}
        title="Click to speak"
      >
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>

      <h1 className="text-white text-[18px] font-semibold mt-2">
        I'm {userData?.assistantName}
      </h1>

      {/* AI / User GIF Indicators */}
      {!aiText && <img src={userImg} alt="" className="w-[160px] cursor-pointer" onClick={startRecognition} />}
      {aiText && <img src={aiImg} alt="" className="w-[160px] cursor-pointer" onClick={startRecognition} />}

      {/* Spoken / Answer Text Display */}
      <h1 className="text-white text-[19px] font-bold text-wrap text-center px-4 mt-1 min-h-[35px] flex items-center justify-center">
        {userText ? (
          <span className="text-blue-300">🧑 {userText}</span>
        ) : aiText ? (
          <span className="text-green-400">🤖 {aiText}</span>
        ) : loading ? (
          <span className="text-yellow-400 animate-pulse">Thinking...</span>
        ) : listening ? (
          <span className="text-gray-400 animate-pulse">🎤 Listening... (Speak now)</span>
        ) : (
          <span className="text-gray-500 text-[15px]">(Click image or type below to ask)</span>
        )}
      </h1>

      {/* Text Input Bar for Voice & Typing */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (textInput.trim()) {
            handleAskQuestion(textInput.trim());
            setTextInput("");
          }
        }}
        className="mt-3 flex items-center gap-2 w-[90%] max-w-[500px] z-30"
      >
        <input
          type="text"
          placeholder={`Ask ${userData?.assistantName || "assistant"} anything...`}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="flex-1 h-[45px] bg-[#ffffff15] border border-blue-400 rounded-full px-5 text-white placeholder-gray-400 outline-none text-[16px]"
        />
        <button 
          type="submit"
          className="h-[45px] px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-[16px] cursor-pointer"
        >
          Ask
        </button>
      </form>
    </div>
  );
}

export default Home;
