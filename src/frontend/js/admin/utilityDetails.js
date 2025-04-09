import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---

// --- State for Utility Editing ---
let currentUtilityId = null;
let currentUtilityData = null;
let existingImageIds = [];
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
    if (!utilityImagePreviewDiv) return;
    utilityImagePreviewDiv.innerHTML = ""; // Clear previous

    let previewGenerated = false;

    // 1. Render existing images by fetching each one individually
    const existingImagePromises = existingImageIds.map(async (imageId) => {
      if (imagesToDeleteIds.includes(imageId)) return null; // Skip if marked for removal

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default fallback

      try {
        // Fetch individual image data using UtilityService
        const imageDataResponse = await UtilityService.getUtilityImageById(
          imageId
        );

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
            `Invalid image data structure received for utility image ID: ${imageId}`
          );
        }
      } catch (error) {
        console.error(error);
      }

      previewItem.innerHTML = `
            <img src="${imageSrc}" alt="Ảnh tiện ích hiện có">
            <button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imageId}" title="Xóa ảnh này">×</button>
        `;

      // Add listener AFTER element is created
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const idToRemove = event.target.getAttribute("data-image-id");
          if (idToRemove && !imagesToDeleteIds.includes(idToRemove)) {
            imagesToDeleteIds.push(idToRemove);
            renderImagePreviews(); // Re-render
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
      utilityImagePreviewDiv.appendChild(previewItem);
    });

    // 2. Render previews for newly selected files (using FileReader)
    newImageFiles.forEach((file, index) => {
      previewGenerated = true;
      const reader = new FileReader();
      reader.onload = function (e) {
        const newPreviewItem = document.createElement("div");
        newPreviewItem.classList.add("image-preview-item");
        newPreviewItem.innerHTML = `
                <img src="${e.target.result}" alt="Xem trước ảnh mới ${file.name}">
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
              indexToRemove < newImageFiles.length
            ) {
              newImageFiles.splice(indexToRemove, 1);
              renderImagePreviews();
            }
          });
        utilityImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        // Optional: Add error placeholder item
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images after all rendering attempts
    if (!previewGenerated && utilityImagePreviewDiv.childElementCount === 0) {
      utilityImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches utility data and populates the form UI.
  async function fetchAndRenderUiUtilityDetails() {
    currentUtilityId = getUtilityIdFromUrl();
    if (!currentUtilityId) {
      showModalFeedback(
        "Không tìm thấy ID tiện ích hợp lệ trong URL.",
        "danger"
      );
      if (editUtilityForm) editUtilityForm.style.display = "none";
      return;
    }

    // Reset state
    currentUtilityData = null;
    existingImageIds = []; // Reset to store flat IDs
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Loading states
    if (utilityImagePreviewDiv)
      utilityImagePreviewDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải ảnh...</p>'; // Use small text
    hideModalFeedback();
    if (editUtilityForm) editUtilityForm.style.display = "block";

    try {
      // Fetch specific utility details
      const utilityDetails = await UtilityService.getUtilityById(
        currentUtilityId
      );

      // Store data
      currentUtilityData = utilityDetails;
      if (!currentUtilityData)
        throw new Error("Không tìm thấy dữ liệu tiện ích.");

      existingImageIds =
        currentUtilityData.images
          ?.map((img) => (typeof img === "string" ? img : img._id)) // Get ID directly
          .filter((id) => id) || []; // Filter out falsy IDs and ensure array

      // Populate UI
      populateFormFieldsBasicInfo();
      await renderImagePreviews(); // Render images (now uses existingImageIds)

      if (editUtilityForm) editUtilityForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu tiện ích: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editUtilityForm) editUtilityForm.style.display = "none";
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
    renderImagePreviews(); // Re-render previews
    event.target.value = null; // Allow re-selecting same file
  }

  // Function: Handles the form submission for saving changes.
  async function handleSaveChanges() {
    hideModalFeedback();

    // Validate form
    if (!editUtilityForm || !editUtilityForm.checkValidity()) {
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
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu tiện ích hiện tại.",
        "danger"
      );
      return;
    }

    // --- Name Mapping and Validation ---
    const userInputName = utilityNameInput ? utilityNameInput.value.trim() : "";
    const userInputNameNormalized = userInputName
      .toLowerCase()
      .replace(/\s+/g, "_");
    const englishEnumKey =
      vietnameseToEnglishUtilityMap[userInputNameNormalized];

    if (!englishEnumKey) {
      showModalFeedback(
        `Tên tiện ích "${userInputName}" không hợp lệ hoặc không được hỗ trợ. Vui lòng sử dụng tên gợi ý (ví dụ: Wifi, Đỗ xe,...).`,
        "danger"
      );
      return;
    }

    // UI Feedback
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = [];

    try {
      // Collect basic data
      const updatedBasicData = {
        name: englishEnumKey,
        price: parseInt(utilityPriceInput.value, 10) || 0
      };

      // Compare basic data changes
      let basicDataChanged = false;
      const initialBasicData = currentUtilityData;
      if (
        String(updatedBasicData.name) !== String(initialBasicData.name) ||
        Number(updatedBasicData.price) !== Number(initialBasicData.price)
      ) {
        basicDataChanged = true;
      }

      // Check image changes
      const imagesToDeleteChanged = imagesToDeleteIds.length > 0;
      const newImagesAdded = newImageFiles.length > 0;

      if (!basicDataChanged && !imagesToDeleteChanged && !newImagesAdded) {
        showModalFeedback("Không có thay đổi nào để lưu.", "info");
        // No need to proceed further, re-enable button
        if (saveChangesBtn) saveChangesBtn.disabled = false;
        if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
        return;
      }

      // Build API calls
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          UtilityService.updateUtility(
            currentUtilityId,
            updatedBasicData
          ).catch((err) => {
            errors.push(
              `Lỗi cập nhật tiện ích: ${
                err?.response?.data?.message || err.message
              }`
            );
            throw err; // Stop Promise.all on critical error
          })
        );
      }

      if (imagesToDeleteChanged) {
        apiCalls.push(
          UtilityService.deleteImagesForUtility(
            currentUtilityId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(
              `Lỗi xóa hình ảnh tiện ích: ${
                err?.response?.data?.message || err.message
              }`
            );
            // Decide if this error should stop Promise.all
            // throw err;
          })
        );
      }
      if (newImagesAdded) {
        // Assuming UtilityService.addImagesToUtility handles FormData internally
        // If not, create FormData here:
        // const imageData = new FormData();
        // newImageFiles.forEach(file => imageData.append('utilityImages', file)); // Adjust field name if needed
        apiCalls.push(
          UtilityService.addImagesToUtility(
            currentUtilityId,
            newImageFiles // or imageData if using FormData
          ).catch((err) => {
            errors.push(
              `Lỗi thêm hình ảnh tiện ích mới: ${
                err?.response?.data?.message || err.message
              }`
            );
            // Decide if this error should stop Promise.all
            // throw err;
          })
        );
      }

      // Execute API calls
      await Promise.all(apiCalls);

      // === MODIFIED START: Clear state only on full success or handle partial success ===
      if (errors.length > 0) {
        showModalFeedback(
          `Cập nhật thành công với một số lỗi: ${errors.join("; ")}`,
          "warning"
        );
        // Decide if you still want to clear state partially or leave it
        // For simplicity, we might only clear if ALL operations succeeded.
        // Or clear only the successful ones if trackable. Let's clear all for now after attempting.
        newImageFiles = [];
        imagesToDeleteIds = []; // Clear ids attempted for deletion
      } else {
        showModalFeedback("Cập nhật tiện ích thành công!", "success");
        // Clear state on full success
        newImageFiles = [];
        imagesToDeleteIds = [];
      }

      // Refresh data after a short delay
      setTimeout(async () => {
        try {
          await fetchAndRenderUiUtilityDetails(); // Re-fetch and re-render
        } catch (fetchError) {
          console.error(fetchError);
          const fetchErrMsg = (fetchError.message || "Lỗi không rõ").toString();
          showModalFeedback(
            `Đã lưu, nhưng lỗi khi tải lại dữ liệu: ${
              fetchErrMsg.charAt(0).toUpperCase() + fetchErrMsg.slice(1)
            }`,
            "warning"
          );
        }
      }, 1500);
    } catch (error) {
      // This catches critical errors that stopped Promise.all
      console.error(error);
      const errorMessage =
        errors.length > 0
          ? errors.join("; ")
          : `Lỗi không xác định khi lưu tiện ích.`; // Simplified error
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
