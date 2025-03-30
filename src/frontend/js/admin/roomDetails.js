import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope Variables ---
let currentRoomId = null;
let currentRoomData = null;
let allAmenities = [];
let allUtilities = [];
let existingImagePreviews = []; // { id: '...' }
let newImageFiles = []; // File objects
let imagesToDeleteIds = []; // IDs

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selectors ---
  const editRoomForm = document.getElementById("editRoomForm");
  const roomNumberInput = document.getElementById("roomNumber");
  const roomAddressInput = document.getElementById("roomAddress");
  const roomRentPriceInput = document.getElementById("roomRentPrice");
  const roomOccupantsNumberInput = document.getElementById(
    "roomOccupantsNumber"
  );
  const roomStatusSelect = document.getElementById("RoomStatus");
  const roomDescriptionInput = document.getElementById("RoomDescription");
  const roomAmenitiesListDiv = document.getElementById("roomAmenitiesList");
  const roomUtilitiesListDiv = document.getElementById("roomUtilitiesList");
  const roomImagesInput = document.getElementById("roomImagesInput");
  const selectRoomImagesBtn = document.getElementById("selectRoomImagesBtn");
  const roomImagePreviewDiv = document.getElementById("roomImagePreview");
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editRoomFeedbackDiv = document.getElementById("editRoomModalFeedback");
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Functions ---

  // Function: Extract Room ID from URL
  function getRoomIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Display feedback message
  function showModalFeedback(message, type = "danger") {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.textContent = message;
      editRoomFeedbackDiv.className = `alert alert-${type} mt-3`;
      editRoomFeedbackDiv.style.display = "block";
      editRoomFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hide feedback message
  function hideModalFeedback() {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.style.display = "none";
      editRoomFeedbackDiv.textContent = "";
      editRoomFeedbackDiv.className = "alert";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Render Amenity Check List
  function renderAmenitiesChecklist() {
    if (!roomAmenitiesListDiv || !allAmenities.length) {
      if (roomAmenitiesListDiv)
        roomAmenitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện nghi nào.</p>';
      return;
    }
    roomAmenitiesListDiv.innerHTML = "";

    const roomAmenityIds = new Set(
      currentRoomData?.amenities?.map((a) =>
        typeof a === "string" ? a : a._id
      ) || []
    );

    const amenityNameMap = {
      bed: "Giường",
      refrigerator: "Tủ lạnh",
      air_conditioner: "Máy lạnh",
      water_heater: "Vòi nước nóng",
      table_and_chairs: "Bàn ghế",
      electric_stove: "Bếp điện",
      gas_stove: "Bếp ga"
    };

    allAmenities.forEach((amenity) => {
      const isChecked = roomAmenityIds.has(amenity._id);
      const div = document.createElement("div");
      div.classList.add("form-check");

      const amenityName =
        amenityNameMap[amenity.name] || amenity.name || "Tiện nghi";
      div.innerHTML = `<input class="form-check-input" type="checkbox" value="${
        amenity._id
      }" id="edit-amenity-${amenity._id}" name="editRoomAmenities" ${
        isChecked ? "checked" : ""
      }><label class="form-check-label" for="edit-amenity-${
        amenity._id
      }">${amenityName}</label>`;

      roomAmenitiesListDiv.appendChild(div);
    });
  }

  // Function: Render Amenity Check List
  function renderUtilitiesChecklist() {
    if (!roomUtilitiesListDiv || !allUtilities.length) {
      if (roomUtilitiesListDiv)
        roomUtilitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện ích nào.</p>';
      return;
    }
    roomUtilitiesListDiv.innerHTML = "";

    const roomUtilityIds = new Set(
      currentRoomData?.utilities?.map((u) =>
        typeof u === "string" ? u : u._id
      ) || []
    );

    const utilityNameMap = {
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };

    allUtilities.forEach((utility) => {
      const isChecked = roomUtilityIds.has(utility._id);
      const div = document.createElement("div");
      div.classList.add("form-check");

      const utilityName =
        utilityNameMap[utility.name] || utility.name || "Tiện ích";
      div.innerHTML = `<input class="form-check-input" type="checkbox" value="${
        utility._id
      }" id="edit-utility-${utility._id}" name="editRoomUtilities" ${
        isChecked ? "checked" : ""
      }><label class="form-check-label" for="edit-utility-${
        utility._id
      }">${utilityName}</label>`;

      roomUtilitiesListDiv.appendChild(div);
    });
  }

  // Function: Render Image Previews (Refactored to match dashboard.js pattern)
  async function renderImagePreviews() {
    if (!roomImagePreviewDiv) return;
    roomImagePreviewDiv.innerHTML = ""; // Clear previous previews

    // --- 1. Render Existing Images ---
    // Create promises for fetching/rendering existing images
    const existingImagePromises = existingImagePreviews.map(async (imgInfo) => {
      if (imagesToDeleteIds.includes(imgInfo.id)) return null; // Skip if marked for deletion

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default error image

      try {
        const imageData = await RoomService.getRoomImageById(imgInfo.id);
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

      previewItem.innerHTML = `
          <img src="${imageSrc}" alt="">
          <button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imgInfo.id}">×</button>
      `;
      return previewItem; // Return the created element
    });

    // Wait for all fetches and filter out nulls (skipped/deleted items)
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );

    // Append existing items and attach listeners *after* they are in the DOM
    existingItems.forEach((previewItem) => {
      roomImagePreviewDiv.appendChild(previewItem);

      // Attach listener directly to the existing image remove button
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const imageId = event.target.getAttribute("data-image-id");
          if (imageId && !imagesToDeleteIds.includes(imageId)) {
            imagesToDeleteIds.push(imageId);
            renderImagePreviews(); // Re-render to remove the preview
          }
        });
      }
    });

    // --- 2. Render New Image Previews ---
    newImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newPreviewItem = document.createElement("div");
        newPreviewItem.classList.add("image-preview-item");
        newPreviewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${file.name}">
                <button type="button" class="remove-image-btn new-remove-btn" data-index="${index}" title="Hủy thêm ảnh này">×</button>
            `;

        // Attach listener directly to the new image remove button (inside onload)
        const removeBtn = newPreviewItem.querySelector(".new-remove-btn");
        if (removeBtn) {
          removeBtn.addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            // Check index validity relative to the CURRENT state of newImageFiles
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < newImageFiles.length
            ) {
              newImageFiles.splice(indexToRemove, 1); // Remove file from array
              renderImagePreviews(); // Re-render previews
            } else {
              // Optional: Force a re-render anyway to fix indices if something went wrong
              renderImagePreviews();
            }
          });
        }
        // Append after listener is attached
        roomImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        // Add basic error handling for FileReader
        console.error(error);
        // Optionally display a placeholder for the failed preview
      };
      reader.readAsDataURL(file);
    });

    // --- 3. Add "No Images" Message ---
    if (roomImagePreviewDiv.childElementCount === 0) {
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---
  async function fetchAndRenderUiRoomDetails() {
    currentRoomId = getRoomIdFromUrl();
    if (!currentRoomId) {
      showModalFeedback("Không tìm thấy ID phòng hợp lệ trong URL.", "danger");
      if (editRoomForm) editRoomForm.style.display = "none";
      return;
    }

    // Reset state
    currentRoomData = null;
    existingImagePreviews = [];
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Show loading state...
    if (roomAmenitiesListDiv)
      roomAmenitiesListDiv.innerHTML =
        '<p class="text-muted">Đang tải tiện nghi...</p>';
    if (roomUtilitiesListDiv)
      roomUtilitiesListDiv.innerHTML =
        '<p class="text-muted">Đang tải tiện ích...</p>';
    if (roomImagePreviewDiv)
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted">Đang tải hình ảnh...</p>';
    hideModalFeedback();
    if (editRoomForm) editRoomForm.style.display = "block";

    try {
      const [roomDetails, amenities, utilities] = await Promise.all([
        RoomService.getRoomById(currentRoomId),
        AmenityService.getAllAmenities(),
        UtilityService.getAllUtilities()
      ]);

      currentRoomData = roomDetails;
      allAmenities = amenities || [];
      allUtilities = utilities || [];

      // Store only IDs for existing images
      existingImagePreviews =
        currentRoomData.images?.map((img) => ({
          id: typeof img === "string" ? img : img._id
        })) || [];

      populateFormFieldsBasicInfo();
      renderAmenitiesChecklist();
      renderUtilitiesChecklist();
      await renderImagePreviews(); // Render images (now attaches listeners directly)

      editRoomForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      showModalFeedback(
        `Lỗi khi tải dữ liệu phòng: ${
          error?.response?.data?.message || error.message
        }`,
        "danger"
      );
      if (editRoomForm) editRoomForm.style.display = "none";
    }
  }

  function populateFormFieldsBasicInfo() {
    if (!currentRoomData || !editRoomForm) return;
    if (roomNumberInput)
      roomNumberInput.value = currentRoomData.roomNumber || "";
    if (roomAddressInput)
      roomAddressInput.value = currentRoomData.address || "";
    if (roomRentPriceInput)
      roomRentPriceInput.value = currentRoomData.rentPrice || 0;
    if (roomOccupantsNumberInput)
      roomOccupantsNumberInput.value = currentRoomData.occupantsNumber || 1;
    if (roomStatusSelect)
      roomStatusSelect.value = currentRoomData.status || "vacant";
    if (roomDescriptionInput)
      roomDescriptionInput.value = currentRoomData.description || "";
  }

  // --- Event Handlers ---

  function handleImageSelection(event) {
    const files = Array.from(event.target.files);
    newImageFiles.push(...files);
    renderImagePreviews(); // Trigger re-render which includes attaching listeners
    event.target.value = null; // Allow re-selecting same file
  }

  async function handleSaveChanges() {
    hideModalFeedback();

    // --- Form Validation ---
    if (!editRoomForm.checkValidity()) {
      editRoomForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    // Keep showing validation styles after the check
    editRoomForm.classList.add("was-validated");

    // --- Check for Core Data ---
    if (!currentRoomId || !currentRoomData) {
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu phòng hiện tại.",
        "danger"
      );
      return;
    }

    // --- Disable UI, Show Spinner ---
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = []; // Array to collect errors from multiple API calls

    try {
      // --- 1. Collect Current Form Data ---

      // Basic Room Information
      const updatedBasicData = {
        roomNumber: roomNumberInput.value.trim(),
        address: roomAddressInput.value.trim(),
        rentPrice: parseInt(roomRentPriceInput.value, 10) || 0, // Use || 0 as fallback
        occupantsNumber: parseInt(roomOccupantsNumberInput.value, 10) || 1, // Use || 1 as fallback
        status: roomStatusSelect.value,
        description: roomDescriptionInput.value.trim()
      };

      // Selected Amenity IDs
      const currentAmenityIds = new Set();
      Array.from(
        roomAmenitiesListDiv.querySelectorAll('input[type="checkbox"]:checked')
      ).forEach((cb) => currentAmenityIds.add(cb.value));

      // Selected Utility IDs
      const currentUtilityIds = new Set();
      Array.from(
        roomUtilitiesListDiv.querySelectorAll('input[type="checkbox"]:checked')
      ).forEach((cb) => currentUtilityIds.add(cb.value));

      // --- 2. Determine What Actually Changed ---

      // Basic Info Changes Check
      let basicDataChanged = false;
      const initialBasicData = currentRoomData; // Reference original data
      for (const key in updatedBasicData) {
        // Compare using String conversion to handle potential type differences (e.g., number vs string)
        if (String(updatedBasicData[key]) !== String(initialBasicData[key])) {
          // Special case: Ignore if both are empty strings or null/undefined for description
          if (
            key === "description" &&
            !updatedBasicData[key] &&
            !initialBasicData[key]
          ) {
            continue; // Treat empty/null/undefined description as unchanged if both are empty
          }
          basicDataChanged = true;
          break;
        }
      }
      // Explicit check for description becoming non-empty from empty/null/undefined or vice versa wasn't strictly needed
      // because the loop above with String() comparison and the special empty check handles it.

      // Amenity Changes Check
      const initialAmenityIds = new Set(
        currentRoomData.amenities?.map((a) =>
          typeof a === "string" ? a : a._id
        ) || []
      );
      const amenitiesToAdd = [...currentAmenityIds].filter(
        (id) => !initialAmenityIds.has(id)
      );
      const amenitiesToDelete = [...initialAmenityIds].filter(
        (id) => !currentAmenityIds.has(id)
      );

      // Utility Changes Check
      const initialUtilityIds = new Set(
        currentRoomData.utilities?.map((u) =>
          typeof u === "string" ? u : u._id
        ) || []
      );
      const utilitiesToAdd = [...currentUtilityIds].filter(
        (id) => !initialUtilityIds.has(id)
      );
      const utilitiesToDelete = [...initialUtilityIds].filter(
        (id) => !currentUtilityIds.has(id)
      );

      // --- 3. Build Array of API Calls Based on Changes ---
      const apiCalls = []; // Promises for all updates

      if (basicDataChanged) {
        apiCalls.push(
          RoomService.updateRoom(currentRoomId, updatedBasicData).catch(
            (err) => {
              errors.push(
                `Lỗi cập nhật cơ bản: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err; // Stop Promise.all on critical failure (optional)
            }
          )
        );
      }

      if (amenitiesToDelete.length > 0) {
        apiCalls.push(
          RoomService.deleteAmenitiesForRoom(
            currentRoomId,
            amenitiesToDelete
          ).catch((err) => {
            errors.push(
              `Lỗi xóa tiện nghi: ${
                err?.response?.data?.message || err.message
              }`
            );
            throw err;
          })
        );
      }

      if (amenitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addAmenitiesToRoom(currentRoomId, amenitiesToAdd).catch(
            (err) => {
              errors.push(
                `Lỗi thêm tiện nghi: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            }
          )
        );
      }

      if (utilitiesToDelete.length > 0) {
        apiCalls.push(
          RoomService.deleteUtilitiesForRoom(
            currentRoomId,
            utilitiesToDelete
          ).catch((err) => {
            errors.push(
              `Lỗi xóa tiện ích: ${err?.response?.data?.message || err.message}`
            );
            throw err;
          })
        );
      }

      if (utilitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addUtilitiesToRoom(currentRoomId, utilitiesToAdd).catch(
            (err) => {
              errors.push(
                `Lỗi thêm tiện ích: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            }
          )
        );
      }

      if (imagesToDeleteIds.length > 0) {
        apiCalls.push(
          RoomService.deleteImagesForRoom(
            currentRoomId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(
              `Lỗi xóa hình ảnh: ${err?.response?.data?.message || err.message}`
            );
            throw err;
          })
        );
      }

      if (newImageFiles.length > 0) {
        apiCalls.push(
          RoomService.addImagesToRoom(currentRoomId, newImageFiles) // Assumes this service handles FormData
            .catch((err) => {
              errors.push(
                `Lỗi thêm hình ảnh mới: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            })
        );
      }

      // --- 4. Execute API Calls and Handle Results ---
      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        showModalFeedback("Cập nhật phòng thành công!", "success");

        setTimeout(async () => {
          try {
            await fetchAndRenderUiRoomDetails();
          } catch (error) {
            console.error(error);
            showModalFeedback(
              `Cập nhật thành công, nhưng lỗi khi tải lại dữ liệu: ${fetchError.message}`,
              "warning"
            );
          }
        }, 1500);
      } else {
        showModalFeedback("Không có thay đổi nào để lưu.", "info");
      }
    } catch (error) {
      // This catch block executes if any promise in Promise.all *rejects*
      // and the corresponding .catch() block *re-throws* the error.
      // Or if an error occurs before Promise.all.
      console.error(error); // Log the detailed error object
      const errorMessage =
        errors.length > 0
          ? errors.join("; ") // Show accumulated errors if available
          : `Đã xảy ra lỗi: ${
              error?.response?.data?.message || error.message || "Unknown error"
            }`; // Otherwise, show the main error
      showModalFeedback(errorMessage, "danger");
    } finally {
      // --- Re-enable UI ---
      // This block always executes, regardless of success or failure
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
      // Note: State arrays (newImageFiles, imagesToDeleteIds) are reset by fetchAndRenderUiRoomDetails()
      // which is only called on *success*. This is generally the desired behavior.
    }
  }

  // --- Event Listeners Setup ---

  if (selectRoomImagesBtn && roomImagesInput) {
    selectRoomImagesBtn.addEventListener("click", () => {
      roomImagesInput.click();
    });
  }

  if (roomImagesInput) {
    roomImagesInput.addEventListener("change", handleImageSelection);
  }

  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // --- Initial Load ---
  fetchAndRenderUiRoomDetails();
});
