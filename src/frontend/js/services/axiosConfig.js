import AuthService from "./AuthService.js";
import UserService from "./UserService.js";

const api = axios.create({
  baseURL: "http://localhost:8386/api",
  withCredentials: true
});

// --- Axios Interceptors for Automatic Token Refresh ---

// Request Interceptor: Add the Authorization header to every request (if logged in)
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      // Log token đang được sử dụng (chỉ log một phần để an toàn)
      console.info(
        `[Interceptor Req] Attaching token to request: ${config.method.toUpperCase()} ${
          config.url
        }`,
        token.substring(0, 15) + "..."
      );
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.info(
        `[Interceptor Req] No token found for request: ${config.method.toUpperCase()} ${
          config.url
        }`
      );
    }
    return config;
  },
  (error) => {
    console.error("[Interceptor Req] Error before sending request:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and refresh
api.interceptors.response.use(
  (response) => {
    // Log khi nhận response thành công (có thể quá nhiều log, cân nhắc)
    // console.info(`[Interceptor Res] Received successful response for: ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.warn(
      `[Interceptor Res] Request failed: ${originalRequest.method.toUpperCase()} ${
        originalRequest.url
      }`,
      error.response?.status,
      error.message
    ); // Log lỗi ban đầu

    // Nếu lỗi đến từ endpoint đăng nhập hoặc làm mới token, không thử refresh lại.
    if (
      originalRequest.url.endsWith("/user/authenticate") ||
      originalRequest.url.endsWith("/user/refreshToken")
    ) {
      console.warn(
        "[Interceptor Res] Error from auth/refresh endpoint. Not attempting refresh."
      );
      return Promise.reject(error); // Chỉ cần reject lỗi gốc
    }

    // Nếu lỗi là 403 (Forbidden) hoặc 401 (Unauthorized) *VÀ* không phải từ authenticate/refresh *VÀ* chưa thử lại
    if (
      error.response && // Đảm bảo error.response tồn tại
      (error.response.status === 403 || error.response.status === 401) &&
      !originalRequest._retry
    ) {
      console.warn(
        `[Interceptor Res] Received ${error.response.status} on ${originalRequest.url}. Potential expired/invalid token. Marking for retry.`
      );
      originalRequest._retry = true; // Mark the request to prevent infinite loops

      try {
        console.info("[Interceptor Res] Calling UserService.refreshToken()..."); // Log trước khi gọi refresh
        await UserService.refreshToken(); // Gọi hàm refresh đã có log bên trong
        console.info(
          "[Interceptor Res] Token refresh seems successful. Retrying original request:",
          originalRequest.url
        );
        // Request interceptor sẽ tự động thêm token mới vào header khi retry
        return api(originalRequest);
      } catch (refreshError) {
        // Lỗi này là từ UserService.refreshToken() hoặc lỗi mạng khi gọi refresh
        console.error(
          "[Interceptor Res] CRITICAL: Failed to refresh token during retry attempt.",
          refreshError
        );

        // Nếu refresh lỗi, user sẽ bị đăng xuất.
        try {
          console.warn(
            "[Interceptor Res] Attempting logout after refresh failure..."
          );
          await UserService.logoutUser(); // Gọi hàm logout đã có log bên trong
        } catch (logoutError) {
          console.error(
            "[Interceptor Res] Error during logout after refresh failure:",
            logoutError
          );
          // Ngay cả khi logout lỗi, vẫn xóa token ở client (đã làm trong UserService.logoutUser)
        }
        // trở lại trang đăng nhập
        console.warn(
          "[Interceptor Res] Redirecting to /login due to refresh failure."
        );
        // window.location.href = "/login"; // Chỉ bật khi cần thiết trong dev, hoặc xử lý ở tầng UI
        alert(
          "Phiên đăng nhập đã hết hạn hoặc có lỗi. Vui lòng đăng nhập lại."
        ); // Thông báo cho người dùng
        return Promise.reject(refreshError); // Reject lỗi refresh cuối cùng
      }
    }

    // Đối với các lỗi khác (không phải 401/403 hoặc đã retry), chỉ cần reject
    console.warn(
      `[Interceptor Res] Unhandled error or already retried: ${originalRequest.url}`,
      error.response?.status
    );
    return Promise.reject(error);
  }
);

export default api;
