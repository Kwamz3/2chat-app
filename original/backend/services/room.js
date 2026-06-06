export const getRoomId = (userA, userB) => {
  return [userA, userB].sort().join("_");
};

export default getRoomId;
