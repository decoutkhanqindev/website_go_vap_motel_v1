import api from "./axiosConfig.js";

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
      // Không cần headers thủ công
      const response = await api.get(`/users?${queryString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUserByUsername(username) {
    try {
      // Không cần headers thủ công
      const response = await api.get(`/user/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async addNewUser(data) {
    try {
      // Route này không cần auth, interceptor sẽ không thêm header nếu chưa đăng nhập
      const response = await api.post("/user", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserPhone(username, phone) {
    try {
      // Không cần headers thủ công
      const response = await api.patch(`/user/${username}/phone`, { phone });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserPassword(username, password) {
    try {
      // Không cần headers thủ công
      const response = await api.patch(`/user/${username}/password`, {
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(username) {
    try {
      // Không cần headers thủ công
      const response = await api.delete(`/user/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async authenticateUser(username, password) {
    console.info("[Auth] Attempting to authenticate user:", username); // Log bắt đầu xác thực
    try {
      const response = await api.post("/user/authenticate", {
        username,
        password
      });
      console.info("[Auth] Authentication successful for user:", username); // Log xác thực thành công
      console.log(
        "[Auth] Received Access Token:",
        response.data.accessToken
          ? response.data.accessToken.substring(0, 15) + "..."
          : "N/A"
      ); // Log một phần token (an toàn hơn)
      // Vẫn cần lưu accessToken vào localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      console.info("[Auth] Access token saved to localStorage."); // Log đã lưu token
      return response.data.user;
    } catch (error) {
      console.error(
        "[Auth] Authentication failed:",
        error.response?.data || error.message
      ); // Log lỗi xác thực
      throw error;
    }
  }

  static async refreshToken() {
    console.info("[Refresh] Attempting to refresh token via API..."); // Log bắt đầu gọi API refresh
    try {
      // Route này dùng cookie, không cần auth header
      const response = await api.post("/user/refreshToken");
      console.info("[Refresh] Token refresh API call successful."); // Log gọi API thành công
      console.log(
        "[Refresh] Received New Access Token:",
        response.data.newAccessToken
          ? response.data.newAccessToken.substring(0, 15) + "..."
          : "N/A"
      ); // Log một phần token mới
      // Vẫn cần cập nhật accessToken trong localStorage
      localStorage.setItem("accessToken", response.data.newAccessToken);
      console.info("[Refresh] New access token saved to localStorage."); // Log đã lưu token mới
      return response.data.newAccessToken;
    } catch (error) {
      console.error(
        "[Refresh] Failed to refresh token via API:",
        error.response?.data || error.message
      ); // Log lỗi gọi API refresh
      // Logic xử lý lỗi refresh vẫn giữ nguyên (xóa token)
      localStorage.removeItem("accessToken");
      console.warn(
        "[Refresh] Access token removed from localStorage due to refresh failure."
      ); // Log đã xóa token cũ
      throw error; // Quan trọng: Ném lại lỗi để interceptor xử lý tiếp
    }
  }

  static async logoutUser() {
    console.info("[Logout] Attempting to logout user via API...");
    try {
      // Route này dùng cookie, không cần auth header
      const response = await api.post("/user/logout");
      console.info("[Logout] Logout API call successful.");
      // Vẫn cần xóa accessToken khỏi localStorage
      localStorage.removeItem("accessToken");
      console.info("[Logout] Access token removed from localStorage.");
      return response.data;
    } catch (error) {
      console.error(
        "[Logout] Logout API call failed:",
        error.response?.data || error.message
      );
      // Vẫn nên xóa token ở client nếu API lỗi
      localStorage.removeItem("accessToken");
      console.warn(
        "[Logout] Access token removed from localStorage despite API error."
      );
      throw error;
    }
  }

  static async getMe() {
    try {
      // Không cần headers thủ công, interceptor sẽ thêm token
      const response = await api.get("/user/current/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
