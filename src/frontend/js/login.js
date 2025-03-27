import UserService from "../js/services/UserService.js";

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", function () {
  // --- Element Selectors ---

  // Login Form Elements
  // const loginForm = document.getElementById("login-form"); // Container div (optional)
  const loginFormElement = document.getElementById("login-form-element"); // The <form>
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginUsernameError = document.getElementById("login-username-error");
  const loginPasswordError = document.getElementById("login-password-error");
  const loginError = document.getElementById("login-error"); // General login error
  const loginPasswordToggleIcon = document.getElementById(
    "login-password-toggle"
  );

  // Registration Form Elements (Keep selectors even if functionality is commented out)
  /*
  const registerForm = document.getElementById("register-form"); // Container div (optional)
  const registerFormElement = document.getElementById("register-form-element"); // The <form>
  const registerUsernameInput = document.getElementById("register-username");
  const registerPhoneInput = document.getElementById("register-phone");
  const registerPasswordInput = document.getElementById("register-password");
  const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
  const registerUsernameError = document.getElementById("register-username-error");
  const registerPhoneError = document.getElementById("register-phone-error");
  const registerPasswordError = document.getElementById("register-password-error");
  const registerConfirmPasswordError = document.getElementById("register-confirm-password-error");
  const registerGeneralError = document.getElementById("register-error"); // General registration error
  const registerPasswordToggleIcon = document.getElementById("register-password-toggle");
  const registerConfirmPasswordToggleIcon = document.getElementById("register-confirm-password-toggle");
  */

  // Show/Hide Links (Keep selectors if using)
  /*
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  */

  // --- Core Functions ---

  // Function: Show/Hide Login/Register Forms (Keep if using the links)
  /*
  function showForm(formToShow, formToHide) {
    if (formToShow) formToShow.style.display = "block";
    if (formToHide) formToHide.style.display = "none";
  }
  */

  // Function: Toggle Password Visibility
  function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (!passwordInput || !toggleIcon) return;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.src = "../assets/logo_hint_password.png"; // Update path if needed
      toggleIcon.alt = "Hide password";
    } else {
      passwordInput.type = "password";
      toggleIcon.src = "../assets/logo_no_hint_password.png"; // Update path if needed
      toggleIcon.alt = "Show password";
    }
  }

  // Function: Validate Login Form Inputs
  function validateLoginForm() {
    let isValid = true;
    // Use selector variables defined above
    clearErrorMessages("login-validation"); // Clear only validation errors

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
      displayErrorMessage(
        loginPasswordError,
        "Mật khẩu phải có ít nhất 8 ký tự."
      );
      isValid = false;
    }

    return isValid;
  }

  // Function: Validate Registration Form Inputs (Keep structure)
  /*
  function validateRegisterForm() {
    let isValid = true;
    // Use selector variables defined above
    clearErrorMessages("register-validation");

    // Validate Username
    if (!registerUsernameInput?.value.trim()) {
      displayErrorMessage(registerUsernameError, "Vui lòng nhập tài khoản.");
      isValid = false;
    }

    // Validate Phone
    if (!registerPhoneInput?.value.trim()) {
      displayErrorMessage(registerPhoneError, "Vui lòng nhập số điện thoại.");
      isValid = false;
    } else if (!/^\d{10}$/.test(registerPhoneInput.value.trim())) {
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
    } else if (registerConfirmPasswordInput.value !== registerPasswordInput?.value) {
      displayErrorMessage(registerConfirmPasswordError, "Mật khẩu nhập lại không khớp.");
      isValid = false;
    }

    return isValid;
  }
  */

  // Function: Display Error Message
  function displayErrorMessage(errorElement, message) {
    errorElement.textContent = message;
  }

  // Function: Clear Error Messages
  function clearErrorMessages(type) {
    let errorElements = [];

    // Login Errors
    if (type === "login" || type === "login-validation" || type === "all") {
      errorElements.push(loginUsernameError, loginPasswordError);
    }
    if (type === "login" || type === "all") {
      errorElements.push(loginError); // General login error
    }

    // Registration Errors (Include even if commented out)
    /*
    if (type === "register" || type === "register-validation" || type === "all") {
      errorElements.push(
        registerUsernameError,
        registerPhoneError,
        registerPasswordError,
        registerConfirmPasswordError
      );
    }
    if (type === "register" || type === "all") {
       errorElements.push(registerGeneralError); // General register error
    }
    */

    errorElements.forEach((element) => {
      if (element) {
        element.textContent = "";
      }
    });
  }

  // Function: Authenticate User via API
  async function authenticateUser(username, password) {
    // Use selector variables for errors defined above
    clearErrorMessages("login"); // Clear previous login/API errors

    try {
      const user = await UserService.authenticateUser(username, password);
      
      // Role-based redirection
      if (user.role === "landlord") {
        window.location.href = "/admin/dashboard";
      } else if (user.role === "tenant") {
        window.location.href = "/client/dashboard";
      } else {
        displayErrorMessage(loginError, "Vai trò người dùng không xác định.");
      }
    } catch (error) {
      console.error(error);

      // Handle specific error statuses using the error elements selected above
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
          case 409:
            displayErrorMessage(
              loginError,
              error.response.data?.message || "Thông tin bị trùng lặp."
            );
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

  // Function: Register User via API (Keep structure)
  /*
  async function registerUser(data) {
    // Use selector variables for errors defined above
    clearErrorMessages("register");

    try {
      const newUser = await UserService.addNewUser(data);
      console.log("Registration successful:", newUser);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      // showForm(loginForm, registerForm); // Show login form after successful registration
      window.location.href = "/login"; // Or simply reload/redirect

    } catch (error) {
      console.error("Registration failed:", error);

      if (error.response) {
        if (error.response.status === 409) {
          const message = error.response.data?.message || "Thông tin bị trùng lặp.";
          if (message.includes("username")) {
            displayErrorMessage(registerUsernameError, "Tài khoản này đã tồn tại.");
          } else if (message.includes("phone")) {
            displayErrorMessage(registerPhoneError, "Số điện thoại này đã tồn tại.");
          } else {
            displayErrorMessage(registerGeneralError, message); // Use general register error P tag
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

  // --- Event Listeners Setup ---

  // Login Form Submission
  loginFormElement.addEventListener("submit", async function (event) {
    // Marked async
    event.preventDefault();
    // clearErrorMessages("login"); // Clear API errors specifically here if preferred, or rely on authenticateUser
    if (validateLoginForm()) {
      // Validation happens first
      const username = loginUsernameInput.value.trim();
      const password = loginPasswordInput.value;
      await authenticateUser(username, password); // Call API function
    }
  });

  // Registration Form Submission (Keep listener structure)
  /*
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", async function (event) { // Marked async
      event.preventDefault();
      // clearErrorMessages("register");
      if (validateRegisterForm()) {
        const username = registerUsernameInput.value.trim();
        const phone = registerPhoneInput.value.trim();
        const password = registerPasswordInput.value;
        const role = 'tenant'; // Default role

        const registrationData = { username, phone, password, role };
        await registerUser(registrationData); // Call API function
      }
    });
  } else {
    console.warn("Register form element (#register-form-element) not found.");
  }
  */

  // Login Password Toggle
  loginPasswordToggleIcon.addEventListener("click", function () {
    togglePasswordVisibility(loginPasswordInput, loginPasswordToggleIcon);
  });

  // Registration Password Toggles (Keep listener structure)
  /*
  if (registerPasswordToggleIcon && registerPasswordInput) {
    registerPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(registerPasswordInput, registerPasswordToggleIcon);
    });
  }
  if (registerConfirmPasswordToggleIcon && registerConfirmPasswordInput) {
    registerConfirmPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(registerConfirmPasswordInput, registerConfirmPasswordToggleIcon);
    });
  }
  */

  // Show/Hide Form Links (Keep listener structure)
  /*
  if (showRegisterLink && loginForm && registerForm) {
    showRegisterLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(registerForm, loginForm);
      clearErrorMessages("all"); // Clear all errors when switching
    });
  }
  if (showLoginLink && loginForm && registerForm) {
    showLoginLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(loginForm, registerForm);
      clearErrorMessages("all"); // Clear all errors when switching
    });
  }
  */

  // --- Initial Setup ---
  // If using show/hide forms, set the initial state:
  // if (loginForm && registerForm) {
  //   showForm(loginForm, registerForm); // Show login form by default
  // }
});
