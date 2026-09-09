import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import NameModal from './components/NameModal';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';

const production = 'https://twochat-app-ecib.onrender.com/';
// const testing = 'http://localhost:5000';
const SOCKET_SERVER_URL = production;

function App() {
  const socketRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState([]); // List of { username, isOnline }
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  // Refs to prevent stale closures in socket event listeners
  const selectedUserRef = useRef(selectedUser);
  const userNameRef = useRef(userName);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('users_update', (userList) => {
      setUsers(userList);
    });

    socketRef.current.on('receive_private_message', (data) => {
      const activeChat = selectedUserRef.current;
      const currentMe = userNameRef.current;

      const isAnnouncement = activeChat === "2Chat Announcements" && data.from === "2Chat Announcements";
      const isCurrentChat = (data.from === activeChat && data.to === currentMe) || (data.from === currentMe && data.to === activeChat);

      if (isAnnouncement || isCurrentChat) {
        setMessages((prev) => [...prev, data]);
      }
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
  const selectedUserLastSeen = users.find(u => u.username === selectedUser)?.lastSeen;

  const formatLastSeen = (isoString) => {
    if (!isoString) return 'Offline';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;

    return `Last seen on ${date.toLocaleDateString()}`;
  };

  // Announcements configuration
  const isAnnouncement = selectedUser === "2Chat Announcements";
  const isAdmin = userName.toLowerCase() === "admin";
  const isInputDisabled = isAnnouncement ? !isAdmin : !selectedUserStatus;
  const placeholderText = isAnnouncement
    ? (isAdmin ? "Type an announcement..." : "Only admins can send messages here")
    : (selectedUserStatus ? "Type a message..." : "User is offline");

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
              {isAnnouncement ? (
                <>
                  <h1 className="chat-header-title">
                    {selectedUser}
                    <span className="official-badge-header">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                  </h1>
                  <p className="status-official">Official Channel</p>
                </>
              ) : (
                <>
                  <h1>{selectedUser}</h1>
                  <p className={selectedUserStatus ? 'status-online' : 'status-offline'}>
                    {selectedUserStatus ? 'Online' : formatLastSeen(selectedUserLastSeen)}
                  </p>
                </>
              )}
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
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={isInputDisabled} 
            placeholder={placeholderText}
          />
        </>
      )}
    </div>
  );
}

export default App;

