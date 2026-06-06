import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import NameModal from './components/NameModal';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';

const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState([]); // List of { username, isOnline }
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('users_update', (userList) => {
      setUsers(userList);
    });

    socketRef.current.on('receive_private_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleJoin = (name) => {
    socketRef.current.emit('login', name, (response) => {
      if (response.success) {
        setUserName(name);
        setLoginError('');
      } else {
        setLoginError(response.error);
      }
    });
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Fetch history with this user
    socketRef.current.emit('fetch_chat_history', user, (history) => {
      setMessages(history);
    });
  };

  const handleSendMessage = (messageText) => {
    if (socketRef.current && userName && selectedUser) {
      const messageData = {
        to: selectedUser,
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('send_private_message', messageData);
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  // Find status of selected user
  const selectedUserStatus = users.find(u => u.username === selectedUser)?.isOnline;

  return (
    <div className="app-container">
      {!userName && <NameModal onJoin={handleJoin} error={loginError} />}
      
      <header className="chat-header">
        {selectedUser ? (
          <div className="chat-header-content">
            <button className="back-button" onClick={handleBackToList}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back
            </button>
            <div className="chat-with-info">
              <h1>{selectedUser}</h1>
              <p className={selectedUserStatus ? 'status-online' : 'status-offline'}>
                {selectedUserStatus ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ) : (
          <h1>2Chat</h1>
        )}
      </header>

      {userName && !selectedUser && (
        <UserList 
          users={users} 
          currentUser={userName} 
          onSelectUser={handleSelectUser} 
        />
      )}

      {selectedUser && (
        <>
          <ChatWindow messages={messages} currentUserName={userName} />
          <MessageInput onSendMessage={handleSendMessage} disabled={!selectedUserStatus} />
        </>
      )}
    </div>
  );
}

export default App;

