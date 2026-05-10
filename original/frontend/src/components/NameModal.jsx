import { useState } from 'react';

const NameModal = ({ onJoin, error }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome to Chat</h2>
        <p>Please enter your name to join</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          <button type="submit" disabled={!name.trim()}>
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameModal;
