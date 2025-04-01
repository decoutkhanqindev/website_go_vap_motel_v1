import UserService from "../js/services/UserService.js";

document.addEventListener("DOMContentLoaded", function () {
  // --- DOM Element Selectors ---

  // --- Selectors: Login Form Elements ---
  const loginFormElement = document.getElementById("login-form-element"); // The <form> element
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginUsernameError = document.getElementById("login-username-error");
  const loginPasswordError = document.getElementById("login-password-error");
  const loginError = document.getElementById("login-error"); // General/API errors
  const loginPasswordToggleIcon = document.getElementById(
    "login-password-toggle"
  );

  // --- Selectors: Registration Form Elements (Commented out, kept for future) ---
  /*
  const registerForm = document.getElementById("register-form");
  const registerFormElement = document.getElementById("register-form-element");
  const registerUsernameInput = document.getElementById("register-username");
  const registerPhoneInput = document.getElementById("register-phone");
  const registerPasswordInput = document.getElementById("register-password");
  const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
  const registerUsernameError = document.getElementById("register-username-error");
  const registerPhoneError = document.getElementById("register-phone-error");
  const registerPasswordError = document.getElementById("register-password-error");
  const registerConfirmPasswordError = document.getElementById("register-confirm-password-error");
  const registerGeneralError = document.getElementById("register-error");
  const registerPasswordToggleIcon = document.getElementById("register-password-toggle");
  const registerConfirmPasswordToggleIcon = document.getElementById("register-confirm-password-toggle");
  */

  // --- Selectors: Show/Hide Form Links (Commented out, kept for future) ---
  /*
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  */

  // --- Core Functions: UI and Validation ---

  // Function: Show/hide login/register forms (Commented out, kept for future).
  /*
  function showForm(formToShow, formToHide) {
    if (formToShow) formToShow.style.display = "block";
    if (formToHide) formToHide.style.display = "none";
  }
  */

  // Function: Toggles password input visibility and updates the toggle icon.
  function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (!passwordInput || !toggleIcon) return;
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.src = "../assets/logo_hint_password.png";
      toggleIcon.alt = "Hide password";
    } else {
      passwordInput.type = "password";
      toggleIcon.src = "../assets/logo_no_hint_password.png";
      toggleIcon.alt = "Show password";
    }
  }

  // Function: Validates login form fields and displays inline error messages.
  function validateLoginForm() {
    let isValid = true;
    clearErrorMessages("login-validation"); // Clear only validation messages

    if (!loginUsernameInput?.value.trim()) {
      displayErrorMessage(loginUsernameError, "Vui lòng nhập tài khoản.");
      isValid = false;
    }

    if (!loginPasswordInput?.value) {
      displayErrorMessage(loginPasswordError, "Vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (loginPasswordInput.value.length < 8) {
      displayErrorMessage(
        loginPasswordError,
        "Mật khẩu phải có ít nhất 8 ký tự."
      );
      isValid = false;
    }
    return isValid;
  }

  // Function: Validates registration form fields (Commented out, kept structure).
  /*
  function validateRegisterForm() {
    let isValid = true;
    clearErrorMessages("register-validation");

    // Username validation...
    if (!registerUsernameInput?.value.trim()) { // ... }

    // Phone validation...
    if (!registerPhoneInput?.value.trim()) { // ... }
    else if (!/^\d{10}$/.test(registerPhoneInput.value.trim())) { // ... }

    // Password validation...
    if (!registerPasswordInput?.value) { // ... }
    else if (registerPasswordInput.value.length < 8) { // ... }

    // Confirm Password validation...
    if (!registerConfirmPasswordInput?.value) { // ... }
    else if (registerConfirmPasswordInput.value !== registerPasswordInput?.value) { // ... }

    return isValid;
  }
  */

  // Function: Displays a message in a specified error element.
  function displayErrorMessage(errorElement, message) {
    if (errorElement) {
      errorElement.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
    }
  }

  // Function: Clears error messages from specified areas based on type.
  function clearErrorMessages(type) {
    let errorElements = [];
    // Collect relevant error elements based on 'type'
    if (type === "login" || type === "login-validation" || type === "all") {
      errorElements.push(loginUsernameError, loginPasswordError);
    }
    if (type === "login" || type === "all") {
      errorElements.push(loginError);
    }
    // --- Registration error elements (kept structure) ---
    /*
    if (type === "register" || type === "register-validation" || type === "all") {
      errorElements.push(registerUsernameError, registerPhoneError, registerPasswordError, registerConfirmPasswordError);
    }
    if (type === "register" || type === "all") {
       errorElements.push(registerGeneralError);
    }
    */
    // Clear text content
    errorElements.forEach((element) => {
      if (element) {
        element.textContent = "";
      }
    });
  }

  // --- Core Functions: API Interaction ---

  // Function: Authenticates user via API, handles responses and errors, and redirects on success.
  async function authenticateUser(username, password) {
    clearErrorMessages("login"); // Clear previous login errors (validation + API)
    try {
      const user = await UserService.authenticateUser(username, password);
      // Redirect based on role
      if (user.role === "landlord") {
        window.location.href = "/admin/dashboard";
      } else if (user.role === "tenant") {
        window.location.href = "/client/dashboard"; 
      } else {
        displayErrorMessage(loginError, "Vai trò người dùng không xác định.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Handle specific API errors (404, 401, etc.) and network errors
      if (error.response) {
        switch (error.response.status) {
          case 404:
            displayErrorMessage(loginUsernameError, "Tài khoản không tồn tại.");
            break;
          case 401:
            displayErrorMessage(
              loginPasswordError,
              "Mật khẩu không chính xác."
            );
            break;
          case 409: // Conflict
            const message409 =
              (error.response.data?.message || "Thông tin bị trùng lặp.")
                .charAt(0)
                .toUpperCase() +
              (error.response.data?.message || "Thông tin bị trùng lặp.").slice(
                1
              );
            displayErrorMessage(loginError, message409);
            break;
          default:
            displayErrorMessage(
              loginError,
              `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại sau.`
            );
        }
      } else if (error.request) {
        displayErrorMessage(
          loginError,
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng."
        );
      } else {
        displayErrorMessage(
          loginError,
          "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
        );
      }
    }
  }

  // Function: Registers a new user via API (Commented out, kept structure).
  /*
  async function registerUser(data) {
    clearErrorMessages("register");
    try {
      const newUser = await UserService.addNewUser(data);
      console.log("Registration successful:", newUser);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.href = "/login"; // Redirect after successful registration

    } catch (error) {
      console.error("Registration failed:", error);
      // Handle specific API errors (409 Conflict, etc.) and network errors
      if (error.response) {
        if (error.response.status === 409) {
          const message = (error.response.data?.message || "Thông tin bị trùng lặp.").charAt(0).toUpperCase() + (error.response.data?.message || "Thông tin bị trùng lặp.").slice(1);
          if (message.toLowerCase().includes("username") || message.toLowerCase().includes("tài khoản")) {
            displayErrorMessage(registerUsernameError, "Tài khoản này đã tồn tại.");
          } else if (message.toLowerCase().includes("phone") || message.toLowerCase().includes("số điện thoại")) {
            displayErrorMessage(registerPhoneError, "Số điện thoại này đã tồn tại.");
          } else {
            displayErrorMessage(registerGeneralError, message);
          }
        } else {
          displayErrorMessage(registerGeneralError, `Lỗi máy chủ (${error.response.status}).`);
        }
      } else if (error.request) {
        displayErrorMessage(registerGeneralError, "Lỗi mạng khi đăng ký.");
      } else {
        displayErrorMessage(registerGeneralError, "Lỗi không mong muốn khi đăng ký.");
      }
    }
  }
  */

  // --- Event Listener Setup ---

  // Event Listener: Login Form Submission
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (validateLoginForm()) {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;
        await authenticateUser(username, password); // Call authentication logic
      }
    });
  } else {
    console.warn("Login form element (#login-form-element) not found.");
  }

  // Event Listener: Registration Form Submission (Commented out, kept structure)
  /*
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (validateRegisterForm()) {
        const username = registerUsernameInput.value.trim();
        const phone = registerPhoneInput.value.trim();
        const password = registerPasswordInput.value;
        const role = 'tenant'; // Default role
        await registerUser({ username, phone, password, role }); // Call registration logic
      }
    });
  } else {
    console.warn("Register form element (#register-form-element) not found.");
  }
  */

  // Event Listener: Password Visibility Toggles
  if (loginPasswordToggleIcon && loginPasswordInput) {
    loginPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(loginPasswordInput, loginPasswordToggleIcon);
    });
  }
  // --- Registration password toggles (kept structure) ---
  /*
  if (registerPasswordToggleIcon && registerPasswordInput) { // ... listener ... }
  if (registerConfirmPasswordToggleIcon && registerConfirmPasswordInput) { // ... listener ... }
  */

  // Event Listeners: Show/Hide Form Links (Commented out, kept structure)
  /*
  if (showRegisterLink && loginForm && registerForm) { // ... listener ... }
  if (showLoginLink && loginForm && registerForm) { // ... listener ... }
  */

  // --- Initial Setup ---
  // (No specific initial setup needed for the current login-only functionality,
  // besides the DOMContentLoaded listener itself)
  // If using show/hide forms, this is where you'd set the default visible form.
});
