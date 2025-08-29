import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useVoiceToText } from "react-speakup"; // Using your preferred library

const VoiceChat = () => {
  // Initialize all states
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const { startListening, stopListening, transcript, isListening } =
    useVoiceToText({
      continuous: true, // Set to false to get a single, final transcript
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

      setMessage(""); // Clear the message state

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
      } catch (error) {
        console.error("Error sending message:", error);
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { text: `Error: ${error.message}`, sender: "system-error" },
        ]);
      }
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
            onClick={stopListening}
            role="button"
            className="h-12 w-12 cursor-pointer text-gray-400 hover:text-red-600 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
