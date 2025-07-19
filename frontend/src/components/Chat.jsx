import { useState, useEffect } from "react";

function Chat() {
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent the default form submission (page reload)
    if (message.trim()) {
      // Ensure the message is not empty
      setSentMessage([...sentMessage, message]); // Add the current message to the list
      setMessage(""); // Clear the input field after sending
    }
  };

  return (
    <div className="center">
      <div className="card-container">
        <div className="card-header">
          <div className="img-avatar"></div>
          <div className="text-chat">Jimmy</div>
        </div>
        <div className="card-body">
          <div className="messages-container">
            {sentMessage.map((msg, index) => (
              <div key={index} className="message-box left">
                <p>{msg}</p>
              </div>
            ))}
            <div className="message-box right">
              <p>I'm good, thanks for asking! How about you?</p>
            </div>
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
