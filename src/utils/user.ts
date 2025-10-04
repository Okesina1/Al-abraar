export const normalizeUser = (u: any): any => {
  if (!u) return u;
  const id = u.id || u._id || u.userId || (u._id && typeof u._id === 'object' ? u._id.toString() : undefined);
  return { ...u, id };
};

export default normalizeUser;
