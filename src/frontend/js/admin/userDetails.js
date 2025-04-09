import UserService from "../services/UserService.js";

// --- Global Scope: State Variables ---
let currentUsername = null;
let currentUserData = null;

// --- Mappings ---
const roleMap = {
  landlord: "Chủ trọ",
  tenant: "Người thuê"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const editUserForm = document.getElementById("editUserForm");
  const userRoleInput = document.getElementById("userRole");
  const userUsernameInput = document.getElementById("userUsername");
  const userPasswordInput = document.getElementById("userPassword");
  const userPasswordToggle = document.getElementById("userPasswordToggle");
  const userPasswordFeedback = document.getElementById("userPasswordFeedback");
  const userConfirmPasswordInput = document.getElementById(
    "userConfirmPassword"
  );
  const userConfirmPasswordToggle = document.getElementById(
    "userConfirmPasswordToggle"
  );
  const userConfirmPasswordFeedback = document.getElementById(
    "userConfirmPasswordFeedback"
  );
  const userPhoneInput = document.getElementById("userPhone");
  const userCreatedAtInput = document.getElementById("userCreatedAt");
  const userUpdatedAtInput = document.getElementById("userUpdatedAt");
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editUserFeedbackDiv = document.getElementById("editUserFeedback");
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the username from the URL path
  function getUsernameFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (reused pattern)
  function showModalFeedback(message, type = "danger") {
    if (editUserFeedbackDiv) {
      editUserFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editUserFeedbackDiv.className = `alert alert-${type} mt-3`; // Use mt-3 for spacing
      editUserFeedbackDiv.style.display = "block";
      editUserFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides feedback messages (reused pattern)
  function hideModalFeedback() {
    if (editUserFeedbackDiv) {
      editUserFeedbackDiv.style.display = "none";
      editUserFeedbackDiv.textContent = "";
      editUserFeedbackDiv.className = "alert";
    }
  }

  // Function: Formats date/time strings for display (e.g., "dd/MM/yyyy HH:mm:ss")
  function formatDateTimeForDisplay(dateStringOrObject) {
    if (!dateStringOrObject) return "N/A";
    try {
      const date = new Date(dateStringOrObject);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      console.error(e);
      return "Lỗi định dạng";
    }
  }

  // Function: Toggles password visibility
  function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (!passwordInput || !toggleIcon) return;
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    // Update icon source based on visibility state
    toggleIcon.src = isPassword
      ? "/assets/logo_hint_password.png" // Path to 'visible' icon
      : "/assets/logo_no_hint_password.png"; // Path to 'hidden' icon
    toggleIcon.alt = isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"; // Update alt text
  }

  // --- Data Fetching and Population ---

  // Function: Fetches user details and populates the form
  async function fetchAndRenderUiUserDetails() {
    currentUsername = getUsernameFromUrl();
    if (!currentUsername) {
      showModalFeedback(
        "Không tìm thấy tên người dùng hợp lệ trong URL.",
        "danger"
      );
      if (editUserForm) editUserForm.style.display = "none"; // Hide form if no user
      return;
    }

    hideModalFeedback(); // Clear previous feedback
    if (editUserForm) editUserForm.style.display = "block"; // Show form
    if (editUserForm) editUserForm.classList.remove("was-validated"); // Reset validation state
    // Reset password fields visually
    if (userPasswordInput) userPasswordInput.value = "";
    if (userConfirmPasswordInput) userConfirmPasswordInput.value = "";

    try {
      // Fetch user data using the service
      const userDetails = await UserService.getUserByUsername(currentUsername);
      currentUserData = userDetails; // Store fetched data globally

      if (!currentUserData) {
        throw new Error("Không tìm thấy dữ liệu người dùng.");
      }

      // Populate the form fields with fetched data
      populateFormFields();
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu người dùng: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editUserForm) editUserForm.style.display = "none"; // Hide form on error
    }
  }

  // Function: Populates the form fields with currentUserData
  function populateFormFields() {
    if (!currentUserData || !editUserForm) return;

    // Populate read-only fields
    if (userRoleInput)
      userRoleInput.value =
        roleMap[currentUserData.role] || currentUserData.role || "N/A";
    if (userUsernameInput) userUsernameInput.value = currentUserData.username;

    // Populate editable field
    if (userPhoneInput) userPhoneInput.value = currentUserData.phone || "";

    // Populate timestamp fields (formatted)
    if (userCreatedAtInput)
      userCreatedAtInput.value = formatDateTimeForDisplay(
        currentUserData.createdAt
      );
    if (userUpdatedAtInput)
      userUpdatedAtInput.value = formatDateTimeForDisplay(
        currentUserData.updatedAt
      );

    // Clear password fields (don't pre-fill password)
    if (userPasswordInput) userPasswordInput.value = "";
    if (userConfirmPasswordInput) userConfirmPasswordInput.value = "";
  }

  // --- Event Handlers ---

  // Function: Handles the 'Save Changes' button click
  async function handleSaveChanges() {
    hideModalFeedback(); // Clear previous messages
    // Reset individual field validation states before re-validating
    if (userPasswordInput) userPasswordInput.classList.remove("is-invalid");
    if (userConfirmPasswordInput)
      userConfirmPasswordInput.classList.remove("is-invalid");
    if (userPasswordFeedback)
      userPasswordFeedback.textContent =
        "Vui lòng nhập mật khẩu hợp lệ (ít nhất 8 ký tự) hoặc để trống."; // Reset specific feedback
    if (userConfirmPasswordFeedback)
      userConfirmPasswordFeedback.textContent =
        "Vui lòng xác nhận mật khẩu mới. Mật khẩu phải khớp."; // Reset specific feedback

    // --- Step 1: Basic Form Validation (Phone is required) ---
    if (!editUserForm || !editUserForm.checkValidity()) {
      if (editUserForm) editUserForm.classList.add("was-validated");
      showModalFeedback("Vui lòng kiểm tra số điện thoại.", "warning"); // Focus on phone validation
      return; // Stop if required phone is missing/invalid
    }

    // --- Step 2: Password Validation (only if password field is not empty) ---
    const newPassword = userPasswordInput?.value;
    const confirmPassword = userConfirmPasswordInput?.value;
    let passwordChanged = false; // Flag to track if password needs update

    if (newPassword) {
      // Only validate if a new password was entered
      if (newPassword.length < 8) {
        showModalFeedback("Mật khẩu mới phải có ít nhất 8 ký tự.", "warning");
        if (userPasswordInput) userPasswordInput.classList.add("is-invalid");
        if (userPasswordFeedback)
          userPasswordFeedback.textContent =
            "Mật khẩu mới phải có ít nhất 8 ký tự.";
        return; // Stop submission
      }

      if (newPassword !== confirmPassword) {
        showModalFeedback(
          "Mật khẩu mới và xác nhận mật khẩu không khớp.",
          "warning"
        );
        if (userPasswordInput) userPasswordInput.classList.add("is-invalid");
        if (userConfirmPasswordInput)
          userConfirmPasswordInput.classList.add("is-invalid");
        if (userConfirmPasswordFeedback)
          userConfirmPasswordFeedback.textContent =
            "Mật khẩu xác nhận không khớp.";
        return; // Stop submission
      }
      // If validation passes
      passwordChanged = true;
      if (userPasswordInput) userPasswordInput.classList.remove("is-invalid");
      if (userConfirmPasswordInput)
        userConfirmPasswordInput.classList.remove("is-invalid");
    }

    // --- Step 3: Check for Actual Changes ---
    const newPhone = userPhoneInput.value.trim();
    const phoneChanged = newPhone !== (currentUserData?.phone || "");

    if (!phoneChanged && !passwordChanged) {
      showModalFeedback("Không có thay đổi nào để lưu.", "info");
      return; // Nothing to save
    }

    // --- Step 4: Prepare and Execute API Calls ---
    if (editUserForm) editUserForm.classList.add("was-validated"); // Mark validated if proceeding
    if (!currentUsername) {
      showModalFeedback("Lỗi: Không xác định được người dùng.", "danger");
      return;
    }

    // Show loading state
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";

    const apiCalls = [];
    const errors = [];

    // Add phone update call if changed
    if (phoneChanged) {
      apiCalls.push(
        UserService.updateUserPhone(currentUsername, newPhone).catch((err) => {
          errors.push(
            `Lỗi cập nhật SĐT: ${
              err?.response?.data?.message || err.message || "Lỗi không rõ"
            }`
          );
          throw err; // Re-throw to stop Promise.all early if needed
        })
      );
    }

    // Add password update call if changed and validated
    if (passwordChanged) {
      apiCalls.push(
        UserService.updateUserPassword(currentUsername, newPassword).catch(
          (err) => {
            errors.push(
              `Lỗi cập nhật mật khẩu: ${
                err?.response?.data?.message || err.message || "Lỗi không rõ"
              }`
            );
            throw err; // Re-throw
          }
        )
      );
    }

    try {
      await Promise.all(apiCalls); // Execute all necessary updates

      showModalFeedback("Cập nhật thông tin người dùng thành công!", "success");

      // Refresh data after successful save to show updated info (like updatedAt)
      setTimeout(() => fetchAndRenderUiUserDetails(), 1500); // Reload after a delay
    } catch (error) {
      // Error already caught and pushed to errors array by individual calls
      console.error(error);
      showModalFeedback(
        errors.length > 0 ? errors.join("; ") : "Lỗi không xác định khi lưu.",
        "danger"
      );
    } finally {
      // Always reset loading state
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // Function: Handles the 'Cancel' button click
  function handleCancelChanges() {
    // Option 1: Go back to the previous page (likely the dashboard)
    window.history.back();

    // Option 2: Redirect to a specific page (e.g., dashboard)
    // window.location.href = '/admin/dashboard';
  }

  // --- Event Listener Setup ---

  // Attach listener to Save Changes button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // Attach listener to Cancel button
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", handleCancelChanges);
  }

  // Attach listeners for password toggle icons
  if (userPasswordToggle && userPasswordInput) {
    userPasswordToggle.addEventListener("click", () =>
      togglePasswordVisibility(userPasswordInput, userPasswordToggle)
    );
  }
  if (userConfirmPasswordToggle && userConfirmPasswordInput) {
    userConfirmPasswordToggle.addEventListener("click", () =>
      togglePasswordVisibility(
        userConfirmPasswordInput,
        userConfirmPasswordToggle
      )
    );
  }

  // --- Initial Load ---
  fetchAndRenderUiUserDetails(); // Fetch and display user data when the page loads
});
