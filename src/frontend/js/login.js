import UserService from "../js/services/UserService.js";

document.addEventListener("DOMContentLoaded", function () {
  // --- element selectors ---

  // login form elements
  // const loginForm = document.getElementById("login-form"); // container div (optional)
  // the actual <form> element for login
  const loginFormElement = document.getElementById("login-form-element");
  // username input field for login
  const loginUsernameInput = document.getElementById("login-username");
  // password input field for login
  const loginPasswordInput = document.getElementById("login-password");
  // error message display area for login username
  const loginUsernameError = document.getElementById("login-username-error");
  // error message display area for login password
  const loginPasswordError = document.getElementById("login-password-error");
  // general error message display area for login eg api errors
  const loginError = document.getElementById("login-error");
  // icon to toggle password visibility for login
  const loginPasswordToggleIcon = document.getElementById(
    "login-password-toggle"
  );

  // registration form elements (selectors kept for potential future use)
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

  // show/hide links (selectors kept for potential future use)
  /*
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  */

  // --- core functions ---

  // function: show/hide login/register forms (kept for potential future use)
  /*
  function showForm(formToShow, formToHide) {
    if (formToShow) formToShow.style.display = "block";
    if (formToHide) formToHide.style.display = "none";
  }
  */

  // toggles the visibility of a password input field and updates its toggle icon
  function togglePasswordVisibility(passwordInput, toggleIcon) {
    // ensure both elements exist
    if (!passwordInput || !toggleIcon) return;

    // check the current type of the input field
    if (passwordInput.type === "password") {
      // if password show as text and update icon to 'hide' state
      passwordInput.type = "text";
      toggleIcon.src = "../assets/logo_hint_password.png"; // update path if needed
      toggleIcon.alt = "hide password";
    } else {
      // if text show as password and update icon to 'show' state
      passwordInput.type = "password";
      toggleIcon.src = "../assets/logo_no_hint_password.png"; // update path if needed
      toggleIcon.alt = "show password";
    }
  }

  // validates the login form inputs (username and password)
  // displays error messages next to the fields if invalid
  function validateLoginForm() {
    let isValid = true;
    // clear only the specific validation error messages for login
    clearErrorMessages("login-validation");

    // validate username: must not be empty
    if (!loginUsernameInput?.value.trim()) {
      displayErrorMessage(loginUsernameError, "vui lòng nhập tài khoản.");
      isValid = false;
    }

    // validate password: must not be empty and meet length requirement
    if (!loginPasswordInput?.value) {
      displayErrorMessage(loginPasswordError, "vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (loginPasswordInput.value.length < 8) {
      // example length validation can be adjusted
      displayErrorMessage(
        loginPasswordError,
        "mật khẩu phải có ít nhất 8 ký tự."
      );
      isValid = false;
    }

    return isValid; // return true if all checks pass false otherwise
  }

  // function: validate registration form inputs (kept structure for potential future use)
  /*
  function validateRegisterForm() {
    let isValid = true;
    clearErrorMessages("register-validation");

    // Validate Username
    if (!registerUsernameInput?.value.trim()) {
      displayErrorMessage(registerUsernameError, "vui lòng nhập tài khoản.");
      isValid = false;
    }

    // Validate Phone
    if (!registerPhoneInput?.value.trim()) {
      displayErrorMessage(registerPhoneError, "vui lòng nhập số điện thoại.");
      isValid = false;
    } else if (!/^\d{10}$/.test(registerPhoneInput.value.trim())) { // Example: 10 digits only
      displayErrorMessage(registerPhoneError, "số điện thoại phải gồm 10 chữ số.");
      isValid = false;
    }

    // Validate Password
    if (!registerPasswordInput?.value) {
      displayErrorMessage(registerPasswordError, "vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (registerPasswordInput.value.length < 8) {
      displayErrorMessage(registerPasswordError, "mật khẩu phải có ít nhất 8 ký tự.");
      isValid = false;
    }

    // Validate Confirm Password
    if (!registerConfirmPasswordInput?.value) {
      displayErrorMessage(registerConfirmPasswordError, "vui lòng nhập lại mật khẩu.");
      isValid = false;
    } else if (registerConfirmPasswordInput.value !== registerPasswordInput?.value) {
      displayErrorMessage(registerConfirmPasswordError, "mật khẩu nhập lại không khớp.");
      isValid = false;
    }

    return isValid;
  }
  */

  // displays an error message in a specified error element
  function displayErrorMessage(errorElement, message) {
    if (errorElement) {
      // check if the element exists before setting textcontent
      errorElement.textContent = message;
    }
  }

  // clears error messages based on the type specified
  // type can be 'login' 'login-validation' 'register' 'register-validation' or 'all'
  function clearErrorMessages(type) {
    let errorElements = [];

    // collect login-specific validation error elements
    if (type === "login" || type === "login-validation" || type === "all") {
      errorElements.push(loginUsernameError, loginPasswordError);
    }
    // collect general login error element (usually for api errors)
    if (type === "login" || type === "all") {
      errorElements.push(loginError);
    }

    // registration errors (selectors included even if functionality is commented out)
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
       errorElements.push(registerGeneralError); // general register error element
    }
    */

    // clear the text content of all collected error elements
    errorElements.forEach((element) => {
      if (element) {
        // check if element is not null/undefined
        element.textContent = "";
      }
    });
  }

  // attempts to authenticate the user via an api call using provided credentials
  // handles api responses including success (redirection) and various errors
  async function authenticateUser(username, password) {
    // clear previous login-related errors (both validation and api)
    clearErrorMessages("login");

    try {
      // call the user service to authenticate
      const user = await UserService.authenticateUser(username, password);

      // check user role and redirect accordingly upon successful login
      if (user.role === "landlord") {
        window.location.href = "/admin/dashboard"; // redirect landlord
      } else if (user.role === "tenant") {
        window.location.href = "/client/dashboard"; // redirect tenant
      } else {
        // handle unexpected role
        displayErrorMessage(loginError, "vai trò người dùng không xác định.");
      }
    } catch (error) {
      // handle errors from the api call
      console.error("authentication error:", error); // log the full error

      // check if the error has a response object (typical for api errors)
      if (error.response) {
        // handle specific http status codes
        switch (error.response.status) {
          case 404: // not found
            displayErrorMessage(loginUsernameError, "tài khoản không tồn tại.");
            break;
          case 401: // unauthorized
            displayErrorMessage(
              loginPasswordError,
              "mật khẩu không chính xác."
            );
            break;
          case 409: // conflict (could be used for various issues like account locked etc)
            displayErrorMessage(
              loginError, // display in the general error area
              error.response.data?.message || "thông tin bị trùng lặp." // use message from api if available
            );
            break;
          default: // other server errors
            displayErrorMessage(
              loginError,
              `lỗi máy chủ (${error.response.status}). vui lòng thử lại sau.`
            );
        }
      } else if (error.request) {
        // handle network errors (request made but no response received)
        displayErrorMessage(
          loginError,
          "không thể kết nối đến máy chủ. vui lòng kiểm tra mạng."
        );
      } else {
        // handle other unexpected errors (eg javascript errors during the request setup)
        displayErrorMessage(
          loginError,
          "đã xảy ra lỗi không mong muốn. vui lòng thử lại."
        );
      }
    }
  }

  // function: register user via api (kept structure for potential future use)
  /*
  async function registerUser(data) {
    clearErrorMessages("register"); // Clear previous registration errors

    try {
      const newUser = await UserService.addNewUser(data);
      console.log("registration successful:", newUser);
      alert("đăng ký thành công! vui lòng đăng nhập.");
      // Optionally switch to login form or redirect
      // showForm(loginForm, registerForm);
      window.location.href = "/login"; // Redirect to login page

    } catch (error) {
      console.error("registration failed:", error);

      if (error.response) {
        if (error.response.status === 409) { // Conflict (e.g., username/phone exists)
          const message = error.response.data?.message || "thông tin bị trùng lặp.";
          if (message.toLowerCase().includes("username")) {
            displayErrorMessage(registerUsernameError, "tài khoản này đã tồn tại.");
          } else if (message.toLowerCase().includes("phone")) {
            displayErrorMessage(registerPhoneError, "số điện thoại này đã tồn tại.");
          } else {
            displayErrorMessage(registerGeneralError, message); // Display in general area
          }
        } else { // Other server errors
          displayErrorMessage(registerGeneralError, `lỗi máy chủ (${error.response.status}).`);
        }
      } else if (error.request) { // Network error
        displayErrorMessage(registerGeneralError, "lỗi mạng khi đăng ký.");
      } else { // Other unexpected errors
        displayErrorMessage(registerGeneralError, "lỗi không mong muốn khi đăng ký.");
      }
    }
  }
  */

  // --- event listeners setup ---

  // login form submission
  // attach listener to the submit event of the login form
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", async function (event) {
      event.preventDefault(); // prevent default form submission which causes page reload
      // first validate the form inputs
      if (validateLoginForm()) {
        // if valid get username and password
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;
        // attempt to authenticate the user with the api
        await authenticateUser(username, password);
      }
    });
  } else {
    console.warn("login form element (#login-form-element) not found.");
  }

  // registration form submission (kept listener structure for potential future use)
  /*
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (validateRegisterForm()) {
        const username = registerUsernameInput.value.trim();
        const phone = registerPhoneInput.value.trim();
        const password = registerPasswordInput.value;
        const role = 'tenant'; // default role for self-registration

        const registrationData = { username, phone, password, role };
        await registerUser(registrationData); // Call the API registration function
      }
    });
  } else {
    console.warn("register form element (#register-form-element) not found.");
  }
  */

  // login password toggle icon click
  // add listener to the eye icon for toggling password visibility
  if (loginPasswordToggleIcon && loginPasswordInput) {
    loginPasswordToggleIcon.addEventListener("click", function () {
      togglePasswordVisibility(loginPasswordInput, loginPasswordToggleIcon);
    });
  }

  // registration password toggles (kept listener structure for potential future use)
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

  // show/hide form links (kept listener structure for potential future use)
  /*
  if (showRegisterLink && loginForm && registerForm) {
    showRegisterLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(registerForm, loginForm);
      clearErrorMessages("all"); // Clear all errors when switching forms
    });
  }
  if (showLoginLink && loginForm && registerForm) {
    showLoginLink.addEventListener("click", function (event) {
      event.preventDefault();
      showForm(loginForm, registerForm);
      clearErrorMessages("all"); // Clear all errors when switching forms
    });
  }
  */

  // --- initial setup ---
  // code to run on page load
  // if using show/hide forms set the initial visible form:
  // if (loginForm && registerForm) {
  //   showForm(loginForm, registerForm); // show login form by default
  // }
});
