import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---

// --- State for Utility Editing ---
let currentUtilityId = null;
let currentUtilityData = null;
let existingImagePreviews = [];
let newImageFiles = [];
let imagesToDeleteIds = [];

// --- Name Mapping (Define both directions for Utilities) ---

// English Key -> Vietnamese Display Name (for Utilities)
const utilityNameMap = {
  wifi: "Wifi",
  parking: "Đỗ xe",
  cleaning: "Vệ sinh hàng tuần"
};

// Vietnamese Input -> English Key (for saving Utilities)
const vietnameseToEnglishUtilityMap = {
  wifi: "wifi",
  đỗ_xe: "parking",
  do_xe: "parking",
  vệ_sinh_hàng_tuần: "cleaning",
  ve_sinh_hang_tuan: "cleaning"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: Edit Utility Form Elements ---
  const editUtilityForm = document.getElementById("editUtilityForm");
  const utilityNameInput = document.getElementById("editUtilityName");
  const utilityPriceInput = document.getElementById("editUtilityPrice");
  const utilityImagesInput = document.getElementById("editUtilityImagesInput");
  const selectUtilityImagesBtn = document.getElementById(
    "selectUtilityImagesBtn"
  );
  const utilityImagePreviewDiv = document.getElementById(
    "editUtilityImagePreview"
  );
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editUtilityFeedbackDiv = document.getElementById(
    "editUtilityModalFeedback"
  );
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the utility ID from the current URL path.
  function getUtilityIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (success/error) on the page.
  function showModalFeedback(message, type = "danger") {
    if (editUtilityFeedbackDiv) {
      editUtilityFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editUtilityFeedbackDiv.className = `alert alert-${type} mt-3`;
      editUtilityFeedbackDiv.style.display = "block";
      editUtilityFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides the feedback message area.
  function hideModalFeedback() {
    if (editUtilityFeedbackDiv) {
      editUtilityFeedbackDiv.style.display = "none";
      editUtilityFeedbackDiv.textContent = "";
      editUtilityFeedbackDiv.className = "alert";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Renders image previews for existing and newly added images, handling async loading and removal.
  async function renderImagePreviews() {
    if (!utilityImagePreviewDiv) return; // Target utility preview div
    utilityImagePreviewDiv.innerHTML = ""; // Clear previous

    // Render existing images (fetch data, add remove button)
    const existingImagePromises = existingImagePreviews.map(async (imgInfo) => {
      if (imagesToDeleteIds.includes(imgInfo.id)) return null;
      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png";
      try {
        // Use UtilityService to get image data
        const imageData = await UtilityService.getUtilityImageById(imgInfo.id);
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(error);
      }
      previewItem.innerHTML = `<img src="${imageSrc}" alt="Existing utility image"><button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imgInfo.id}" title="Xóa ảnh này">×</button>`; // Update alt text
      return previewItem;
    });
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );
    existingItems.forEach((previewItem) => {
      utilityImagePreviewDiv.appendChild(previewItem); // Append to utility preview div
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const imageId = event.target.getAttribute("data-image-id");
          if (imageId && !imagesToDeleteIds.includes(imageId)) {
            imagesToDeleteIds.push(imageId);
            renderImagePreviews();
          }
        });
      }
    });

    // Render previews for newly selected files
    newImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newPreviewItem = document.createElement("div");
        newPreviewItem.classList.add("image-preview-item");
        newPreviewItem.innerHTML = `<img src="${e.target.result}" alt="Preview ${file.name}"><button type="button" class="remove-image-btn new-remove-btn" data-index="${index}" title="Hủy thêm ảnh này">×</button>`;
        const removeBtn = newPreviewItem.querySelector(".new-remove-btn");
        if (removeBtn) {
          removeBtn.addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < newImageFiles.length
            ) {
              newImageFiles.splice(indexToRemove, 1);
              renderImagePreviews();
            } else {
              renderImagePreviews();
            }
          });
        }
        utilityImagePreviewDiv.appendChild(newPreviewItem); // Append to utility preview div
      };
      reader.onerror = (error) => {
        console.error(error);
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images
    if (utilityImagePreviewDiv.childElementCount === 0) {
      utilityImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches utility data and populates the form UI.
  async function fetchAndRenderUiUtilityDetails() {
    // Renamed function
    currentUtilityId = getUtilityIdFromUrl(); 
    if (!currentUtilityId) {
      showModalFeedback(
        "Không tìm thấy ID tiện ích hợp lệ trong URL.",
        "danger"
      );
      if (editUtilityForm) editUtilityForm.style.display = "none"; // Target utility form
      return;
    }

    // Reset state
    currentUtilityData = null; // Reset utility data
    existingImagePreviews = [];
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Loading states
    if (utilityImagePreviewDiv)
      // Target utility preview div
      utilityImagePreviewDiv.innerHTML =
        '<p class="text-muted">Đang tải hình ảnh...</p>';
    hideModalFeedback();
    if (editUtilityForm) editUtilityForm.style.display = "block"; // Target utility form

    try {
      // Fetch specific utility details  and Method
      const utilityDetails = await UtilityService.getUtilityById(
        currentUtilityId
      );

      // Store data
      currentUtilityData = utilityDetails; // Store utility data
      existingImagePreviews =
        currentUtilityData.images?.map((img) => ({
          id: typeof img === "string" ? img : img._id
        })) || [];

      // Populate UI
      populateFormFieldsBasicInfo(); // Call population function
      await renderImagePreviews(); // Render images

      if (editUtilityForm) editUtilityForm.classList.remove("was-validated"); // Target utility form
    } catch (error) {
      console.error(error); // Updated log message
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Unknown error"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu tiện ích: ${
          // Updated message
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editUtilityForm) editUtilityForm.style.display = "none"; // Target utility form
    }
  }

  // Function: Populates basic form fields (name, price) with current utility data.
  function populateFormFieldsBasicInfo() {
    if (!currentUtilityData || !editUtilityForm) return; // Check utility data/form

    if (utilityNameInput) {
      // Target utility name input
      const rawNameKey = currentUtilityData.name; // Get utility name key
      const displayName =
        utilityNameMap[rawNameKey] || // Use utilityNameMap
        (rawNameKey
          ? rawNameKey.charAt(0).toUpperCase() +
            rawNameKey.slice(1).replace(/_/g, " ")
          : "");
      utilityNameInput.value = displayName; // Set value
    }

    if (utilityPriceInput)
      // Target utility price input
      utilityPriceInput.value = currentUtilityData.price || 0; // Set value
  }

  // --- Event Handlers ---

  // Function: Handles the selection of new image files.
  function handleImageSelection(event) {
    const files = Array.from(event.target.files);
    newImageFiles.push(...files);
    renderImagePreviews();
    event.target.value = null;
  }

  // Function: Handles the form submission for saving changes.
  async function handleSaveChanges() {
    hideModalFeedback();

    // Validate form
    if (!editUtilityForm || !editUtilityForm.checkValidity()) {
      // Target utility form
      if (editUtilityForm) editUtilityForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    if (editUtilityForm) editUtilityForm.classList.add("was-validated");

    // Check data
    if (!currentUtilityId || !currentUtilityData) {
      // Check utility ID/Data
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu tiện ích hiện tại.",
        "danger"
      );
      return;
    }

    // --- Name Mapping and Validation (Input -> Key for Utility) ---
    const userInputName = utilityNameInput ? utilityNameInput.value.trim() : ""; // Read from utility input
    const userInputNameNormalized = userInputName
      .toLowerCase()
      .replace(/\s+/g, "_");
    const englishEnumKey =
      vietnameseToEnglishUtilityMap[userInputNameNormalized]; // Use utility reverse map

    if (!englishEnumKey) {
      showModalFeedback(
        `Tên tiện ích "${userInputName}" không hợp lệ hoặc không được hỗ trợ. Vui lòng sử dụng tên gợi ý (ví dụ: Wifi, Đỗ xe,...).`, // Updated guidance
        "danger"
      );
      return; // Stop if name is invalid
    }

    // UI Feedback
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = [];

    try {
      // Collect data
      const updatedBasicData = {
        name: englishEnumKey, // Use mapped English key for utility
        price: parseInt(utilityPriceInput.value, 10) || 0 // Read from utility input
      };

      // Compare changes
      let basicDataChanged = false;
      const initialBasicData = currentUtilityData; // Use utility data
      if (
        String(updatedBasicData.name) !== String(initialBasicData.name) ||
        Number(updatedBasicData.price) !== Number(initialBasicData.price)
      ) {
        basicDataChanged = true;
      }

      // Build API calls
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          // Use UtilityService to update  and Method
          UtilityService.updateUtility(
            currentUtilityId,
            updatedBasicData
          ).catch((err) => {
            errors.push(`Lỗi cập nhật tiện ích: ${err.message}`); // Updated message
            throw err;
          })
        );
      }

      if (imagesToDeleteIds.length > 0) {
        apiCalls.push(
          // Use UtilityService to delete images  and Method
          UtilityService.deleteImagesForUtility(
            currentUtilityId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(`Lỗi xóa hình ảnh tiện ích: ${err.message}`); // Updated message
            throw err;
          })
        );
      }
      if (newImageFiles.length > 0) {
        apiCalls.push(
          // Use UtilityService to add images  and Method
          UtilityService.addImagesToUtility(
            currentUtilityId,
            newImageFiles
          ).catch((err) => {
            errors.push(`Lỗi thêm hình ảnh tiện ích mới: ${err.message}`); // Updated message
            throw err;
          })
        );
      }

      // Execute API calls
      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        showModalFeedback("Cập nhật tiện ích thành công!", "success"); // Update message
        // Refresh data after a short delay
        setTimeout(async () => {
          try {
            await fetchAndRenderUiUtilityDetails(); // Re-fetch and re-render utility details
          } catch (fetchError) {
            console.error(fetchError); 
            const fetchErrMsg = (
              fetchError.message || "Unknown error"
            ).toString();
            showModalFeedback(
              `Cập nhật thành công, nhưng lỗi khi tải lại dữ liệu tiện ích: ${
                fetchErrMsg.charAt(0).toUpperCase() + fetchErrMsg.slice(1)
              }`,
              "warning"
            );
          }
        }, 1500);
      } else {
        showModalFeedback("Không có thay đổi nào để lưu.", "info");
      }
    } catch (error) {
      console.error(error); 
      const errorMessage =
        errors.length > 0
          ? errors.join("; ")
          : `Đã xảy ra lỗi khi lưu tiện ích: ${
              // Updated message
              (
                error?.response?.data?.message ||
                error.message ||
                "Unknown error"
              )
                .toString()
                .charAt(0)
                .toUpperCase() +
              (
                error?.response?.data?.message ||
                error.message ||
                "Unknown error"
              )
                .toString()
                .slice(1)
            }`;
      showModalFeedback(errorMessage, "danger");
    } finally {
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---

  // Event Listener: Trigger file input via button
  if (selectUtilityImagesBtn && utilityImagesInput) {
    // Use utility button/input IDs
    selectUtilityImagesBtn.addEventListener("click", () =>
      utilityImagesInput.click()
    );
  }

  // Event Listener: Handle new file selection
  if (utilityImagesInput) {
    // Use utility input ID
    utilityImagesInput.addEventListener("change", handleImageSelection);
  }

  // Event Listener: Save Changes Button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // Event Listener: Cancel Button
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", () => window.history.back());
  }

  // --- Initial Load ---
  // Fetch and render utility data when the page is ready
  fetchAndRenderUiUtilityDetails(); // Call the utility-specific function
});
