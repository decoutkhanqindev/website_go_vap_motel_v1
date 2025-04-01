import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Room Editing ---
let currentRoomId = null; 
let currentRoomData = null;
let allAmenities = []; 
let allUtilities = []; 
let existingImagePreviews = []; 
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
    roomImagePreviewDiv.innerHTML = "";

    // Render existing images (fetch data, add remove button)
    const existingImagePromises = existingImagePreviews.map(async (imgInfo) => {
      if (imagesToDeleteIds.includes(imgInfo.id)) return null; // Skip if marked for deletion
      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png";
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
        console.error(`Error fetching image ${imgInfo.id}:`, error);
      }
      previewItem.innerHTML = `<img src="${imageSrc}" alt="Existing room image"><button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imgInfo.id}" title="Xóa ảnh này">×</button>`;
      return previewItem;
    });
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );
    existingItems.forEach((previewItem) => {
      roomImagePreviewDiv.appendChild(previewItem);
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        // Attach listener AFTER appending
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
          // Attach listener BEFORE appending
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
              console.warn(
                "Invalid index found for new image removal:",
                indexToRemove
              );
              renderImagePreviews(); // Re-render just in case
            }
          });
        }
        roomImagePreviewDiv.appendChild(newPreviewItem); // Append AFTER attaching listener
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images are present
    if (roomImagePreviewDiv.childElementCount === 0) {
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

    // Reset state before fetching
    currentRoomData = null;
    existingImagePreviews = [];
    newImageFiles = [];
    imagesToDeleteIds = [];

    // Show loading states
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
    if (editRoomForm) editRoomForm.style.display = "block"; // Ensure form is visible

    try {
      // Fetch data concurrently
      const [roomDetails, amenities, utilities] = await Promise.all([
        RoomService.getRoomById(currentRoomId),
        AmenityService.getAllAmenities(),
        UtilityService.getAllUtilities()
      ]);

      // Store fetched data globally
      currentRoomData = roomDetails;
      allAmenities = amenities || [];
      allUtilities = utilities || [];
      existingImagePreviews =
        currentRoomData.images?.map((img) => ({
          id: typeof img === "string" ? img : img._id
        })) || [];

      // Populate UI elements
      populateFormFieldsBasicInfo();
      renderAmenitiesChecklist();
      renderUtilitiesChecklist();
      await renderImagePreviews(); // Wait for images to render

      if (editRoomForm) editRoomForm.classList.remove("was-validated"); // Clear validation state
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Unknown error"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu phòng: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editRoomForm) editRoomForm.style.display = "none"; // Hide form on critical load error
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
    renderImagePreviews(); // Re-render previews including new ones
    event.target.value = null; // Allow re-selecting same file
  }

  // Function: Handles the form submission for saving changes.
  async function handleSaveChanges() {
    hideModalFeedback();

    // Validate form inputs
    if (!editRoomForm || !editRoomForm.checkValidity()) {
      if (editRoomForm) editRoomForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return;
    }
    if (editRoomForm) editRoomForm.classList.add("was-validated"); // Ensure styles shown

    // Check essential data exists
    if (!currentRoomId || !currentRoomData) {
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu phòng hiện tại.",
        "danger"
      );
      return;
    }

    // Disable button, show spinner
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = []; // To collect errors from multiple API calls

    try {
      // Collect current data from form
      const updatedBasicData = {
        /* ... collect basic info ... */
        roomNumber: roomNumberInput.value.trim(),
        address: roomAddressInput.value.trim(),
        rentPrice: parseInt(roomRentPriceInput.value, 10) || 0,
        occupantsNumber: parseInt(roomOccupantsNumberInput.value, 10) || 1,
        status: roomStatusSelect.value,
        description: roomDescriptionInput.value.trim()
      };
      const currentAmenityIds =
        new Set(/* ... collect checked amenity IDs ... */);
      roomAmenitiesListDiv
        ?.querySelectorAll('input[type="checkbox"]:checked')
        .forEach((cb) => currentAmenityIds.add(cb.value));
      const currentUtilityIds =
        new Set(/* ... collect checked utility IDs ... */);
      roomUtilitiesListDiv
        ?.querySelectorAll('input[type="checkbox"]:checked')
        .forEach((cb) => currentUtilityIds.add(cb.value));

      // Compare with initial data to determine changes
      let basicDataChanged = false; /* ... compare updatedBasicData with currentRoomData ... */
      const initialBasicData = currentRoomData;
      for (const key in updatedBasicData) {
        if (key === "description") {
          if ((updatedBasicData[key] || "") !== (initialBasicData[key] || "")) {
            basicDataChanged = true;
            break;
          }
        } else if (
          String(updatedBasicData[key]) !== String(initialBasicData[key])
        ) {
          basicDataChanged = true;
          break;
        }
      }

      const initialAmenityIds = new Set(/* ... get initial amenity IDs ... */);
      currentRoomData.amenities?.forEach((a) =>
        initialAmenityIds.add(typeof a === "string" ? a : a._id)
      );
      const amenitiesToAdd = [...currentAmenityIds].filter(
        (id) => !initialAmenityIds.has(id)
      );
      const amenitiesToDelete = [...initialAmenityIds].filter(
        (id) => !currentAmenityIds.has(id)
      );

      const initialUtilityIds = new Set(/* ... get initial utility IDs ... */);
      currentRoomData.utilities?.forEach((u) =>
        initialUtilityIds.add(typeof u === "string" ? u : u._id)
      );
      const utilitiesToAdd = [...currentUtilityIds].filter(
        (id) => !initialUtilityIds.has(id)
      );
      const utilitiesToDelete = [...initialUtilityIds].filter(
        (id) => !currentUtilityIds.has(id)
      );

      // Build array of API call promises based on changes detected
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          RoomService.updateRoom(currentRoomId, updatedBasicData).catch(
            (err) => {
              errors.push(`Lỗi cập nhật cơ bản: ${err.message}`);
              throw err;
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
            errors.push(`Lỗi xóa tiện nghi: ${err.message}`);
            throw err;
          })
        );
      }
      if (amenitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addAmenitiesToRoom(currentRoomId, amenitiesToAdd).catch(
            (err) => {
              errors.push(`Lỗi thêm tiện nghi: ${err.message}`);
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
            errors.push(`Lỗi xóa tiện ích: ${err.message}`);
            throw err;
          })
        );
      }
      if (utilitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addUtilitiesToRoom(currentRoomId, utilitiesToAdd).catch(
            (err) => {
              errors.push(`Lỗi thêm tiện ích: ${err.message}`);
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
            errors.push(`Lỗi xóa hình ảnh: ${err.message}`);
            throw err;
          })
        );
      }
      if (newImageFiles.length > 0) {
        apiCalls.push(
          RoomService.addImagesToRoom(currentRoomId, newImageFiles).catch(
            (err) => {
              errors.push(`Lỗi thêm hình ảnh mới: ${err.message}`);
              throw err;
            }
          )
        );
      }

      // Execute API calls if changes were made
      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        showModalFeedback("Cập nhật phòng thành công!", "success");
        // Refresh data after a short delay
        setTimeout(async () => {
          try {
            await fetchAndRenderUiRoomDetails(); // Re-fetch and re-render
          } catch (fetchError) {
            console.error("Error refreshing data after update:", fetchError);
            const fetchErrMsg = (
              fetchError.message || "Unknown error"
            ).toString();
            showModalFeedback(
              `Cập nhật thành công, nhưng lỗi khi tải lại dữ liệu: ${
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
      console.error("Error during save process:", error);
      const errorMessage =
        errors.length > 0
          ? errors.join("; ")
          : `Đã xảy ra lỗi: ${
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
