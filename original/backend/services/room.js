export const getRoomId = (userA, userB) => {
  const cleanA = (userA || "").toLowerCase();
  const cleanB = (userB || "").toLowerCase();

  if (cleanA === "2chat announcements" || cleanB === "2chat announcements") {
    return "announcements";
  }

  return [cleanA, cleanB].sort().join("_");
};

export default getRoomId;
