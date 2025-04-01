import AmenityService from "../services/AmenityService.js";

// --- Global Scope: State Variables ---

// --- State for Amenity Editing ---
let currentAmenityId = null;
let currentAmenityData = null;
let existingImagePreviews = [];
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
    if (!amenityImagePreviewDiv) return; // Target amenity preview div
    amenityImagePreviewDiv.innerHTML = ""; // Clear previous

    // Render existing images (fetch data, add remove button)
    const existingImagePromises = existingImagePreviews.map(async (imgInfo) => {
      if (imagesToDeleteIds.includes(imgInfo.id)) return null; // Skip if marked for deletion
      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default error image
      try {
        // Use AmenityService to get image data
        const imageData = await AmenityService.getAmenityImageById(imgInfo.id);
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(error); // Update log message
      }
      previewItem.innerHTML = `<img src="${imageSrc}" alt="Existing amenity image"><button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imgInfo.id}" title="Xóa ảnh này">×</button>`; // Update alt text
      return previewItem;
    });
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );
    existingItems.forEach((previewItem) => {
      amenityImagePreviewDiv.appendChild(previewItem); // Append to amenity preview div
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const imageId = event.target.getAttribute("data-image-id");
          if (imageId && !imagesToDeleteIds.includes(imageId)) {
            imagesToDeleteIds.push(imageId); // Mark for deletion
            renderImagePreviews(); // Re-render to visually remove
          }
        });
      }
    });

    // Render previews for newly selected files (using FileReader, add remove button)
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
              newImageFiles.splice(indexToRemove, 1); // Remove from new files array
              renderImagePreviews(); // Re-render to reflect removal and update indices
            } else {
              renderImagePreviews(); // Re-render just in case
            }
          });
        }
        amenityImagePreviewDiv.appendChild(newPreviewItem); // Append to amenity preview div
      };
      reader.onerror = (error) => {
        console.error(error);
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images are present
    if (amenityImagePreviewDiv.childElementCount === 0) {
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
      ); // Update message
      if (editAmenityForm) editAmenityForm.style.display = "none"; // Target amenity form
      return;
    }

    // Reset state before fetching
    currentAmenityData = null; // Reset amenity data
    existingImagePreviews = [];
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Show loading states (only for images now)
    // Removed loading for checklists
    if (amenityImagePreviewDiv)
      // Target amenity preview div
      amenityImagePreviewDiv.innerHTML =
        '<p class="text-muted">Đang tải hình ảnh...</p>';
    hideModalFeedback();
    if (editAmenityForm) editAmenityForm.style.display = "block"; // Ensure form is visible

    try {
      // Fetch only the specific amenity details
      const amenityDetails = await AmenityService.getAmenityById(
        currentAmenityId
      ); // Use AmenityService

      // Store fetched data globally
      currentAmenityData = amenityDetails; // Store amenity data
      existingImagePreviews =
        currentAmenityData.images?.map((img) => ({
          id: typeof img === "string" ? img : img._id // Assuming similar image structure
        })) || [];

      // Populate UI elements
      populateFormFieldsBasicInfo(); // Call the population function
      // Removed calls to renderAmenitiesChecklist and renderUtilitiesChecklist
      await renderImagePreviews(); // Wait for images to render

      if (editAmenityForm) editAmenityForm.classList.remove("was-validated"); // Clear validation state
    } catch (error) {
      console.error(error); // Update log message
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Unknown error"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu tiện nghi: ${
          // Update message
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editAmenityForm) editAmenityForm.style.display = "none"; // Hide amenity form on load error
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
    renderImagePreviews(); // Re-render previews including new ones
    event.target.value = null; // Allow re-selecting same file
  }

  // Function: Handles the form submission for saving changes.
  async function handleSaveChanges() {
    hideModalFeedback();

    // Validate form inputs
    if (!editAmenityForm || !editAmenityForm.checkValidity()) {
      // Target amenity form
      if (editAmenityForm) editAmenityForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    if (editAmenityForm) editAmenityForm.classList.add("was-validated"); // Ensure styles shown

    // Check essential data exists
    if (!currentAmenityId || !currentAmenityData) {
      // Check amenity ID/Data
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu tiện nghi hiện tại.", // Update message
        "danger"
      );
      return;
    }

    // --- Name Mapping and Validation (Input -> Key) ---
    const userInputName = amenityNameInput ? amenityNameInput.value.trim() : "";
    const userInputNameNormalized = userInputName
      .toLowerCase()
      .replace(/\s+/g, "_");
    const englishEnumKey =
      vietnameseToEnglishAmenityMap[userInputNameNormalized];

    if (!englishEnumKey) {
      showModalFeedback(
        `Tên tiện nghi "${userInputName}" không hợp lệ hoặc không được hỗ trợ. Vui lòng sử dụng tên gợi ý (ví dụ: Giường, Tủ lạnh,...).`, // Provide guidance
        "danger"
      );
      // Don't disable the save button here, let the user correct the name.
      return; // Stop if name is invalid
    }

    // Disable button, show spinner
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = []; // To collect errors from multiple API calls

    try {
      // Collect current data from form
      const updatedBasicData = {
        name: englishEnumKey, // Use the mapped English key ("bed")
        price: parseInt(amenityPriceInput.value, 10) || 0
      };

      // Compare with initial data to determine changes
      let basicDataChanged = false;
      const initialBasicData = currentAmenityData; // Has original English key and price
      if (
        String(updatedBasicData.name) !== String(initialBasicData.name) ||
        Number(updatedBasicData.price) !== Number(initialBasicData.price)
      ) {
        basicDataChanged = true;
      }

      // Build array of API call promises based on changes detected
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          // Use AmenityService to update
          AmenityService.updateAmenity(
            currentAmenityId,
            updatedBasicData
          ).catch((err) => {
            errors.push(`Lỗi cập nhật tiện nghi: ${err.message}`); // Update message
            throw err;
          })
        );
      }

      if (imagesToDeleteIds.length > 0) {
        apiCalls.push(
          AmenityService.deleteImagesForAmenity(
            currentAmenityId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(`Lỗi xóa hình ảnh tiện nghi: ${err.message}`); // Update message
            throw err;
          })
        );
      }
      if (newImageFiles.length > 0) {
        apiCalls.push(
          AmenityService.addImagesToAmenity(
            currentAmenityId,
            newImageFiles
          ).catch((err) => {
            errors.push(`Lỗi thêm hình ảnh tiện nghi mới: ${err.message}`); // Update message
            throw err;
          })
        );
      }

      // Execute API calls if changes were made
      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        showModalFeedback("Cập nhật tiện nghi thành công!", "success"); // Update message
        // Refresh data after a short delay
        setTimeout(async () => {
          try {
            await fetchAndRenderUiAmenityDetails(); // Re-fetch and re-render amenity details
          } catch (fetchError) {
            console.error(fetchError); // Update log message
            const fetchErrMsg = (
              fetchError.message || "Unknown error"
            ).toString();
            showModalFeedback(
              `Cập nhật thành công, nhưng lỗi khi tải lại dữ liệu tiện nghi: ${
                // Update message
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
      // Handle errors from Promise.all or other logic
      console.error(error);
      const errorMessage =
        errors.length > 0
          ? errors.join("; ")
          : `Đã xảy ra lỗi khi lưu tiện nghi: ${
              // Update message
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
      // Re-enable button, hide spinner (always executes)
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
