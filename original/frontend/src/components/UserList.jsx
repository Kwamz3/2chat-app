
const UserList = ({ users, currentUser, onSelectUser }) => {
  const otherUsers = users.filter((u) => u.username !== currentUser);
  const onlineCount = otherUsers.filter(u => u.isOnline).length;

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
          otherUsers.map((user) => (
            <div
              key={user.username}
              className={`user-item ${user.isOnline ? 'online' : 'offline'}`}
              onClick={() => onSelectUser(user.username)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className={`user-status ${user.isOnline ? 'online' : 'offline'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
