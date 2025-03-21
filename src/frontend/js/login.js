document.addEventListener("DOMContentLoaded", async function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const loginPasswordInput = document.getElementById("login-password");
  const loginPasswordToggleIcon = document.getElementById(
    "login-password-toggle"
  );
  const registerPasswordInput = document.getElementById("register-password");
  const registerPasswordToggleIcon = document.getElementById(
    "register-password-toggle"
  );
  const registerConfirmPasswordInput = document.getElementById(
    "register-confirm-password"
  );
  const registerConfirmPasswordToggleIcon = document.getElementById(
    "register-confirm-password-toggle"
  );

  const loginFormElement = document.getElementById("login-form-element");
  const registerFormElement = document.getElementById("register-form-element");

  // handle visible and invisble form login and register
  loginPasswordToggleIcon.addEventListener("click", function () {
    togglePasswordVisibility(loginPasswordInput, loginPasswordToggleIcon);
  });

  registerPasswordToggleIcon.addEventListener("click", function () {
    togglePasswordVisibility(registerPasswordInput, registerPasswordToggleIcon);
  });

  registerConfirmPasswordToggleIcon.addEventListener("click", function () {
    togglePasswordVisibility(
      registerConfirmPasswordInput,
      registerConfirmPasswordToggleIcon
    );
  });

  function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.src = "../assets/logo_hint_password.png";
    } else {
      passwordInput.type = "password";
      toggleIcon.src = "../assets/logo_no_hint_password.png";
    }
  }

  showRegisterLink.addEventListener("click", function (event) {
    event.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  showLoginLink.addEventListener("click", function (event) {
    event.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  });

  // handle validation field in form login and register
  loginFormElement.addEventListener("submit", function (event) {
    event.preventDefault();
    validateLoginForm();
  });

  registerFormElement.addEventListener("submit", function (event) {
    event.preventDefault();
    validateRegisterForm();
  });

  function validateLoginForm() {
    let isValid = true;
    const loginUsernameInput = document.getElementById("login-username");
    const loginPasswordInput = document.getElementById("login-password");
    const loginUsernameError = document.getElementById("login-username-error");
    const loginPasswordError = document.getElementById("login-password-error");

    clearErrorMessages("login");

    if (!loginUsernameInput.value) {
      displayErrorMessage(loginUsernameError, "Vui lòng nhập tài khoản.");
      isValid = false;
    }

    if (!loginPasswordInput.value) {
      displayErrorMessage(loginPasswordError, "Vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (loginPasswordInput.value.length < 8) {
      displayErrorMessage(
        loginPasswordError,
        "Mật khẩu phải có ít nhất 8 ký tự."
      );
      isValid = false;
    }
  }

  function validateRegisterForm() {
    let isValid = true;
    const registerUsernameInput = document.getElementById("register-username");
    const registerPhoneInput = document.getElementById("register-phone");
    const registerPasswordInput = document.getElementById("register-password");
    const registerConfirmPasswordInput = document.getElementById(
      "register-confirm-password"
    );

    const registerUsernameError = document.getElementById(
      "register-username-error"
    );
    const registerPhoneError = document.getElementById("register-phone-error");
    const registerPasswordError = document.getElementById(
      "register-password-error"
    );
    const registerConfirmPasswordError = document.getElementById(
      "register-confirm-password-error"
    );

    clearErrorMessages("register");

    if (!registerUsernameInput.value) {
      displayErrorMessage(registerUsernameError, "Vui lòng nhập tài khoản.");
      isValid = false;
    }

    if (!registerPhoneInput.value) {
      displayErrorMessage(registerPhoneError, "Vui lòng nhập số điện thoại.");
      isValid = false;
    } else if (!/^\d{10}$/.test(registerPhoneInput.value)) {
      displayErrorMessage(registerPhoneError, "Số điện thoại phải gồm 10 số.");
      isValid = false;
    }

    if (!registerPasswordInput.value) {
      displayErrorMessage(registerPasswordError, "Vui lòng nhập mật khẩu.");
      isValid = false;
    } else if (registerPasswordInput.value.length < 8) {
      displayErrorMessage(
        registerPasswordError,
        "Mật khẩu phải có ít nhất 8 ký tự."
      );
      isValid = false;
    }

    if (!registerConfirmPasswordInput.value) {
      displayErrorMessage(
        registerConfirmPasswordError,
        "Vui lòng nhập lại mật khẩu."
      );
      isValid = false;
    } else if (
      registerConfirmPasswordInput.value !== registerPasswordInput.value
    ) {
      displayErrorMessage(
        registerConfirmPasswordError,
        "Mật khẩu nhập lại không khớp."
      );
      isValid = false;
    }
  }

  function displayErrorMessage(errorElement, message) {
    errorElement.textContent = message;
  }

  function clearErrorMessages(formType) {
    let errorElements = [];
    if (formType === "login") {
      errorElements = [
        document.getElementById("login-username-error"),
        document.getElementById("login-password-error")
      ];
    } else if (formType === "register") {
      errorElements = [
        document.getElementById("register-username-error"),
        document.getElementById("register-phone-error"),
        document.getElementById("register-password-error"),
        document.getElementById("register-confirm-password-error")
      ];
    }

    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }
});
