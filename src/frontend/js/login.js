import UserService from "../js/services/UserService.js";

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", function () {
  // --- Element Selectors ---
  
  // Login Form Elements
  // const loginForm = document.getElementById("login-form"); // The container div
  const loginFormElement = document.getElementById("login-form-element"); // The <form> element
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  // const loginUsernameError = document.getElementById("login-username-error");
  // const loginPasswordError = document.getElementById("login-password-error");
  // const loginError = document.getElementById("login-error"); // General login error
  const loginPasswordToggleIcon = document.getElementById(
    "login-password-toggle"
  );

  // Registration Form Elements (Keep selectors even if commented out)
  /*
  const registerForm = document.getElementById("register-form"); // The container div
  const registerFormElement = document.getElementById("register-form-element"); // The <form> element
  const registerUsernameInput = document.getElementById("register-username");
  const registerPhoneInput = document.getElementById("register-phone");
  const registerPasswordInput = document.getElementById("register-password");
  const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
  const registerUsernameError = document.getElementById("register-username-error");
  const registerPhoneError = document.getElementById("register-phone-error");
  const registerPasswordError = document.getElementById("register-password-error");
  const registerConfirmPasswordError = document.getElementById("register-confirm-password-error");
  const registerPasswordToggleIcon = document.getElementById("register-password-toggle");
  const registerConfirmPasswordToggleIcon = document.getElementById("register-confirm-password-toggle");
  */

  // Show/Hide Links
  // const showRegisterLink = document.getElementById("show-register-link");
  // const showLoginLink = document.getElementById("show-login-link");

  // --- Function: Show/Hide Login/Register Forms (Keep if using the links) ---
  /*
  function showForm(formToShow, formToHide) {
    if (formToShow) formToShow.style.display = "block";
    if (formToHide) formToHide.style.display = "none";
  }
  */

  // --- Event Listener: Toggle Password Visibility ---
  if (loginPasswordToggleIcon && loginPasswordInput) {
    loginPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(loginPasswordInput, loginPasswordToggleIcon);
    });
  } else {
    console.warn("Login password toggle elements not found.");
  }

  // Registration Password Toggles (Keep listeners even if commented out)
  /*
  if (registerPasswordToggleIcon && registerPasswordInput) {
    registerPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(registerPasswordInput, registerPasswordToggleIcon);
    });
  } else {
    console.warn("Register password toggle elements not found.");
  }

  if (registerConfirmPasswordToggleIcon && registerConfirmPasswordInput) {
    registerConfirmPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(registerConfirmPasswordInput, registerConfirmPasswordToggleIcon);
    });
  } else {
    console.warn("Register confirm password toggle elements not found.");
  }
  */

  // --- Event Listener: Show/Hide Form Links (Keep if using) ---
  /*
  if (showRegisterLink && loginForm && registerForm) {
    showRegisterLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(registerForm, loginForm);
      clearAllErrorMessages(); // Clear errors when switching forms
    });
  }

  if (showLoginLink && loginForm && registerForm) {
    showLoginLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(loginForm, registerForm);
      clearAllErrorMessages(); // Clear errors when switching forms
    });
  }
  */

  // --- Event Listener: Login Form Submission ---
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission
      clearErrorMessages("login"); // Clear only login errors before validation

      if (validateLoginForm()) {
        // Validate inputs
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;
        authenticateUser(username, password); // Attempt authentication
      }
    });
  } else {
    console.error("Login form element not found.");
  }

  // --- Event Listener: Registration Form Submission (Keep listener structure) ---
  /*
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission
      clearErrorMessages("register"); // Clear only register errors before validation

      if (validateRegisterForm()) { // Validate registration inputs
        const username = registerUsernameInput.value.trim();
        const phone = registerPhoneInput.value.trim();
        const password = registerPasswordInput.value;
        // Assuming role is 'tenant' by default for registration, adjust if needed
        const role = 'tenant';

        // Prepare data for registration API call
        const registrationData = { username, phone, password, role };
        registerUser(registrationData); // Call function to handle registration
      }
    });
  } else {
    console.warn("Register form element not found.");
  }
  */

  // --- Initial Setup ---
  // showForm(loginForm, registerForm); // Show login form by default initially
  // console.log("Login/Register page script initialized.");
});

// Attempts to authenticate the user with the provided credentials.
// Handles UI updates for success (redirect) or failure (error messages).
async function authenticateUser(username, password) {
  // Get error elements
  const loginUsernameError = document.getElementById("login-username-error");
  const loginPasswordError = document.getElementById("login-password-error");
  const loginError = document.getElementById("login-error");

  // Clear previous specific/general errors before new attempt
  clearErrorMessages("login"); // Clear login related errors

  try {
    // Call the authentication service
    const user = await UserService.authenticateUser(username, password);
    console.log("Login successful!", user); // Log success for debugging

    // Role-based redirection
    if (user.role === "landlord") {
      window.location.href = "/admin/dashboard";
    } else if (user.role === "tenant") {
      window.location.href = "/client/dashboard";
    } else {
      console.warn("Unknown user role:", user.role);
      displayErrorMessage(loginError, "Vai trò người dùng không xác định.");
    }
  } catch (error) {
    console.error("Authentication failed:", error); // Log the full error

    // Handle specific error statuses
    if (error.response) {
      switch (error.response.status) {
        case 404: // User not found
          displayErrorMessage(loginUsernameError, "Tài khoản không tồn tại.");
          break;
        case 401: // Invalid credentials (wrong password)
          displayErrorMessage(loginPasswordError, "Mật khẩu không chính xác.");
          break;
        case 409: // Conflict (e.g., username/phone exists during registration, handle if needed)
          displayErrorMessage(
            loginError,
            error.response.data.message || "Thông tin bị trùng lặp."
          );
          break;
        default: // Other server errors
          displayErrorMessage(
            loginError,
            `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại sau.`
          );
      }
    } else if (error.request) {
      // Network error
      displayErrorMessage(
        loginError,
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng."
      );
    } else {
      // Other errors
      displayErrorMessage(
        loginError,
        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
      );
    }
  }
}

// Handles user registration.
/*
async function registerUser(data) {
  // Get registration error elements
  const registerUsernameError = document.getElementById("register-username-error");
  const registerPhoneError = document.getElementById("register-phone-error");
  // Add a general registration error element if desired, e.g., <p id="register-error"></p>
  // const registerError = document.getElementById("register-error");

  // Clear previous registration errors
  clearErrorMessages("register");

  try {
    const newUser = await UserService.addNewUser(data);
    console.log("Registration successful:", newUser);
    // Optionally: Show success message, automatically log in, or redirect to login
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    // showForm(document.getElementById("login-form"), document.getElementById("register-form")); // Show login form
     window.location.href = "/login"; // Or reload to show login form

  } catch (error) {
    console.error("Registration failed:", error);

    if (error.response) {
      // Handle specific registration errors from backend (e.g., 409 Conflict)
      if (error.response.status === 409) {
        // Check the error message from the backend to be more specific
        const message = error.response.data.message || "Thông tin bị trùng lặp.";
        if (message.includes("username")) {
          displayErrorMessage(registerUsernameError, "Tài khoản này đã tồn tại.");
        } else if (message.includes("phone")) {
          displayErrorMessage(registerPhoneError, "Số điện thoại này đã tồn tại.");
        } else {
          // Display general conflict error if specific field isn't mentioned
           displayErrorMessage(document.getElementById("register-error"), message); // Use general register error P tag
        }
      } else {
        // Handle other server errors during registration
        displayErrorMessage(document.getElementById("register-error"), `Lỗi máy chủ (${error.response.status}).`);
      }
    } else if (error.request) {
      displayErrorMessage(document.getElementById("register-error"), "Lỗi mạng khi đăng ký.");
    } else {
      displayErrorMessage(document.getElementById("register-error"), "Lỗi không mong muốn khi đăng ký.");
    }
  }
}
*/

// --- UI Helper Functions ---

// Toggles the visibility of a password input field and updates its toggle icon.
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

// Validates the login form inputs.
function validateLoginForm() {
  let isValid = true;
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginUsernameError = document.getElementById("login-username-error");
  const loginPasswordError = document.getElementById("login-password-error");

  // Clear previous validation errors before re-validating
  clearErrorMessages("login-validation"); // Use a specific type for validation only

  // Validate Username
  if (!loginUsernameInput?.value.trim()) {
    displayErrorMessage(loginUsernameError, "Vui lòng nhập tài khoản.");
    isValid = false;
  }

  // Validate Password
  if (!loginPasswordInput?.value) {
    displayErrorMessage(loginPasswordError, "Vui lòng nhập mật khẩu.");
    isValid = false;
  } else if (loginPasswordInput.value.length < 8) {
    // Keep client-side length check
    displayErrorMessage(
      loginPasswordError,
      "Mật khẩu phải có ít nhất 8 ký tự."
    );
    isValid = false;
  }

  return isValid;
}

// Validates the registration form inputs. (Keep function structure)
/*
function validateRegisterForm() {
  let isValid = true;
  const registerUsernameInput = document.getElementById("register-username");
  const registerPhoneInput = document.getElementById("register-phone");
  const registerPasswordInput = document.getElementById("register-password");
  const registerConfirmPasswordInput = document.getElementById("register-confirm-password");

  const registerUsernameError = document.getElementById("register-username-error");
  const registerPhoneError = document.getElementById("register-phone-error");
  const registerPasswordError = document.getElementById("register-password-error");
  const registerConfirmPasswordError = document.getElementById("register-confirm-password-error");

  // Clear previous registration validation errors
  clearErrorMessages("register-validation"); // Use specific type

  // Validate Username
  if (!registerUsernameInput?.value.trim()) {
    displayErrorMessage(registerUsernameError, "Vui lòng nhập tài khoản.");
    isValid = false;
  }

  // Validate Phone
  if (!registerPhoneInput?.value.trim()) {
    displayErrorMessage(registerPhoneError, "Vui lòng nhập số điện thoại.");
    isValid = false;
  } else if (!/^\d{10}$/.test(registerPhoneInput.value.trim())) { // Basic 10-digit check
    displayErrorMessage(registerPhoneError, "Số điện thoại phải gồm 10 chữ số.");
    isValid = false;
  }

  // Validate Password
  if (!registerPasswordInput?.value) {
    displayErrorMessage(registerPasswordError, "Vui lòng nhập mật khẩu.");
    isValid = false;
  } else if (registerPasswordInput.value.length < 8) {
    displayErrorMessage(registerPasswordError, "Mật khẩu phải có ít nhất 8 ký tự.");
    isValid = false;
  }

  // Validate Confirm Password
  if (!registerConfirmPasswordInput?.value) {
    displayErrorMessage(registerConfirmPasswordError, "Vui lòng nhập lại mật khẩu.");
    isValid = false;
  } else if (registerConfirmPasswordInput.value !== registerPasswordInput.value) {
    displayErrorMessage(registerConfirmPasswordError, "Mật khẩu nhập lại không khớp.");
    isValid = false;
  }

  return isValid;
}
*/

// Displays an error message in a specified error element.
function displayErrorMessage(errorElement, message) {
  if (errorElement) {
    errorElement.textContent = message;
  }
  // else {
  //   console.warn("Attempted to display error on non-existent element:", message);
  // }
}

// Clears error messages based on the form type or context.
function clearErrorMessages(type) {
  let errorElements = [];

  if (type === "login" || type === "login-validation" || type === "all") {
    errorElements.push(
      document.getElementById("login-username-error"),
      document.getElementById("login-password-error")
    );
  }
  if (type === "login" || type === "all") {
    errorElements.push(document.getElementById("login-error")); // Clear general login error only for 'login' or 'all'
  }

  if (type === "register" || type === "register-validation" || type === "all") {
    errorElements.push(
      document.getElementById("register-username-error"),
      document.getElementById("register-phone-error"),
      document.getElementById("register-password-error"),
      document.getElementById("register-confirm-password-error")
    );
  }
  if (type === "register" || type === "all") {
    // errorElements.push(document.getElementById("register-error")); // Clear general register error if it exists
  }

  errorElements.forEach((element) => {
    if (element) {
      element.textContent = "";
    }
  });
}
