import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, SendHorizontal } from "lucide-react";

// This is a mock implementation of a voice-to-text hook.
// It uses the browser's native Web Speech API if available, or
// simulates a response if not, to ensure the app is runnable.
function useVoiceToText({ continuous, lang }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const finalTranscript =
          event.results[event.results.length - 1][0].transcript;
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, [continuous, lang]);

  const startListening = () => {
    if (recognitionRef.current) {
      resetTranscript();
      recognitionRef.current.start();
    } else {
      console.warn(
        "Speech recognition not supported in this browser. Simulating a voice response."
      );
      setIsListening(true);
      setTimeout(() => {
        setTranscript("Hello, can you hear me? I am a simulated response.");
        setIsListening(false);
      }, 3000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function App() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMessagePending, setIsVoiceMessagePending] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceToText({
    continuous: false,
    lang: "en-US",
  });

  // Effect to handle auto-scrolling to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Effect to update the message state when a new transcript is available from voice input
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      setIsVoiceMessagePending(true);
    }
  }, [transcript]);

  // Effect to handle sending the voice message once listening has stopped
  useEffect(() => {
    if (isVoiceMessagePending && !isListening) {
      handleSendMessage();
      setIsVoiceMessagePending(false);
    }
  }, [isVoiceMessagePending, isListening]);

  const handleSendMessage = async (e) => {
    // Prevent default form submission if the function is triggered by a form
    if (e) {
      e.preventDefault();
    }

    const messageToSend = message.trim();

    if (messageToSend) {
      // Add user's message to the chat
      setAllMessages((prevMessages) => [
        ...prevMessages,
        { text: messageToSend, sender: "user" },
      ]);

      // Clear the message input and reset the transcript
      setMessage("");
      resetTranscript();

      try {
        const response = await fetch("http://127.0.0.1:8080/display", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageToSend }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        const backendResponseText =
          data.message || "No specific answer received.";

        // Add the backend's response to the chat
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { text: backendResponseText, sender: "backend" },
        ]);

        // Use Text-to-Speech for the backend response
        const utterance = new SpeechSynthesisUtterance(backendResponseText);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error handling message:", error);
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { text: `Error: ${error.message}`, sender: "system-error" },
        ]);
      }
    }
  };

  const handleStop = () => {
    stopListening();
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex flex-col w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center p-4 bg-gray-800 text-white shadow-md rounded-t-2xl">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold">
            🤖
          </div>
          <div className="text-xl font-medium ml-3">Jimmy (The Robot)</div>
        </div>

        <div
          className="flex flex-col flex-1 p-4 space-y-4 overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          {allMessages.length === 0 && (
            <div className="flex justify-center items-center h-full text-gray-400 italic">
              Start chatting with Jimmy!
            </div>
          )}
          {allMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl shadow-sm break-words ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                } ${
                  msg.sender === "system-error" ? "bg-red-200 text-red-800" : ""
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-100 rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <textarea
              placeholder="Type or speak your message here..."
              className="flex-1 p-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSpeaking || isListening}
            ></textarea>
            <button
              type="button"
              onClick={isListening ? handleStop : startListening}
              className={`p-3 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-700 hover:bg-gray-800 text-white"
              }`}
              title={isListening ? "Stop Listening" : "Start Listening"}
              disabled={isSpeaking}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
              type="submit"
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
              title="Send Message"
              disabled={!message.trim() || isSpeaking || isListening}
            >
              <SendHorizontal size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
