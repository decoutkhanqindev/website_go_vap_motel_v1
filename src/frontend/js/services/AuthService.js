// Helper function for consistent Authorization header handling.
const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

const authHeader = () => {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export default { getAccessToken, authHeader };
