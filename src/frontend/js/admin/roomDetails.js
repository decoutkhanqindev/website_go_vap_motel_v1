import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Room Editing ---
let currentRoomId = null;
let currentRoomData = null;
let allAmenities = [];
let allUtilities = [];
let existingImageIds = [];
let newImageFiles = [];
let imagesToDeleteIds = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: Edit Room Form Elements ---
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

  // --- Core Utility Functions ---

  // Function: Extracts the room ID from the current URL path.
  function getRoomIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (success/error) on the page.
  function showModalFeedback(message, type = "danger") {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editRoomFeedbackDiv.className = `alert alert-${type} mt-3`;
      editRoomFeedbackDiv.style.display = "block";
      editRoomFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides the feedback message area.
  function hideModalFeedback() {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.style.display = "none";
      editRoomFeedbackDiv.textContent = "";
      editRoomFeedbackDiv.className = "alert";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Renders the amenity checklist, marking items present in the current room.
  function renderAmenitiesChecklist() {
    if (!roomAmenitiesListDiv || !allAmenities.length) {
      if (roomAmenitiesListDiv)
        roomAmenitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện nghi nào.</p>';
      return;
    }
    roomAmenitiesListDiv.innerHTML = ""; // Clear previous
    const roomAmenityIds = new Set(
      currentRoomData?.amenities?.map((a) =>
        typeof a === "string" ? a : a._id
      ) || []
    );
    const amenityNameMap = {
      // Optional: Map for friendly names
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
        amenityNameMap[amenity.name] ||
        (amenity.name
          ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
          : "Tiện nghi");
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

  // Function: Renders the utility checklist, marking items present in the current room.
  function renderUtilitiesChecklist() {
    if (!roomUtilitiesListDiv || !allUtilities.length) {
      if (roomUtilitiesListDiv)
        roomUtilitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện ích nào.</p>';
      return;
    }
    roomUtilitiesListDiv.innerHTML = ""; // Clear previous
    const roomUtilityIds = new Set(
      currentRoomData?.utilities?.map((u) =>
        typeof u === "string" ? u : u._id
      ) || []
    );
    const utilityNameMap = {
      // Optional: Map for friendly names
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };
    allUtilities.forEach((utility) => {
      const isChecked = roomUtilityIds.has(utility._id);
      const div = document.createElement("div");
      div.classList.add("form-check");
      const utilityName =
        utilityNameMap[utility.name] ||
        (utility.name
          ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
          : "Tiện ích");
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

  // Function: Renders image previews for existing and newly added images, handling async loading and removal.
  async function renderImagePreviews() {
    if (!roomImagePreviewDiv) return;
    roomImagePreviewDiv.innerHTML = ""; // Clear previous

    let previewGenerated = false;

    // 1. Render existing images by fetching each one individually
    const existingImagePromises = existingImageIds.map(async (imageId) => {
      if (imagesToDeleteIds.includes(imageId)) return null; // Skip if marked for removal

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default fallback

      try {
        // Fetch individual image data using RoomService
        const imageDataResponse = await RoomService.getRoomImageById(imageId);

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
            `Invalid image data structure received for room image ID: ${imageId}`
          );
        }
      } catch (error) {
        console.error(error);
      }

      previewItem.innerHTML = `
                <img src="${imageSrc}" alt="Ảnh phòng hiện có">
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
      roomImagePreviewDiv.appendChild(previewItem);
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
        roomImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        // Optional: Add error placeholder item
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images after all rendering attempts
    if (!previewGenerated && roomImagePreviewDiv.childElementCount === 0) {
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches all necessary data (room, amenities, utilities) and populates the form UI.
  async function fetchAndRenderUiRoomDetails() {
    currentRoomId = getRoomIdFromUrl();
    if (!currentRoomId) {
      showModalFeedback("Không tìm thấy ID phòng hợp lệ trong URL.", "danger");
      if (editRoomForm) editRoomForm.style.display = "none";
      return;
    }

    // Reset state
    currentRoomData = null;
    allAmenities = [];
    allUtilities = [];
    existingImageIds = []; // Reset to store flat IDs
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Loading states
    if (roomAmenitiesListDiv)
      roomAmenitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải tiện nghi...</p>';
    if (roomUtilitiesListDiv)
      roomUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải tiện ích...</p>';
    if (roomImagePreviewDiv)
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải ảnh...</p>';
    hideModalFeedback();
    if (editRoomForm) editRoomForm.style.display = "block";

    try {
      // Fetch data concurrently
      const [roomDetails, amenities, utilities] = await Promise.all([
        RoomService.getRoomById(currentRoomId),
        AmenityService.getAllAmenities(),
        UtilityService.getAllUtilities()
      ]);

      // Store fetched data globally
      currentRoomData = roomDetails;
      if (!currentRoomData) throw new Error("Không tìm thấy dữ liệu phòng.");
      allAmenities = amenities || [];
      allUtilities = utilities || [];

      existingImageIds =
        currentRoomData.images
          ?.map((img) => (typeof img === "string" ? img : img._id)) // Get ID directly
          .filter((id) => id) || []; // Filter out falsy IDs and ensure array

      // Populate UI elements
      populateFormFieldsBasicInfo();
      renderAmenitiesChecklist();
      renderUtilitiesChecklist();
      await renderImagePreviews(); // Render images (now uses existingImageIds)

      if (editRoomForm) editRoomForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu phòng: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editRoomForm) editRoomForm.style.display = "none";
    }
  }

  // Function: Populates basic form fields (text inputs, select) with current room data.
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
    if (!editRoomForm || !editRoomForm.checkValidity()) {
      if (editRoomForm) editRoomForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    if (editRoomForm) editRoomForm.classList.add("was-validated");

    // Check data
    if (!currentRoomId || !currentRoomData) {
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu phòng hiện tại.",
        "danger"
      );
      return;
    }

    // --- Detect Changes ---
    // Basic Info
    const updatedBasicData = {
      roomNumber: roomNumberInput.value.trim(),
      address: roomAddressInput.value.trim(),
      rentPrice: parseInt(roomRentPriceInput.value, 10) || 0,
      occupantsNumber: parseInt(roomOccupantsNumberInput.value, 10) || 1,
      status: roomStatusSelect.value,
      description: roomDescriptionInput.value.trim()
    };
    let basicDataChanged = false;
    const initialBasicData = currentRoomData;
    for (const key in updatedBasicData) {
      // Treat undefined/null description as empty string for comparison
      const currentVal =
        key === "description" && !initialBasicData[key]
          ? ""
          : initialBasicData[key];
      const newVal =
        key === "description" && !updatedBasicData[key]
          ? ""
          : updatedBasicData[key];
      if (String(currentVal ?? "") !== String(newVal ?? "")) {
        basicDataChanged = true;
        break;
      }
    }

    // Amenities
    const currentAmenityIds = new Set();
    roomAmenitiesListDiv
      ?.querySelectorAll('input[type="checkbox"]:checked')
      .forEach((cb) => currentAmenityIds.add(cb.value));
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
    const amenitiesChanged =
      amenitiesToAdd.length > 0 || amenitiesToDelete.length > 0;

    // Utilities
    const currentUtilityIds = new Set();
    roomUtilitiesListDiv
      ?.querySelectorAll('input[type="checkbox"]:checked')
      .forEach((cb) => currentUtilityIds.add(cb.value));
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
    const utilitiesChanged =
      utilitiesToAdd.length > 0 || utilitiesToDelete.length > 0;

    // Images
    const imagesToDeleteChanged = imagesToDeleteIds.length > 0;
    const newImagesAdded = newImageFiles.length > 0;

    // Check if any changes were made
    if (
      !basicDataChanged &&
      !amenitiesChanged &&
      !utilitiesChanged &&
      !imagesToDeleteChanged &&
      !newImagesAdded
    ) {
      showModalFeedback("Không có thay đổi nào để lưu.", "info");
      return;
    }

    // UI Feedback
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = [];

    try {
      // Build API calls
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          RoomService.updateRoom(currentRoomId, updatedBasicData).catch(
            (err) => {
              errors.push(
                `Lỗi cập nhật cơ bản: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err; // Critical error
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
            // Decide if non-critical
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
              // Decide if non-critical
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
            // Decide if non-critical
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
              // Decide if non-critical
            }
          )
        );
      }
      if (imagesToDeleteChanged) {
        // Use the state variable directly
        apiCalls.push(
          RoomService.deleteImagesForRoom(
            currentRoomId,
            imagesToDeleteIds // Pass the array of IDs to delete
          ).catch((err) => {
            errors.push(
              `Lỗi xóa hình ảnh: ${err?.response?.data?.message || err.message}`
            );
            // Decide if non-critical
          })
        );
      }
      if (newImagesAdded) {
        // Use the state variable directly
        // Assuming RoomService.addImagesToRoom handles FormData internally or accepts File array
        // const imageData = new FormData();
        // newImageFiles.forEach(file => imageData.append('roomImages', file)); // Adjust field name if needed
        apiCalls.push(
          RoomService.addImagesToRoom(
            currentRoomId,
            newImageFiles // or imageData
          ).catch((err) => {
            errors.push(
              `Lỗi thêm hình ảnh mới: ${
                err?.response?.data?.message || err.message
              }`
            );
            // Decide if non-critical
          })
        );
      }

      // Execute API calls
      await Promise.all(apiCalls);

      if (errors.length > 0) {
        showModalFeedback(
          `Cập nhật thành công với một số lỗi: ${errors.join("; ")}`,
          "warning"
        );
        // Clear only image state after attempt, other states (like amenities/utilities)
        // might be complex to partially clear without re-fetching. Re-fetch will fix visual state.
        newImageFiles = [];
        imagesToDeleteIds = [];
      } else {
        showModalFeedback("Cập nhật phòng thành công!", "success");
        // Clear state on full success
        newImageFiles = [];
        imagesToDeleteIds = [];
      }

      // Refresh data after a short delay
      setTimeout(async () => {
        try {
          await fetchAndRenderUiRoomDetails(); // Re-fetch and re-render
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
      // Catches critical errors that stopped Promise.all
      console.error(error);
      const errorMessage =
        errors.length > 0
          ? errors.join("; ")
          : `Lỗi không xác định khi lưu phòng.`;
      showModalFeedback(errorMessage, "danger");
    } finally {
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---

  // Event Listener: Trigger file input via button
  if (selectRoomImagesBtn && roomImagesInput) {
    selectRoomImagesBtn.addEventListener("click", () =>
      roomImagesInput.click()
    );
  }

  // Event Listener: Handle new file selection
  if (roomImagesInput) {
    roomImagesInput.addEventListener("change", handleImageSelection);
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
  // Fetch and render data when the page is ready
  fetchAndRenderUiRoomDetails();
});
