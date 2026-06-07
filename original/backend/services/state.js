export const activeUsers = new Map();
export const allUsers = new Map();
export const conversations = new Map();

// Pre-seed announcements channel
conversations.set("announcements", [
  {
    from: "2Chat Announcements",
    to: "All",
    message: "Welcome to the official 2Chat Announcements channel! 📢 Stay tuned here for news, features, and system updates.",
    timestamp: new Date().toISOString(),
  }
]);

export default {
  activeUsers,
  allUsers,
  conversations,
};
