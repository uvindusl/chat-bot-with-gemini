import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const VoiceChat = () => {
  // A custom hook to handle the Web Speech API
  const useVoiceToText = ({ continuous, lang }) => {
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef(null);

    useEffect(() => {
      // Check for browser support
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error("Speech recognition is not supported in this browser.");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = lang;
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = false;

      // Event handler for when a result is received
      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const newTranscript = event.results[last][0].transcript;
        setTranscript(newTranscript);
      };

      // Event handler for when the recognition service stops
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Event handler for errors
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      // Clean up on component unmount
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }, [continuous, lang]);

    const startListening = () => {
      if (recognitionRef.current) {
        setTranscript("");
        setIsListening(true);
        recognitionRef.current.start();
      }
    };

    const stopListening = () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    const resetTranscript = () => {
      setTranscript("");
    };

    return {
      startListening,
      stopListening,
      transcript,
      isListening,
      resetTranscript,
    };
  };

  // Initialize all states
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Destructure resetTranscript from the hook
  const {
    startListening,
    stopListening,
    transcript,
    isListening,
    resetTranscript,
  } = useVoiceToText({
    continuous: false,
    lang: "en-US",
  });

  // Use a state to track when to send the message
  const [shouldSendMessage, setShouldSendMessage] = useState(false);

  // Use useEffect to update the message state when a new transcript is available
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      setShouldSendMessage(true); // Flag that a message should be sent
    }
  }, [transcript]);

  // A second useEffect to handle sending the message when the mic is off and a transcript exists
  useEffect(() => {
    // Only proceed if a message should be sent and the mic is not listening
    if (shouldSendMessage && !isListening) {
      handleSendMessage();
      setShouldSendMessage(false); // Reset the flag
    }
  }, [shouldSendMessage, isListening]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message.trim();

      // Update messages optimistically with the user's message
      setAllMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, sender: "user" },
      ]);

      // Clear the message and reset the transcript right after the message is sent
      setMessage("");
      resetTranscript();

      try {
        const response = await fetch("http://127.0.0.1:8080/display", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
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

        // Append the backend's response
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { text: backendResponseText, sender: "backend" },
        ]);

        // Text-to-speech for the backend response
        const utterance = new SpeechSynthesisUtterance(backendResponseText);
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true); // Set state to true when speaking begins
      } catch (error) {
        console.error("Error sending message:", error);
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
    <div className="flex flex-col h-full items-center p-6 bg-gray-50 rounded-2xl shadow-xl font-inter max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Voice Chat</h1>

      {/* Chat messages display area */}
      <div className="flex-1 w-full p-4 mb-4 bg-white rounded-lg shadow-inner overflow-y-auto max-h-96">
        {allMessages.length > 0 ? (
          allMessages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-100 text-right self-end"
                  : "bg-gray-200 text-left self-start"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center italic">
            Start speaking to send a message...
          </p>
        )}
      </div>

      {/* Mic controls */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-center items-center gap-6">
          <Mic
            onClick={startListening}
            role="button"
            className={`h-12 w-12 cursor-pointer transition-colors duration-300 ${
              isListening ? "text-red-500 animate-pulse" : "text-blue-600"
            }`}
          />
          <MicOff
            onClick={handleStop}
            role="button"
            className={`h-12 w-12 cursor-pointer transition-colors duration-200 ${
              isSpeaking ? "text-red-600" : "text-gray-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
