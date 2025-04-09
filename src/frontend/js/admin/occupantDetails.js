import OccupantService from "../services/OccupantService.js";
import RoomService from "../services/RoomService.js";
import UserService from "../services/UserService.js";
import ContractService from "../services/ContractService.js";

// --- Global Scope: State Variables ---
let currentOccupantId = null;
let currentOccupantData = null;
let occupiedRoomsData = [];
let tenantUsersData = [];
let existingCccdImageIds = [];
let newCccdImageFiles = [];
let cccdImagesToDeleteIds = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const editOccupantForm = document.getElementById("editOccupantForm");
  const occupantRoomIdSelect = document.getElementById("occupantRoomId");
  const occupantRoomSelectLoadingDiv = document.getElementById(
    "occupantRoomSelectLoading"
  );
  const occupantContractCodeInput = document.getElementById(
    "occupantContractCode"
  );
  const occupantTenantIdSelect = document.getElementById("occupantTenantId");
  const occupantTenantSelectLoadingDiv = document.getElementById(
    "occupantTenantSelectLoading"
  );
  const occupantFullNameInput = document.getElementById("occupantFullName");
  const occupantBirthdayInput = document.getElementById("occupantBirthday");
  const occupantAddressInput = document.getElementById("occupantAddress");
  const occupantCccdInput = document.getElementById("occupantCccd");
  const occupantCccdImagesInput = document.getElementById(
    "occupantCccdImagesInput"
  );
  const selectOccupantCccdImagesBtn = document.getElementById(
    "selectOccupantCccdImagesBtn"
  );
  const occupantCccdImagePreviewDiv = document.getElementById(
    "occupantCccdImagePreview"
  );
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editOccupantFeedbackDiv = document.getElementById(
    "editOccupantFeedback"
  );
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the occupant ID from the URL path
  function getOccupantIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (reused pattern)
  function showModalFeedback(message, type = "danger") {
    if (editOccupantFeedbackDiv) {
      editOccupantFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editOccupantFeedbackDiv.className = `alert alert-${type} mt-3`; // Use mt-3 for spacing
      editOccupantFeedbackDiv.style.display = "block";
      editOccupantFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides feedback messages (reused pattern)
  function hideModalFeedback() {
    if (editOccupantFeedbackDiv) {
      editOccupantFeedbackDiv.style.display = "none";
      editOccupantFeedbackDiv.textContent = "";
      editOccupantFeedbackDiv.className = "alert";
    }
  }

  // Function: Formats date object or string to YYYY-MM-DD for input[type=date]
  function formatDateForInput(dateStringOrObject) {
    if (!dateStringOrObject) return "";
    try {
      const date = new Date(dateStringOrObject);
      // Check if the date is valid after parsing
      if (isNaN(date.getTime())) {
        console.warn(
          "Invalid date passed to formatDateForInput:",
          dateStringOrObject
        );
        return "";
      }
      const year = date.getFullYear();
      // Month is 0-indexed, so add 1
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Renders the room selection dropdown. Includes occupied rooms and the current occupant's room.
  async function renderRoomSelectionDropdown() {
    if (!occupantRoomIdSelect || !occupantRoomSelectLoadingDiv) return;

    occupantRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    occupantRoomIdSelect.disabled = true;
    occupantRoomSelectLoadingDiv.style.display = "block";

    try {
      // Fetch currently occupied rooms
      const occupiedRooms = await RoomService.getAllRooms({
        status: "occupied"
      });
      occupiedRoomsData = occupiedRooms || [];

      // Ensure the current occupant's room is in the list, even if not 'occupied' anymore
      const currentRoomId = currentOccupantData?.roomId;
      const isCurrentRoomInList = occupiedRoomsData.some(
        (room) => room._id === currentRoomId
      );

      if (currentRoomId && !isCurrentRoomInList) {
        try {
          const currentRoomDetails = await RoomService.getRoomById(
            currentRoomId
          );
          if (currentRoomDetails) {
            occupiedRoomsData.push(currentRoomDetails); // Add it to the list for display
          }
        } catch (roomFetchError) {
          console.warn(roomFetchError);
          // Proceed without it if fetch fails
        }
      }

      // Reset dropdown
      occupantRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';

      if (occupiedRoomsData.length > 0) {
        occupiedRoomsData.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          option.selected = room._id === currentRoomId; // Select the current room
          occupantRoomIdSelect.appendChild(option);
        });
        occupantRoomIdSelect.disabled = false;
      } else {
        // Handle case where no rooms are available (might need a specific option if the current room is missing)
        if (currentRoomId) {
          // If the current room was the *only* one and couldn't be fetched, add a placeholder
          occupantRoomIdSelect.innerHTML = `<option value="${currentRoomId}" selected>Phòng hiện tại (ID: ${currentRoomId.slice(
            -6
          )})</option>`;
          occupantRoomIdSelect.innerHTML += `<option value="" disabled>Không có phòng nào khác đang được thuê</option>`;
          occupantRoomIdSelect.disabled = false; // Allow selection of the current one at least
        } else {
          occupantRoomIdSelect.innerHTML =
            '<option value="" disabled>Không có phòng nào đang được thuê</option>';
        }
      }
    } catch (error) {
      console.error(error);
      occupantRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      occupantRoomSelectLoadingDiv.style.display = "none";
    }
  }

  // Function: Renders the tenant account selection dropdown.
  async function renderTenantSelectionDropdown() {
    if (!occupantTenantIdSelect || !occupantTenantSelectLoadingDiv) return;

    occupantTenantIdSelect.innerHTML =
      '<option value="">Không có tài khoản</option><option value="loading" disabled>Đang tải...</option>';
    occupantTenantIdSelect.disabled = true;
    occupantTenantSelectLoadingDiv.style.display = "block";

    try {
      const users = await UserService.getAllUsers({ role: "tenant" });
      tenantUsersData = users || [];

      // Reset dropdown, keeping the "No account" option
      occupantTenantIdSelect.innerHTML =
        '<option value="">Không có tài khoản</option>';

      if (tenantUsersData.length > 0) {
        tenantUsersData.forEach((user) => {
          const option = document.createElement("option");
          option.value = user._id;
          option.textContent = `${user.username} (${user.phone || "N/A"})`;
          // Select the current tenant if it exists
          option.selected = user._id === currentOccupantData?.tenantId;
          occupantTenantIdSelect.appendChild(option);
        });
      } else {
        occupantTenantIdSelect.innerHTML +=
          '<option value="" disabled>Không tìm thấy tài khoản người thuê nào</option>';
      }
      occupantTenantIdSelect.disabled = false;
    } catch (error) {
      console.error(error);
      tenantUsersData = [];
      occupantTenantIdSelect.innerHTML =
        '<option value="">Không có tài khoản</option><option value="" disabled>Lỗi tải tài khoản</option>';
    } finally {
      occupantTenantSelectLoadingDiv.style.display = "none";
    }
  }

  // Function: Renders CCCD image previews (existing and new). Very similar to roomDetails.
  async function renderCccdImagePreviews() {
    if (!occupantCccdImagePreviewDiv) return;
    occupantCccdImagePreviewDiv.innerHTML = ""; // Clear previous

    let previewGenerated = false;

    // 1. Render existing images by fetching each one individually
    const existingImagePromises = existingCccdImageIds.map(async (imageId) => {
      if (cccdImagesToDeleteIds.includes(imageId)) return null; // Skip if marked for removal

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default fallback

      try {
        // Fetch individual image data using OccupantService
        const imageDataResponse =
          await OccupantService.getOccupantCccdImageById(imageId);

        // Convert ArrayBuffer/Buffer to Base64 Data URL
        if (imageDataResponse?.data?.data && imageDataResponse?.contentType) {
          const buffer = imageDataResponse.data.data;
          const base64Image = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          imageSrc = `data:${imageDataResponse.contentType};base64,${base64Image}`;
          previewGenerated = true;
        } else {
          console.error(
            `Invalid image data structure received for CCCD image ID: ${imageId}`
          );
        }
      } catch (error) {
        console.error(error);
      }

      previewItem.innerHTML = `
                <img src="${imageSrc}" alt="Ảnh CCCD/CMND hiện có">
                <button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imageId}" title="Xóa ảnh này">×</button>
            `;

      // Add listener AFTER element is created
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const idToRemove = event.target.getAttribute("data-image-id");
          if (idToRemove && !cccdImagesToDeleteIds.includes(idToRemove)) {
            cccdImagesToDeleteIds.push(idToRemove);
            renderCccdImagePreviews(); // Re-render
          }
        });
      }
      return previewItem;
    });

    // Wait for all fetches and element creations
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );

    // Append valid fetched items
    existingItems.forEach((previewItem) => {
      occupantCccdImagePreviewDiv.appendChild(previewItem);
    });

    // 2. Render previews for newly selected files (using FileReader)
    newCccdImageFiles.forEach((file, index) => {
      previewGenerated = true;
      const reader = new FileReader();
      reader.onload = function (e) {
        const newPreviewItem = document.createElement("div");
        newPreviewItem.classList.add("image-preview-item");
        newPreviewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Xem trước ảnh CCCD mới ${file.name}">
                    <button type="button" class="remove-image-btn new-remove-btn" data-index="${index}" title="Hủy thêm ảnh này">×</button>
                `;
        newPreviewItem
          .querySelector(".new-remove-btn")
          ?.addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < newCccdImageFiles.length
            ) {
              newCccdImageFiles.splice(indexToRemove, 1);
              renderCccdImagePreviews();
            }
          });
        occupantCccdImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        // Optional: Add error placeholder item
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images after all rendering attempts
    if (
      !previewGenerated &&
      occupantCccdImagePreviewDiv.childElementCount === 0
    ) {
      occupantCccdImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches occupant details and related data, then populates the form.
  async function fetchAndPopulateOccupantDetails() {
    currentOccupantId = getOccupantIdFromUrl();
    if (!currentOccupantId) {
      showModalFeedback(
        "Không tìm thấy ID người thuê hợp lệ trong URL.",
        "danger"
      );
      if (editOccupantForm) editOccupantForm.style.display = "none";
      return;
    }

    // Reset state
    currentOccupantData = null;
    occupiedRoomsData = [];
    tenantUsersData = [];
    existingCccdImageIds = []; // Reset to store flat IDs
    newCccdImageFiles = [];
    cccdImagesToDeleteIds = [];

    hideModalFeedback();
    if (editOccupantForm) editOccupantForm.style.display = "block";
    if (occupantCccdImagePreviewDiv)
      occupantCccdImagePreviewDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải ảnh...</p>';

    try {
      // Fetch occupant details first
      const occupantDetails = await OccupantService.getOccupantById(
        currentOccupantId
      );
      currentOccupantData = occupantDetails;

      if (!currentOccupantData) {
        throw new Error("Không tìm thấy dữ liệu người thuê.");
      }

      existingCccdImageIds =
        currentOccupantData.cccdImages
          ?.map((img) => (typeof img === "string" ? img : img._id)) // Get ID directly
          .filter((id) => id) || []; // Filter out falsy IDs and ensure array

      // Fetch dropdown data and contract code concurrently
      await Promise.all([
        renderRoomSelectionDropdown(),
        renderTenantSelectionDropdown(),
        loadContractCodeForRoom(currentOccupantData.roomId)
      ]);

      // Populate the rest of the form fields
      populateFormFields();
      // Render image previews
      await renderCccdImagePreviews(); // Now uses existingCccdImageIds

      if (editOccupantForm) editOccupantForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu người thuê: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editOccupantForm) editOccupantForm.style.display = "none";
    }
  }

  // Function: Populates the main form fields with currentOccupantData.
  function populateFormFields() {
    if (!currentOccupantData || !editOccupantForm) return;

    // Room and Tenant dropdowns are handled by their render functions
    // Contract code is handled by loadContractCodeForRoom

    if (occupantFullNameInput)
      occupantFullNameInput.value = currentOccupantData.fullName || "";
    if (occupantBirthdayInput)
      occupantBirthdayInput.value = formatDateForInput(
        currentOccupantData.birthday
      );
    if (occupantAddressInput)
      occupantAddressInput.value = currentOccupantData.address || "";
    if (occupantCccdInput)
      occupantCccdInput.value = currentOccupantData.cccd || "";

    // Image previews are handled by renderCccdImagePreviews
  }

  // Function: Fetches and displays the contract code for a given room.
  async function loadContractCodeForRoom(roomId) {
    if (!occupantContractCodeInput) return;
    occupantContractCodeInput.value = ""; // Clear previous
    occupantContractCodeInput.placeholder = "Đang tìm hợp đồng...";

    if (!roomId) {
      occupantContractCodeInput.placeholder = "Vui lòng chọn phòng";
      return;
    }

    try {
      // Fetch the active contract for the specified room
      const contracts = await ContractService.getAllContracts({
        roomId: roomId,
        status: "active" // Assuming we only care about the active one
      });

      if (contracts && contracts.length > 0) {
        occupantContractCodeInput.value = contracts[0].contractCode || "N/A";
      } else {
        occupantContractCodeInput.placeholder = "Không có HĐ hoạt động";
        // Maybe show feedback if the *initial* room has no active contract
        if (roomId === currentOccupantData?.roomId) {
          // Only show feedback on initial load if needed
          showModalFeedback(
            "Phòng hiện tại của người thuê không có hợp đồng đang hoạt động.",
            "warning"
          );
        }
      }
    } catch (error) {
      console.error(error);
      occupantContractCodeInput.placeholder = "Lỗi tìm HĐ";
      // Optionally show feedback
      // showModalFeedback("Lỗi khi tải mã hợp đồng.", "danger");
    }
  }

  // --- Event Handlers ---

  // Function: Handles changes in the Room selection dropdown.
  function handleRoomChange(event) {
    const newRoomId = event.target.value;
    if (newRoomId) {
      // Fetch and display the contract code for the newly selected room
      loadContractCodeForRoom(newRoomId);
    } else {
      // Clear contract code if no room is selected
      if (occupantContractCodeInput) {
        occupantContractCodeInput.value = "";
        occupantContractCodeInput.placeholder = "Vui lòng chọn phòng";
      }
    }
  }

  // Function: Handles the selection of new CCCD image files.
  function handleCccdImageSelection(event) {
    const files = Array.from(event.target.files);
    newCccdImageFiles.push(...files);
    renderCccdImagePreviews(); // Re-render previews
    event.target.value = null; // Allow re-selecting same file
  }

  // Function: Handles the 'Save Changes' button click.
  async function handleSaveChanges() {
    hideModalFeedback();

    // Basic Form Validation
    if (!editOccupantForm || !editOccupantForm.checkValidity()) {
      if (editOccupantForm) editOccupantForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra các trường bắt buộc (Phòng).",
        "warning"
      );
      return;
    }
    if (editOccupantForm) editOccupantForm.classList.add("was-validated");

    if (!currentOccupantId || !currentOccupantData) {
      showModalFeedback("Lỗi: Không xác định được người thuê.", "danger");
      return;
    }

    // Get Current Form Values
    const newRoomId = occupantRoomIdSelect.value;
    const newTenantId = occupantTenantIdSelect.value || null;
    const newFullName = occupantFullNameInput.value.trim() || null;
    const newBirthday = occupantBirthdayInput.value || null;
    const newAddress = occupantAddressInput.value.trim() || null;
    const newCccd = occupantCccdInput.value.trim() || null;

    // Detect Actual Changes
    const infoChanged =
      newRoomId !== currentOccupantData.roomId ||
      newTenantId !== (currentOccupantData.tenantId || null) ||
      newFullName !== (currentOccupantData.fullName || null) ||
      formatDateForInput(newBirthday) !==
        formatDateForInput(currentOccupantData.birthday) ||
      newAddress !== (currentOccupantData.address || null) ||
      newCccd !== (currentOccupantData.cccd || null);

    const imagesToDeleteChanged = cccdImagesToDeleteIds.length > 0;
    const newImagesAdded = newCccdImageFiles.length > 0;

    if (!infoChanged && !imagesToDeleteChanged && !newImagesAdded) {
      showModalFeedback("Không có thay đổi nào để lưu.", "info");
      return;
    }

    // Re-check Contract Code for the selected Room at save time
    let contractCodeForSave = null;
    if (newRoomId) {
      try {
        const contracts = await ContractService.getAllContracts({
          roomId: newRoomId,
          status: "active"
        });
        if (contracts && contracts.length > 0) {
          contractCodeForSave = contracts[0].contractCode;
        } else {
          showModalFeedback(
            `Phòng bạn chọn hiện không có hợp đồng nào đang hoạt động. Không thể lưu.`, // Simplified message
            "danger"
          );
          occupantRoomIdSelect.classList.add("is-invalid");
          return;
        }
      } catch (error) {
        console.error(error);
        showModalFeedback(
          "Lỗi khi kiểm tra hợp đồng cho phòng đã chọn. Không thể lưu.",
          "danger"
        );
        return;
      }
    } else {
      showModalFeedback("Lỗi: Phòng là bắt buộc.", "danger"); // Should be caught by validation
      return;
    }

    // Prepare and Execute API Calls
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";

    const apiCalls = [];
    const errors = [];

    // API Call 1: Update basic info (if changed)
    if (infoChanged) {
      const occupantUpdateData = {
        roomId: newRoomId,
        tenantId: newTenantId,
        contractCode: contractCodeForSave, // Use validated code
        fullName: newFullName,
        birthday: newBirthday,
        address: newAddress,
        cccd: newCccd
      };
      apiCalls.push(
        OccupantService.updateOccupant(
          currentOccupantId,
          occupantUpdateData
        ).catch((err) => {
          errors.push(
            `Lỗi cập nhật thông tin: ${
              err?.response?.data?.message || err.message
            }`
          );
          throw err; // Critical error
        })
      );
    }

    // API Call 2: Delete marked CCCD images
    if (imagesToDeleteChanged) {
      apiCalls.push(
        OccupantService.deleteCccdImagesForOccupant(
          currentOccupantId,
          cccdImagesToDeleteIds // Pass the array of IDs to delete
        ).catch((err) => {
          errors.push(
            `Lỗi xóa ảnh CCCD: ${err?.response?.data?.message || err.message}`
          );
          // Decide if non-critical
        })
      );
    }

    // API Call 3: Add new CCCD images
    if (newImagesAdded) {
      // OccupantService.addCccdImagesToOccupant likely expects FormData
      const imageData = new FormData();
      newCccdImageFiles.forEach((file) => imageData.append("cccdImages", file)); // Use the correct field name expected by the backend

      apiCalls.push(
        OccupantService.addCccdImagesToOccupant(
          currentOccupantId,
          imageData // Send FormData
        ).catch((err) => {
          errors.push(
            `Lỗi thêm ảnh CCCD mới: ${
              err?.response?.data?.message || err.message
            }`
          );
          // Decide if non-critical
        })
      );
    }

    try {
      await Promise.all(apiCalls);

      if (errors.length > 0) {
        showModalFeedback(
          `Cập nhật thành công với một số lỗi: ${errors.join("; ")}`,
          "warning"
        );
        // Clear image state after attempt
        newCccdImageFiles = [];
        cccdImagesToDeleteIds = [];
      } else {
        showModalFeedback(
          "Cập nhật thông tin người thuê thành công!",
          "success"
        );
        // Clear state on full success
        newCccdImageFiles = [];
        cccdImagesToDeleteIds = [];
      }

      // Refresh data after successful save
      setTimeout(() => fetchAndPopulateOccupantDetails(), 1500);
    } catch (error) {
      // Catches critical errors that stopped Promise.all
      console.error(error);
      showModalFeedback(
        errors.length > 0
          ? errors.join("; ")
          : `Lỗi không xác định khi lưu người thuê.`,
        "danger"
      );
    } finally {
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }
  // Function: Handles the 'Cancel' button click.
  function handleCancelChanges() {
    // Navigate back to the dashboard or previous page
    window.history.back();
    // Alternatively: window.location.href = "/admin/dashboard";
  }

  // --- Event Listener Setup ---

  // Attach listener to Room dropdown change
  if (occupantRoomIdSelect) {
    occupantRoomIdSelect.addEventListener("change", handleRoomChange);
  }

  // Attach listener to trigger CCCD image file input
  if (selectOccupantCccdImagesBtn && occupantCccdImagesInput) {
    selectOccupantCccdImagesBtn.addEventListener("click", () =>
      occupantCccdImagesInput.click()
    );
  }

  // Attach listener to handle CCCD image file selection
  if (occupantCccdImagesInput) {
    occupantCccdImagesInput.addEventListener(
      "change",
      handleCccdImageSelection
    );
  }

  // Attach listener to Save Changes button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // Attach listener to Cancel button
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", handleCancelChanges);
  }

  // --- Initial Load ---
  fetchAndPopulateOccupantDetails(); // Fetch and display occupant data when the page loads
});
