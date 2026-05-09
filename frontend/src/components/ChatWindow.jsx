import { useEffect, useRef } from 'react';

const ChatWindow = ({ messages, currentUserName }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((msg, index) => {
        const isMe = msg.name === currentUserName;
        return (
          <div
            key={index}
            className={`message-wrapper ${isMe ? 'me' : 'other'}`}
          >
            <span className="message-sender">{isMe ? 'Me' : msg.name}</span>
            <div className="message-bubble">{msg.message}</div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
