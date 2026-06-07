
const UserList = ({ users, currentUser, onSelectUser }) => {
  const otherUsers = users.filter((u) => u.username !== currentUser);
  const onlineCount = otherUsers.filter(u => u.isOnline).length;

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (isoString) => {
    if (!isoString) return 'Offline';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h3>Conversations</h3>
        <span className="online-count">{onlineCount} online</span>
      </div>
      <div className="user-list">
        {otherUsers.length === 0 ? (
          <div className="no-users">No users found</div>
        ) : (
          otherUsers.map((user) => {
            const lastMsg = user.lastMessage;
            const hasLastMsg = !!lastMsg;
            const isMe = hasLastMsg && lastMsg.from === currentUser;
            const lastMsgText = hasLastMsg ? (isMe ? `You: ${lastMsg.message}` : lastMsg.message) : '';
            
            return (
              <div
                key={user.username}
                className={`user-item ${user.isAnnouncementChannel ? 'official-channel' : (user.isOnline ? 'online' : 'offline')}`}
                onClick={() => onSelectUser(user.username)}
              >
                <div className={`user-avatar ${user.isAnnouncementChannel ? 'official' : ''}`}>
                  {user.isAnnouncementChannel ? '📢' : user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-info-top">
                    <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {user.username}
                      {user.isAnnouncementChannel && (
                        <span className="official-badge">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </span>
                      )}
                    </span>
                    {hasLastMsg && (
                      <span className="last-message-time">
                        {formatMessageTime(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="user-info-bottom">
                    <span className="last-message-preview">
                      {hasLastMsg ? lastMsgText : (user.isAnnouncementChannel ? 'System announcements' : (user.isOnline ? 'Online' : 'Offline'))}
                    </span>
                    {!user.isOnline && !user.isAnnouncementChannel && (
                      <span className="last-seen-status">
                        Last seen {formatLastSeen(user.lastSeen)}
                      </span>
                    )}
                    {user.isAnnouncementChannel && (
                      <span className="official-label">Official</span>
                    )}
                  </div>
                </div>
                {user.isOnline && !user.isAnnouncementChannel && <div className="online-indicator online"></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;

