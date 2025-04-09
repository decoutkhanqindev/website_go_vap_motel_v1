import AmenityService from "../services/AmenityService.js";

// --- Global Scope: State Variables ---

// --- State for Amenity Editing ---
let currentAmenityId = null;
let currentAmenityData = null;
let existingImageIds = [];
let newImageFiles = [];
let imagesToDeleteIds = [];

// --- Name Mapping (Define both directions) ---

// English Key -> Vietnamese Display Name
const amenityNameMap = {
  bed: "Giường",
  refrigerator: "Tủ lạnh",
  air_conditioner: "Máy lạnh",
  water_heater: "Vòi nước nóng",
  table_and_chairs: "Bàn ghế",
  electric_stove: "Bếp điện",
  gas_stove: "Bếp ga"
};

// Vietnamese Input -> English Key (for saving)
const vietnameseToEnglishAmenityMap = {
  giường: "bed",
  tủ_lạnh: "refrigerator",
  may_lanh: "air_conditioner",
  máy_lạnh: "air_conditioner",
  vòi_nước_nóng: "water_heater",
  ban_ghe: "table_and_chairs",
  bàn_ghế: "table_and_chairs",
  bếp_điện: "electric_stove",
  bep_dien: "electric_stove",
  bếp_ga: "gas_stove",
  bep_ga: "gas_stove"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: Edit Amenity Form Elements ---
  const editAmenityForm = document.getElementById("editAmenityForm");
  const amenityNameInput = document.getElementById("editAmenityName");
  const amenityPriceInput = document.getElementById("editAmenityPrice");
  const amenityImagesInput = document.getElementById("editAmenityImagesInput");
  const selectAmenityImagesBtn = document.getElementById(
    "selectAmenityImagesBtn"
  );
  const amenityImagePreviewDiv = document.getElementById(
    "editAmenityImagePreview"
  );
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editAmenityFeedbackDiv = document.getElementById(
    "editAmenityModalFeedback"
  );
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the amenity ID from the current URL path.
  function getAmenityIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (success/error) on the page.
  function showModalFeedback(message, type = "danger") {
    if (editAmenityFeedbackDiv) {
      editAmenityFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editAmenityFeedbackDiv.className = `alert alert-${type} mt-3`;
      editAmenityFeedbackDiv.style.display = "block";
      editAmenityFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides the feedback message area.
  function hideModalFeedback() {
    if (editAmenityFeedbackDiv) {
      editAmenityFeedbackDiv.style.display = "none";
      editAmenityFeedbackDiv.textContent = "";
      editAmenityFeedbackDiv.className = "alert";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Renders image previews for existing and newly added images, handling async loading and removal.
  async function renderImagePreviews() {
    if (!amenityImagePreviewDiv) return;
    amenityImagePreviewDiv.innerHTML = ""; // Clear previous

    let previewGenerated = false;

    // 1. Render existing images by fetching each one individually
    const existingImagePromises = existingImageIds.map(async (imageId) => {
      if (imagesToDeleteIds.includes(imageId)) return null; // Skip if marked for removal

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default fallback

      try {
        // Fetch individual image data using AmenityService
        const imageDataResponse = await AmenityService.getAmenityImageById(
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
            `Invalid image data structure received for amenity image ID: ${imageId}`
          );
        }
      } catch (error) {
        console.error(error);
      }

      previewItem.innerHTML = `
            <img src="${imageSrc}" alt="Ảnh tiện nghi hiện có">
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
      amenityImagePreviewDiv.appendChild(previewItem);
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
        amenityImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        // Optional: Add error placeholder item
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images after all rendering attempts
    if (!previewGenerated && amenityImagePreviewDiv.childElementCount === 0) {
      amenityImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches amenity data and populates the form UI.
  async function fetchAndRenderUiAmenityDetails() {
    currentAmenityId = getAmenityIdFromUrl();
    if (!currentAmenityId) {
      showModalFeedback(
        "Không tìm thấy ID tiện nghi hợp lệ trong URL.",
        "danger"
      );
      if (editAmenityForm) editAmenityForm.style.display = "none";
      return;
    }

    // Reset state
    currentAmenityData = null;
    // === MODIFIED START: Reset consistent state variables ===
    existingImageIds = []; // Reset to store flat IDs
    newImageFiles = [];
    imagesToDeleteIds = [];
    // === MODIFIED END ===

    // Loading states
    if (amenityImagePreviewDiv)
      amenityImagePreviewDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải ảnh...</p>'; // Use small text
    hideModalFeedback();
    if (editAmenityForm) editAmenityForm.style.display = "block";

    try {
      // Fetch specific amenity details
      const amenityDetails = await AmenityService.getAmenityById(
        currentAmenityId
      );

      // Store data
      currentAmenityData = amenityDetails;
      if (!currentAmenityData)
        throw new Error("Không tìm thấy dữ liệu tiện nghi.");

      // === MODIFIED START: Populate flat array of existing image IDs ===
      existingImageIds =
        currentAmenityData.images
          ?.map((img) => (typeof img === "string" ? img : img._id)) // Get ID directly
          .filter((id) => id) || []; // Filter out falsy IDs and ensure array
      // === MODIFIED END ===

      // Populate UI
      populateFormFieldsBasicInfo();
      await renderImagePreviews(); // Render images (now uses existingImageIds)

      if (editAmenityForm) editAmenityForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu tiện nghi: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editAmenityForm) editAmenityForm.style.display = "none";
    }
  }

  // Function: Populates basic form fields (name, price) with current amenity data.
  function populateFormFieldsBasicInfo() {
    if (!currentAmenityData || !editAmenityForm) return;

    if (amenityNameInput) {
      const rawNameKey = currentAmenityData.name;
      const displayName =
        amenityNameMap[rawNameKey] ||
        (rawNameKey
          ? rawNameKey.charAt(0).toUpperCase() +
            rawNameKey.slice(1).replace(/_/g, " ")
          : "");
      amenityNameInput.value = displayName;
    }

    if (amenityPriceInput)
      amenityPriceInput.value = currentAmenityData.price || 0;
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
    if (!editAmenityForm || !editAmenityForm.checkValidity()) {
      if (editAmenityForm) editAmenityForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    if (editAmenityForm) editAmenityForm.classList.add("was-validated");

    // Check data
    if (!currentAmenityId || !currentAmenityData) {
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu tiện nghi hiện tại.",
        "danger"
      );
      return;
    }

    // --- Name Mapping and Validation ---
    const userInputName = amenityNameInput ? amenityNameInput.value.trim() : "";
    const userInputNameNormalized = userInputName
      .toLowerCase()
      .replace(/\s+/g, "_");
    const englishEnumKey =
      vietnameseToEnglishAmenityMap[userInputNameNormalized];

    if (!englishEnumKey) {
      showModalFeedback(
        `Tên tiện nghi "${userInputName}" không hợp lệ hoặc không được hỗ trợ. Vui lòng sử dụng tên gợi ý (ví dụ: Giường, Tủ lạnh,...).`,
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
        price: parseInt(amenityPriceInput.value, 10) || 0
      };

      // Compare basic data changes
      let basicDataChanged = false;
      const initialBasicData = currentAmenityData;
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
          AmenityService.updateAmenity(
            currentAmenityId,
            updatedBasicData
          ).catch((err) => {
            errors.push(
              `Lỗi cập nhật tiện nghi: ${
                err?.response?.data?.message || err.message
              }`
            );
            throw err; // Stop Promise.all on critical error
          })
        );
      }

      if (imagesToDeleteChanged) {
        apiCalls.push(
          AmenityService.deleteImagesForAmenity(
            currentAmenityId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(
              `Lỗi xóa hình ảnh tiện nghi: ${
                err?.response?.data?.message || err.message
              }`
            );
            // Decide if this error should stop Promise.all
            // throw err;
          })
        );
      }
      if (newImagesAdded) {
        // Assuming AmenityService.addImagesToAmenity handles FormData internally
        // If not, create FormData here:
        // const imageData = new FormData();
        // newImageFiles.forEach(file => imageData.append('amenityImages', file)); // Adjust field name if needed
        apiCalls.push(
          AmenityService.addImagesToAmenity(
            currentAmenityId,
            newImageFiles // or imageData if using FormData
          ).catch((err) => {
            errors.push(
              `Lỗi thêm hình ảnh tiện nghi mới: ${
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
        showModalFeedback("Cập nhật tiện nghi thành công!", "success");
        // Clear state on full success
        newImageFiles = [];
        imagesToDeleteIds = [];
      }
      // === MODIFIED END ===

      // Refresh data after a short delay
      setTimeout(async () => {
        try {
          await fetchAndRenderUiAmenityDetails(); // Re-fetch and re-render
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
          : `Lỗi không xác định khi lưu tiện nghi.`; // Simplified error
      showModalFeedback(errorMessage, "danger");
    } finally {
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---

  // Event Listener: Trigger file input via button
  if (selectAmenityImagesBtn && amenityImagesInput) {
    // Use amenity button/input IDs
    selectAmenityImagesBtn.addEventListener("click", () =>
      amenityImagesInput.click()
    );
  }

  // Event Listener: Handle new file selection
  if (amenityImagesInput) {
    // Use amenity input ID
    amenityImagesInput.addEventListener("change", handleImageSelection);
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
  // Fetch and render amenity data when the page is ready
  fetchAndRenderUiAmenityDetails(); // Call the amenity-specific function
});
