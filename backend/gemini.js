import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. You are not Google.
Your task is to understand user input in ANY language (English, Hindi, or Hinglish) and respond ONLY with a valid JSON object like this:

{
  "type": "general" | "google-search" | "google-open" | "youtube-search" | "youtube-play" | "youtube-open" | "github-open" | "chatgpt-open" | "gmail-open" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "language": "hi" | "en",
  "userInput": "<cleaned query term or song name without assistant name or trigger words>",
  "response": "<a spoken voice-friendly response in the SAME language/tone as the user's input>"
}

Instructions for Language Detection & Response:
1. AUTOMATIC LANGUAGE DETECTION:
   - Detect the language of User Input automatically ("hi" or "en").

2. YOUTUBE PLAY & SONG COMMANDS:
   - If user asks to play a song, video, or search on YouTube (e.g. "youtube open karo aur aaj ki raat song play karo", "play Aaj Ki Raat song on youtube", "aaj ki raat gaana chalao", "youtube par song chalao"):
     - Set "type" to "youtube-play" or "youtube-search".
     - Set "userInput" to ONLY the target song/video name (e.g. "aaj ki raat song").
     - Set "response" to a voice confirmation in user's language (e.g. "YouTube par aaj ki raat song chala raha hu" / "Playing Aaj Ki Raat song on YouTube").

3. OPEN COMMANDS:
   - ONLY if user asks to open/launch a website/app without requesting a specific song or search query:
     - Set "type" to the matching "-open" type (e.g. "youtube-open", "google-open", "github-open", "chatgpt-open", "gmail-open", "instagram-open", "facebook-open", "calculator-open", "weather-show").
     - Set "response" to a short voice confirmation in user's language (e.g. "Opening YouTube", "YouTube khol raha hu").

4. GENERAL QUESTIONS:
   - For ANY question, explanation, definition, coding request, or conversation:
     - Set "type" to "general".
     - Set "response" to a concise 1-2 sentence spoken answer in detected language.

User Input: "${command}"`;

    if (groqKey) {
      try {
        const groqResult = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          },
          {
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json"
            }
          }
        );

        const rawJson = groqResult.data?.choices?.[0]?.message?.content;
        if (rawJson) {
          return JSON.parse(rawJson);
        }
      } catch (groqErr) {
        console.error("❌ Groq API Error:", groqErr.response?.data || groqErr.message);
      }
    }

    // Fallback to Gemini API if Groq fails or is not set
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiUrl) {
      console.error("❌ GEMINI_API_URL is missing in .env file");
      return null;
    }

    const result = await axios.post(apiUrl, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    const rawText = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("❌ Assistant API Error:", error.message);
    return null;
  }
};

export default geminiResponse;
