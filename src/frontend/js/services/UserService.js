import AuthService from "../services/AuthService.js"; // Correct relative import

const api = axios.create({
  baseURL: "http://localhost:8386/api",
  withCredentials: true // IMPORTANT: Send cookies with requests
});

class UserService {
  static async getAllUsers(filter) {
    try {
      const queryParams = new URLSearchParams();
      for (const key in filter) {
        if (
          filter.hasOwnProperty(key) &&
          filter[key] !== undefined &&
          filter[key] !== null
        ) {
          queryParams.append(key, filter[key]);
        }
      }
      const queryString = queryParams.toString();
      const response = await api.get(`/users?${queryString}`, {
        headers: AuthService.authHeader() // Use imported function
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUserByUsername(username) {
    try {
      const response = await api.get(`/user/${username}`, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewUser(data) {
    try {
      const response = await api.post("/user", data); // No auth needed for registration
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  static async updateUserPhone(username, phone) {
    try {
      const response = await api.patch(
        `/user/${username}/phone`,
        { phone },
        { headers: AuthService.authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserPassword(username, password) {
    try {
      const response = await api.patch(
        `/user/${username}/password`,
        { password },
        { headers: AuthService.authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(username) {
    try {
      const response = await api.delete(`/user/${username}`, {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async authenticateUser(username, password) {
    try {
      const response = await api.post("/user/authenticate", {
        username,
        password
      });
      // Store tokens on successful login.  VERY IMPORTANT.
      localStorage.setItem("accessToken", response.data.accessToken);
      //localStorage.setItem('refreshToken', response.data.refreshToken); // You *could* store refresh token in localStorage, but it's generally BETTER to use HTTP-only cookies (as you are doing).
      return response.data.user; // Return the user data, not the tokens.
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken() {
    try {
      const response = await api.post("/user/refreshToken"); // No authHeader needed, uses cookies
      // Update access token in localStorage
      localStorage.setItem("accessToken", response.data.newAccessToken);

      return response.data.newAccessToken;
    } catch (error) {
      // If refresh token fails, log the user out (clear tokens)
      localStorage.removeItem("accessToken");
      //localStorage.removeItem('refreshToken'); // No need to remove the cookie
      throw error; // Re-throw so the calling component knows refresh failed
    }
  }

  static async logoutUser() {
    try {
      const response = await api.post("/user/logout"); // Uses cookies.  No explicit auth header.
      // Clear tokens on successful logout
      localStorage.removeItem("accessToken");
      //localStorage.removeItem('refreshToken'); // No need to remove the cookie.
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getMe() {
    // A helper method to get the currently logged-in user's info
    try {
      // We use the stored access token.  If it's expired, you'll need to
      // call refreshToken() *before* calling getMe().  This is handled in the
      // axios interceptor below.
      const response = await api.get("/user/current/me", {
        headers: AuthService.authHeader()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// --- Axios Interceptors for Automatic Token Refresh ---

// Request Interceptor: Add the Authorization header to every request (if logged in)
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi đến từ endpoint đăng nhập hoặc làm mới token, không thử refresh lại.
    if (
      originalRequest.url.endsWith("/user/authenticate") ||
      originalRequest.url.endsWith("/user/refreshToken")
    ) {
      return Promise.reject(error); // Chỉ cần reject lỗi gốc
    }

    // Nếu lỗi là 403 (Forbidden) hoặc 401 (Unauthorized) *VÀ* không phải từ authenticate/refresh *VÀ* chưa thử lại
    if (
      (error.response.status === 403 || error.response.status === 401) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark the request to prevent infinite loops
      try {
        console.log("Attempting to refresh token...");
        await UserService.refreshToken();
        console.log(
          "Token refreshed successfully. Retrying original request..."
        );
        // Request interceptor sẽ tự động thêm token mới vào header
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // nếu refresh lỗi, user sẽ bị đăng xuất.
        try {
          await UserService.logoutUser();
        } catch (logoutError) {
          console.error(
            "Error during logout after refresh failure:",
            logoutError
          );
          // Ngay cả khi logout lỗi, vẫn xóa token ở client
          localStorage.removeItem("accessToken");
        }
        // trở lại trang đăng nhập
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Đối với các lỗi khác (không phải 401/403 hoặc đã retry), chỉ cần reject
    return Promise.reject(error);
  }
);

export default UserService;
