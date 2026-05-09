import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import NameModal from './components/NameModal';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('chat_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => newSocket.close();
  }, [setSocket]);

  const handleJoin = (name) => {
    setUserName(name);
  };

  const handleSendMessage = (messageText) => {
    if (socket && userName) {
      const messageData = {
        name: userName,
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      socket.emit('chat_message', messageData);
    }
  };

  return (
    <div className="app-container">
      {!userName && <NameModal onJoin={handleJoin} />}
      
      <header className="chat-header">
        <h1>Real-Time Chat</h1>
      </header>

      <ChatWindow messages={messages} currentUserName={userName} />
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
