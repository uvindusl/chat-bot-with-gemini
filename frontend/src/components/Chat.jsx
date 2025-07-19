import { useState } from "react";

function Chat() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (message.trim()) {
      const userMessage = message.trim();

      setAllMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, sender: "user" },
      ]);

      setMessage("");
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
    <div className="center">
      <div className="card-container">
        <div className="card-header">
          <div className="img-avatar"></div>
          <div className="text-chat">Jimmy (The Robot)</div>
        </div>
        <div className="card-body">
          <div className="messages-container">
            {allMessages.map((msg, index) => (
              <div
                key={index}
                className={`message-box ${
                  msg.sender === "user"
                    ? "right"
                    : msg.sender === "backend"
                    ? "left"
                    : "system-message"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="message-input">
            <form onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type your message here"
                className="message-send"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button type="submit" className="button-send">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
