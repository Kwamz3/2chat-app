export const getRoomId = (userA, userB) => {
  return [userA, userB]
    .map((username) => username.toLowerCase())
    .sort()
    .join("_");
};

export default getRoomId;
