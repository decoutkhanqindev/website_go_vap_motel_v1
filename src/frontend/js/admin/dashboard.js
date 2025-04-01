import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Rooms Tab ---
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 10;
let currentRoomData = [];
let selectedRoomImageFiles = [];

// --- State for Amenities and Utilities Tab ---
let currentAmenityData = [];
let selectedAmenityImageFiles = [];
let currentUtilityData = [];
let selectedUtilityImageFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: General Navigation & Content Areas ---
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // --- Selectors: Rooms Tab UI ---
  const roomTableBody = document.getElementById("roomTableBody");
  const paginationContainer = document.querySelector(".pagination");
  const statusFilterSelect = document.getElementById("statusFilter");
  const priceRangeInput = document.getElementById("priceRange");
  const minPriceSpan = document.getElementById("minPrice");
  const maxPriceSpan = document.getElementById("maxPrice"); // Note: Currently unused for display
  const addressFilterSelect = document.getElementById("addressFilter");
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");
  const maxOccupantNumberSpan = document.getElementById("maxOccupantNumber"); // Note: Currently unused for display
  const applyFiltersButton = document.getElementById("applyFilters");
  const addNewRoomButton = document.getElementById("addNewRoomBtn");
  // Add New Room Modal 
  const addNewRoomModalElement = document.getElementById("addNewRoomModal");
  const addRoomForm = document.getElementById("addRoomForm");
  const newRoomNumberInput = document.getElementById("newRoomNumber");
  const newRoomAddressInput = document.getElementById("newRoomAddress");
  const newRoomRentPriceInput = document.getElementById("newRoomRentPrice");
  const newRoomOccupantsNumberInput = document.getElementById(
    "newRoomOccupantsNumber"
  );
  const newRoomStatusSelect = document.getElementById("newRoomStatus");
  const newRoomDescriptionInput = document.getElementById("newRoomDescription");
  const newRoomAmenitiesListDiv = document.getElementById(
    "newRoomAmenitiesList"
  );
  const newRoomUtilitiesListDiv = document.getElementById(
    "newRoomUtilitiesList"
  );
  const newRoomImagesInput = document.getElementById("newRoomImagesInput");
  const selectRoomImagesBtn = document.getElementById("selectRoomImagesBtn");
  const newRoomImagePreviewDiv = document.getElementById("newRoomImagePreview");
  const saveNewRoomBtn = document.getElementById("saveNewRoomBtn");
  const addRoomModalFeedbackDiv = document.getElementById(
    "addRoomModalFeedback"
  );
  const saveNewRoomSpinner = saveNewRoomBtn?.querySelector(".spinner-border");

  // --- Selectors: Amenities and Utilities Tab UI ---
  const amenityTableBody = document.getElementById("amenityTableBody");
  const utilityTableBody = document.getElementById("utilityTableBody");
  // Amenity Modal
  const addNewAmenityModalElement =
    document.getElementById("addNewAmenityModal");
  const addAmenityForm = document.getElementById("addAmenityForm");
  const newAmenityNameInput = document.getElementById("newAmenityName");
  const newAmenityPriceInput = document.getElementById("newAmenityPrice");
  const newAmenityImagesInput = document.getElementById(
    "newAmenityImagesInput"
  );
  const selectAmenityImagesBtn = document.getElementById(
    "selectAmenityImagesBtn"
  );
  const newAmenityImagePreviewDiv = document.getElementById(
    "newAmenityImagePreview"
  );
  const saveNewAmenityBtn = document.getElementById("saveNewAmenityBtn");
  const addAmenityModalFeedbackDiv = document.getElementById(
    "addAmenityModalFeedback"
  );
  const saveNewAmenitySpinner =
    saveNewAmenityBtn?.querySelector(".spinner-border");
  const addNewAmenityButton = document.getElementById("addNewAmenityBtn");
  // Utility Modal
  const addNewUtilityModalElement =
    document.getElementById("addNewUtilityModal");
  const addUtilityForm = document.getElementById("addUtilityForm");
  const newUtilityNameInput = document.getElementById("newUtilityName");
  const newUtilityPriceInput = document.getElementById("newUtilityPrice");
  const newUtilityImagesInput = document.getElementById(
    "newUtilityImagesInput"
  );
  const selectUtilityImagesBtn = document.getElementById(
    "selectUtilityImagesBtn"
  );
  const newUtilityImagePreviewDiv = document.getElementById(
    "newUtilityImagePreview"
  );
  const saveNewUtilityBtn = document.getElementById("saveNewUtilityBtn");
  const addUtilityModalFeedbackDiv = document.getElementById(
    "addUtilityModalFeedback"
  );
  const saveNewUtilitySpinner =
    saveNewUtilityBtn?.querySelector(".spinner-border");
  const addNewUtilityButton = document.getElementById("addNewUtilityBtn");

  // --- Initialize Bootstrap Modals ---
  const addNewRoomModal = addNewRoomModalElement
    ? new bootstrap.Modal(addNewRoomModalElement)
    : null;
  const addNewAmenityModal = addNewAmenityModalElement
    ? new bootstrap.Modal(addNewAmenityModalElement)
    : null;
  const addNewUtilityModal = addNewUtilityModalElement
    ? new bootstrap.Modal(addNewUtilityModalElement)
    : null;

  // --- Core UI Functions ---

  // Function: Manages displaying content sections based on navigation clicks
  function showContent(targetId) {
    contentDivs.forEach((div) => (div.style.display = "none"));
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    }
    navItems.forEach((item) => item.classList.remove("active-menu-item"));
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // Function: Displays feedback messages within modals
  function showModalFeedback(feedbackElementId, message, type = "danger") {
    const feedbackDiv = document.getElementById(feedbackElementId);
    if (feedbackDiv) {
      feedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      feedbackDiv.className = `alert alert-${type} mt-3`;
      feedbackDiv.style.display = "block";
      feedbackDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Function: Hides feedback messages within modals
  function hideModalFeedback(feedbackElementId) {
    const feedbackDiv = document.getElementById(feedbackElementId);
    if (feedbackDiv) {
      feedbackDiv.style.display = "none";
      feedbackDiv.textContent = "";
      feedbackDiv.className = "alert";
    }
  }

  // --- Rooms Tab: Data Fetching & Filtering Logic ---

  // Function: Populates the address filter dropdown with unique addresses
  async function populateAddressFilter() {
    if (!addressFilterSelect) return;
    while (addressFilterSelect.options.length > 1) {
      addressFilterSelect.remove(1);
    }
    try {
      const allRooms = await RoomService.getAllRooms({});
      const allAddresses = allRooms.map((room) => room.address).filter(Boolean);
      const uniqueAddresses = [...new Set(allAddresses)];
      uniqueAddresses.forEach((addr) => {
        const option = document.createElement("option");
        option.value = addr;
        option.textContent = addr;
        addressFilterSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      const errorOption = document.createElement("option");
      errorOption.textContent = "Lỗi tải địa chỉ";
      errorOption.disabled = true;
      addressFilterSelect.appendChild(errorOption);
    }
  }

  // Function: Fetches room data based on filters and triggers UI rendering
  async function fetchAndRenderUiForRoomsTab() {
    if (roomTableBody) {
      roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu...</td></tr>`;
    }
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
    try {
      // Get filter values
      const status = statusFilterSelect ? statusFilterSelect.value : "all";
      const minPrice = priceRangeInput ? priceRangeInput.value : "0";
      const maxPrice = priceRangeInput
        ? priceRangeInput.getAttribute("max")
        : "5000000";
      const address = addressFilterSelect ? addressFilterSelect.value : "all";
      const minOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.value
        : "0";
      const maxOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.getAttribute("max")
        : "5";

      // Build filter object
      const filter = {};
      if (status !== "all") filter.status = status;
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice;
      }
      if (address !== "all") filter.address = address;
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant;
      }

      // Fetch rooms
      const rooms = await RoomService.getAllRooms(filter);
      currentRoomData = rooms;
      totalRooms = rooms.length;

      // Render UI
      renderRoomTableUIRoomsTab();
    } catch (error) {
      console.error(error);
      if (roomTableBody) {
        roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu.</td></tr>`;
      }
    }
  }

  // --- Rooms Tab: UI Rendering Logic ---

  // Function: Renders the room table based on current data and pagination
  function renderRoomTableUIRoomsTab() {
    if (!roomTableBody) return;
    roomTableBody.innerHTML = "";

    if (currentRoomData.length === 0) {
      roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy phòng nào phù hợp.</td></tr>`;
      renderPaginationUI();
      return;
    }

    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = Math.min(startIndex + roomsPerPage, totalRooms);
    const roomsToDisplay = currentRoomData.slice(startIndex, endIndex);

    roomsToDisplay.forEach((room, index) => {
      const row = document.createElement("tr");
      row.dataset.id = room._id;

      let statusText = "Không xác định";
      let statusClass = "status-unavailable";
      if (room.status === "vacant") {
        statusText = "Trống";
        statusClass = "status-vacant";
      } else if (room.status === "occupied") {
        statusText = "Đã thuê";
        statusClass = "status-occupied";
      } else if (room.status === "unavailable") {
        statusText = "Không có sẵn";
        statusClass = "status-unavailable";
      }

      row.innerHTML = `
        <td>${startIndex + index + 1}</td>
        <td>${room.roomNumber || "N/A"}</td>
        <td>${room.address || "N/A"}</td>
        <td class="text-end">${
          room.rentPrice ? room.rentPrice.toLocaleString("vi-VN") : "N/A"
        }</td>
        <td class="text-center">${room.occupantsNumber || "N/A"}</td>
        <td class="text-center">
            <span class="${statusClass}">${statusText}</span>
        </td>
        <td class="text-center action-cell">
             <button class="btn btn-sm btn-danger delete-room-btn" data-id="${
               room._id
             }">Xóa</button>
        </td>
      `;

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) {
          return;
        }
        window.location.href = `/admin/room/details/${room._id}`;
      });

      roomTableBody.appendChild(row);
    });

    renderPaginationUI();
  }

  // Function: Renders pagination controls for the room table
  function renderPaginationUI() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    if (totalPages <= 1) {
      return;
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === currentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#";
      pageNumberLink.textContent = i;

      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== currentPage) {
          currentPage = i;
          renderRoomTableUIRoomsTab();
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Rooms Tab: Delete Room Logic ---
  async function handleDeleteRoom(roomId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa phòng này không?"
    );
    if (!confirmed) return;

    const deleteButton = roomTableBody?.querySelector(
      `.delete-room-btn[data-id="${roomId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await RoomService.deleteRoom(roomId);

      const totalPagesAfterDeletion = Math.ceil(
        (totalRooms - 1) / roomsPerPage
      );
      if (
        currentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        currentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        currentPage = 1;
      }
      await fetchAndRenderUiForRoomsTab();
      // Consider adding toast notification for success
    } catch (error) {
      console.error(error);
      const errorMsg = (error.message || "Lỗi chưa rõ").toString();
      alert(
        `Lỗi khi xóa phòng: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Rooms Tab: Add New Room Modal Logic ---

  // Function: Loads amenities into the 'Add Room' modal checkboxes
  async function loadAmenitiesForModal() {
    if (!newRoomAmenitiesListDiv) return;
    newRoomAmenitiesListDiv.innerHTML =
      '<p class="text-muted">Đang tải tiện nghi...</p>';
    try {
      const amenities = await AmenityService.getAllAmenities();
      newRoomAmenitiesListDiv.innerHTML = "";
      if (amenities && amenities.length > 0) {
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
        amenities.forEach((amenity) => {
          const div = document.createElement("div");
          div.classList.add("form-check");
          const amenityName =
            amenityNameMap[amenity.name] ||
            (amenity.name
              ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
              : "Tiện nghi");
          div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${amenity._id}" id="amenity-${amenity._id}" name="newRoomAmenities">
            <label class="form-check-label" for="amenity-${amenity._id}">${amenityName}</label>
          `;
          newRoomAmenitiesListDiv.appendChild(div);
        });
      } else {
        newRoomAmenitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện nghi nào.</p>';
      }
    } catch (error) {
      console.error(error);
      newRoomAmenitiesListDiv.innerHTML =
        '<p class="text-danger">Lỗi tải tiện nghi.</p>';
    }
  }

  // Function: Loads utilities into the 'Add Room' modal checkboxes
  async function loadUtilitiesForModal() {
    if (!newRoomUtilitiesListDiv) return;
    newRoomUtilitiesListDiv.innerHTML =
      '<p class="text-muted">Đang tải tiện ích...</p>';
    try {
      const utilities = await UtilityService.getAllUtilities();
      newRoomUtilitiesListDiv.innerHTML = "";
      if (utilities && utilities.length > 0) {
        const utilityNameMap = {
          // Optional: Map for friendly names
          wifi: "Wifi",
          parking: "Đỗ xe",
          cleaning: "Vệ sinh hàng tuần"
        };
        utilities.forEach((utility) => {
          const div = document.createElement("div");
          div.classList.add("form-check");
          const utilityName =
            utilityNameMap[utility.name] ||
            (utility.name
              ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
              : "Tiện ích");
          div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${utility._id}" id="utility-${utility._id}" name="newRoomUtilities">
            <label class="form-check-label" for="utility-${utility._id}">${utilityName}</label>
          `;
          newRoomUtilitiesListDiv.appendChild(div);
        });
      } else {
        newRoomUtilitiesListDiv.innerHTML =
          '<p class="text-muted">Không có tiện ích nào.</p>';
      }
    } catch (error) {
      console.error(error);
      newRoomUtilitiesListDiv.innerHTML =
        '<p class="text-danger">Lỗi tải tiện ích.</p>';
    }
  }

  // Function: Renders previews of selected images in the 'Add Room' modal
  function renderImagePreviews() {
    if (!newRoomImagePreviewDiv) return;
    newRoomImagePreviewDiv.innerHTML = "";

    selectedRoomImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        previewItem.classList.add("image-preview-item");
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${file.name}">
          <button type="button" class="remove-image-btn" data-index="${index}" title="Xóa ảnh này">×</button>
        `;
        previewItem
          .querySelector(".remove-image-btn")
          .addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            selectedRoomImageFiles.splice(indexToRemove, 1);
            renderImagePreviews();
          });
        newRoomImagePreviewDiv.appendChild(previewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        const errorPreviewItem = document.createElement("div");
        errorPreviewItem.classList.add("image-preview-item", "text-danger");
        errorPreviewItem.textContent = `Lỗi đọc file: ${file.name}`;
        newRoomImagePreviewDiv.appendChild(errorPreviewItem);
      };
      reader.readAsDataURL(file);
    });

    if (selectedRoomImageFiles.length === 0) {
      newRoomImagePreviewDiv.innerHTML =
        '<p class="text-muted small">Chưa chọn ảnh nào.</p>';
    }
  }

  // Function: Handles new file selection for room images
  function handleImageSelection(event) {
    const files = Array.from(event.target.files);
    selectedRoomImageFiles.push(...files);
    renderImagePreviews();
    event.target.value = null;
  }

  // Function: Resets the 'Add Room' form to its default state
  function resetAddRoomForm() {
    if (addRoomForm) {
      addRoomForm.reset();
      addRoomForm.classList.remove("was-validated");
    }
    selectedRoomImageFiles = [];
    renderImagePreviews();
    document
      .querySelectorAll('#newRoomAmenitiesList input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    document
      .querySelectorAll('#newRoomUtilitiesList input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    hideModalFeedback("addRoomModalFeedback"); // Specify the feedback ID for this modal
  }

  // Function: Handles the submission of the 'Add New Room' form
  async function handleSaveNewRoom() {
    hideModalFeedback("addRoomModalFeedback"); // Specify the feedback ID

    if (!addRoomForm || !addRoomForm.checkValidity()) {
      if (addRoomForm) addRoomForm.classList.add("was-validated");
      showModalFeedback(
        "addRoomModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc.",
        "warning"
      ); // Specify the feedback ID
      return;
    }
    if (addRoomForm) addRoomForm.classList.add("was-validated");

    if (saveNewRoomBtn) saveNewRoomBtn.disabled = true;
    if (saveNewRoomSpinner) saveNewRoomSpinner.style.display = "inline-block";

    // Collect form data into FormData object
    const roomData = {
      roomNumber: newRoomNumberInput ? newRoomNumberInput.value.trim() : "",
      address: newRoomAddressInput ? newRoomAddressInput.value.trim() : "",
      rentPrice: newRoomRentPriceInput
        ? parseInt(newRoomRentPriceInput.value, 10)
        : 0,
      occupantsNumber: newRoomOccupantsNumberInput
        ? parseInt(newRoomOccupantsNumberInput.value, 10)
        : 1,
      status: newRoomStatusSelect ? newRoomStatusSelect.value : "vacant",
      description: newRoomDescriptionInput
        ? newRoomDescriptionInput.value.trim()
        : ""
    };
    const amenityIds = Array.from(
      document.querySelectorAll(
        '#newRoomAmenitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);
    const utilityIds = Array.from(
      document.querySelectorAll(
        '#newRoomUtilitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);

    const formData = new FormData();
    for (const key in roomData) {
      if (Object.hasOwnProperty.call(roomData, key)) {
        formData.append(key, roomData[key]);
      }
    }
    amenityIds.forEach((id) => formData.append("amenities", id));
    utilityIds.forEach((id) => formData.append("utilities", id));
    if (selectedRoomImageFiles) {
      selectedRoomImageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      // Call API
      await RoomService.addNewRoom(formData);
      showModalFeedback(
        "addRoomModalFeedback",
        "Thêm phòng thành công!",
        "success"
      ); // Specify the feedback ID
      await fetchAndRenderUiForRoomsTab(); // Refresh table
      setTimeout(() => {
        if (addNewRoomModal) addNewRoomModal.hide();
        // Reset is handled by hidden.bs.modal listener
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm phòng"
      ).toString();
      showModalFeedback(
        // Specify the feedback ID
        "addRoomModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewRoomBtn) saveNewRoomBtn.disabled = false;
      if (saveNewRoomSpinner) saveNewRoomSpinner.style.display = "none";
    }
  }

  // --- Amenities and Utilities Tab: Data Fetching Logic ---

  // Function: Fetches and renders the amenities table
  async function fetchAndRenderUiForAmenitiesTab() {
    if (amenityTableBody) {
      amenityTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Đang tải dữ liệu...</td></tr>`; // Adjusted colspan
    }
    try {
      const amenities = await AmenityService.getAllAmenities();
      currentAmenityData = amenities;
      renderAmenityTableUI();
    } catch (error) {
      console.error(error);
      if (amenityTableBody) {
        amenityTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi khi tải dữ liệu tiện nghi.</td></tr>`; // Adjusted colspan
      }
    }
  }

  // Function: Fetches and renders the utilities table
  async function fetchAndRenderUiForUtilitiesTab() {
    if (utilityTableBody) {
      utilityTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Đang tải dữ liệu...</td></tr>`; // Adjusted colspan
    }
    try {
      const utilities = await UtilityService.getAllUtilities();
      currentUtilityData = utilities;
      renderUtilityTableUI();
    } catch (error) {
      console.error(error);
      if (utilityTableBody) {
        utilityTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi khi tải dữ liệu tiện ích.</td></tr>`; // Adjusted colspan
      }
    }
  }

  // --- Amenities and Utilities Tab: UI Rendering Logic ---

  // Function: Renders the amenity table based on current data
  function renderAmenityTableUI() {
    if (!amenityTableBody) return;
    amenityTableBody.innerHTML = "";

    if (currentAmenityData.length === 0) {
      amenityTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Không tìm thấy tiện nghi nào.</td></tr>`; // Adjusted colspan
      return;
    }

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

    currentAmenityData.forEach((amenity, index) => {
      const row = document.createElement("tr");
      row.dataset.id = amenity._id;
      const displayName =
        amenityNameMap[amenity.name] ||
        (amenity.name
          ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
          : "N/A");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${displayName}</td>
        <td class="text-end">${
          amenity.price ? amenity.price.toLocaleString("vi-VN") : "0"
        }</td>
        <td class="text-center action-cell">
             <button class="btn btn-sm btn-danger delete-amenity-btn" data-id="${
               amenity._id
             }">Xóa</button>
        </td>
      `;
      amenityTableBody.appendChild(row);
    });
  }

  // Function: Renders the utility table based on current data
  function renderUtilityTableUI() {
    if (!utilityTableBody) return;
    utilityTableBody.innerHTML = "";

    if (currentUtilityData.length === 0) {
      utilityTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Không tìm thấy tiện ích nào.</td></tr>`; // Adjusted colspan
      return;
    }

    const utilityNameMap = {
      // Optional: Map for friendly names
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };

    currentUtilityData.forEach((utility, index) => {
      const row = document.createElement("tr");
      row.dataset.id = utility._id;
      const displayName =
        utilityNameMap[utility.name] ||
        (utility.name
          ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
          : "N/A");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${displayName}</td>
        <td class="text-end">${
          utility.price ? utility.price.toLocaleString("vi-VN") : "0"
        }</td>
        <td class="text-center action-cell">
             <button class="btn btn-sm btn-danger delete-utility-btn" data-id="${
               utility._id
             }">Xóa</button>
        </td>
      `;
      utilityTableBody.appendChild(row);
    });
  }

  // --- Amenities and Utilities Tab: Add New Amenity Modal Logic ---

  // Function: Renders previews of selected images in the 'Add Amenity' modal
  function renderAmenityImagePreviews() {
    if (!newAmenityImagePreviewDiv) return;
    newAmenityImagePreviewDiv.innerHTML = "";

    selectedAmenityImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        previewItem.classList.add("image-preview-item");
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${file.name}">
          <button type="button" class="remove-image-btn" data-index="${index}" title="Xóa ảnh này">×</button>
        `;
        previewItem
          .querySelector(".remove-image-btn")
          .addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            selectedAmenityImageFiles.splice(indexToRemove, 1);
            renderAmenityImagePreviews();
          });
        newAmenityImagePreviewDiv.appendChild(previewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        const errorPreviewItem = document.createElement("div");
        errorPreviewItem.classList.add("image-preview-item", "text-danger");
        errorPreviewItem.textContent = `Lỗi đọc file: ${file.name}`;
        newAmenityImagePreviewDiv.appendChild(errorPreviewItem);
      };
      reader.readAsDataURL(file);
    });

    if (selectedAmenityImageFiles.length === 0) {
      newAmenityImagePreviewDiv.innerHTML =
        '<p class="text-muted small">Chưa chọn ảnh nào.</p>';
    }
  }

  // Function: Handles new file selection for amenity images
  function handleAmenityImageSelection(event) {
    const files = Array.from(event.target.files);
    selectedAmenityImageFiles.push(...files);
    renderAmenityImagePreviews();
    event.target.value = null;
  }

  // Function: Resets the 'Add Amenity' form
  function resetAddAmenityForm() {
    if (addAmenityForm) {
      addAmenityForm.reset();
      addAmenityForm.classList.remove("was-validated");
    }
    selectedAmenityImageFiles = [];
    renderAmenityImagePreviews();
    hideModalFeedback("addAmenityModalFeedback");
  }

  // Function: Handles the submission of the 'Add New Amenity' form (two-step: add data, then images)
  async function handleSaveNewAmenity() {
    hideModalFeedback("addAmenityModalFeedback");

    // Map Vietnamese input to English enum keys
    const vietnameseToEnglishAmenityMap = {
      giường: "bed",
      tủ_lạnh: "refrigerator",
      máy_lạnh: "air_conditioner",
      vòi_nước_nóng: "water_heater",
      bàn_ghế: "table_and_chairs",
      bếp_điện: "electric_stove",
      bếp_ga: "gas_stove"
    };

    // Validate form
    if (!addAmenityForm || !addAmenityForm.checkValidity()) {
      if (addAmenityForm) addAmenityForm.classList.add("was-validated");
      showModalFeedback(
        "addAmenityModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc.",
        "warning"
      );
      return;
    }
    if (addAmenityForm) addAmenityForm.classList.add("was-validated");

    // Validate and map amenity name
    const userInputNameNormalized = newAmenityNameInput
      ? newAmenityNameInput.value.trim().toLowerCase().replace(/\s+/g, "_")
      : "";
    const englishEnumKey =
      vietnameseToEnglishAmenityMap[userInputNameNormalized];
    if (!englishEnumKey) {
      showModalFeedback(
        "addAmenityModalFeedback",
        `Tên tiện nghi "${newAmenityNameInput.value}" không hợp lệ hoặc không được hỗ trợ.`,
        "danger"
      );
      return; // Stop if name is invalid
    }

    // UI feedback
    if (saveNewAmenityBtn) saveNewAmenityBtn.disabled = true;
    if (saveNewAmenitySpinner)
      saveNewAmenitySpinner.style.display = "inline-block";

    const amenityData = {
      name: englishEnumKey, // Use mapped English key
      price: newAmenityPriceInput ? parseInt(newAmenityPriceInput.value, 10) : 0
    };
    let newAmenityId = null;

    try {
      // Step 1: Add amenity data (no images)
      const addedAmenity = await AmenityService.addNewAmenity(amenityData);
      newAmenityId = addedAmenity._id;

      // Step 2: Upload images if amenity added successfully and images exist
      if (newAmenityId && selectedAmenityImageFiles.length > 0) {
        const imageFormData = new FormData();
        selectedAmenityImageFiles.forEach((file) => {
          imageFormData.append("images", file);
        });
        await AmenityService.addImagesToAmenity(newAmenityId, imageFormData);
      }

      // Success
      showModalFeedback(
        "addAmenityModalFeedback",
        "Thêm tiện nghi thành công!",
        "success"
      );
      await fetchAndRenderUiForAmenitiesTab(); // Refresh table
      setTimeout(() => {
        if (addNewAmenityModal) addNewAmenityModal.hide();
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm tiện nghi"
      ).toString();
      showModalFeedback(
        "addAmenityModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewAmenityBtn) saveNewAmenityBtn.disabled = false;
      if (saveNewAmenitySpinner) saveNewAmenitySpinner.style.display = "none";
    }
  }

  // --- Amenities and Utilities Tab: Delete Amenity Logic ---
  async function handleDeleteAmenity(amenityId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa tiện nghi này không?"
    );
    if (!confirmed) return;

    const deleteButton = amenityTableBody?.querySelector(
      `.delete-amenity-btn[data-id="${amenityId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await AmenityService.deleteAmenity(amenityId);
      await fetchAndRenderUiForAmenitiesTab(); // Refresh amenity table
      // Consider success toast
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể xóa tiện nghi"
      ).toString();
      alert(
        `Lỗi khi xóa tiện nghi: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Amenities and Utilities Tab: Add New Utility Modal Logic ---

  // Function: Renders previews of selected images in the 'Add Utility' modal
  function renderUtilityImagePreviews() {
    if (!newUtilityImagePreviewDiv) return;
    newUtilityImagePreviewDiv.innerHTML = "";

    selectedUtilityImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        previewItem.classList.add("image-preview-item");
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${file.name}">
            <button type="button" class="remove-image-btn" data-index="${index}" title="Xóa ảnh này">×</button>
        `;
        previewItem
          .querySelector(".remove-image-btn")
          .addEventListener("click", (event) => {
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            selectedUtilityImageFiles.splice(indexToRemove, 1);
            renderUtilityImagePreviews();
          });
        newUtilityImagePreviewDiv.appendChild(previewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        const errorPreviewItem = document.createElement("div");
        errorPreviewItem.classList.add("image-preview-item", "text-danger");
        errorPreviewItem.textContent = `Lỗi đọc file: ${file.name}`;
        newUtilityImagePreviewDiv.appendChild(errorPreviewItem);
      };
      reader.readAsDataURL(file);
    });

    if (selectedUtilityImageFiles.length === 0) {
      newUtilityImagePreviewDiv.innerHTML =
        '<p class="text-muted small">Chưa chọn ảnh nào.</p>';
    }
  }

  // Function: Handles new file selection for utility images
  function handleUtilityImageSelection(event) {
    const files = Array.from(event.target.files);
    selectedUtilityImageFiles.push(...files);
    renderUtilityImagePreviews();
    event.target.value = null;
  }

  // Function: Resets the 'Add Utility' form
  function resetAddUtilityForm() {
    if (addUtilityForm) {
      addUtilityForm.reset();
      addUtilityForm.classList.remove("was-validated");
    }
    selectedUtilityImageFiles = [];
    renderUtilityImagePreviews();
    hideModalFeedback("addUtilityModalFeedback");
  }

  // Function: Handles the submission of the 'Add New Utility' form (two-step: add data, then images)
  async function handleSaveNewUtility() {
    hideModalFeedback("addUtilityModalFeedback");

    // Map Vietnamese input to English enum keys
    const vietnameseToEnglishUtilityMap = {
      wifi: "wifi",
      đỗ_xe: "parking",
      vệ_sinh_hàng_tuần: "cleaning"
    };

    // Validate form
    if (!addUtilityForm || !addUtilityForm.checkValidity()) {
      if (addUtilityForm) addUtilityForm.classList.add("was-validated");
      showModalFeedback(
        "addUtilityModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc.",
        "warning"
      );
      return;
    }
    if (addUtilityForm) addUtilityForm.classList.add("was-validated");

    // Validate and map utility name
    const userInputNameNormalized = newUtilityNameInput
      ? newUtilityNameInput.value.trim().toLowerCase().replace(/\s+/g, "_")
      : "";
    const englishEnumKey =
      vietnameseToEnglishUtilityMap[userInputNameNormalized];
    if (!englishEnumKey) {
      showModalFeedback(
        "addUtilityModalFeedback",
        `Tên tiện ích "${newUtilityNameInput.value}" không hợp lệ hoặc không được hỗ trợ.`,
        "danger"
      );
      if (saveNewUtilityBtn) saveNewUtilityBtn.disabled = false; // Re-enable button if name is invalid
      if (saveNewUtilitySpinner) saveNewUtilitySpinner.style.display = "none";
      return; // Stop if name is invalid
    }

    // UI feedback
    if (saveNewUtilityBtn) saveNewUtilityBtn.disabled = true;
    if (saveNewUtilitySpinner)
      saveNewUtilitySpinner.style.display = "inline-block";

    const utilityData = {
      name: englishEnumKey, // Use mapped English key
      price: newUtilityPriceInput ? parseInt(newUtilityPriceInput.value, 10) : 0
    };
    let newUtilityId = null;

    try {
      // Step 1: Add utility data (no images)
      const addedUtility = await UtilityService.addNewUtility(utilityData);
      newUtilityId = addedUtility._id;

      // Step 2: Upload images if utility added successfully and images exist
      if (newUtilityId && selectedUtilityImageFiles.length > 0) {
        const imageFormData = new FormData();
        selectedUtilityImageFiles.forEach((file) => {
          imageFormData.append("images", file);
        });
        await UtilityService.addImagesToUtility(newUtilityId, imageFormData);
      }

      // Success
      showModalFeedback(
        "addUtilityModalFeedback",
        "Thêm tiện ích thành công!",
        "success"
      );
      await fetchAndRenderUiForUtilitiesTab(); // Refresh table
      setTimeout(() => {
        if (addNewUtilityModal) addNewUtilityModal.hide();
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm tiện ích"
      ).toString();
      showModalFeedback(
        "addUtilityModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewUtilityBtn) saveNewUtilityBtn.disabled = false;
      if (saveNewUtilitySpinner) saveNewUtilitySpinner.style.display = "none";
    }
  }

  // --- Amenities and Utilities Tab: Delete Utility Logic ---
  async function handleDeleteUtility(utilityId) {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa tiện ích này không?"
    );
    if (!confirmed) return;

    const deleteButton = utilityTableBody?.querySelector(
      `.delete-utility-btn[data-id="${utilityId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await UtilityService.deleteUtility(utilityId);
      await fetchAndRenderUiForUtilitiesTab(); // Refresh utility table
      // Consider success toast
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể xóa tiện ích"
      ).toString();
      alert(
        `Lỗi khi xóa tiện ích: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Event Listener Setup ---

  // Event Listeners: Navigation
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a");
    if (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const targetId = link.dataset.target;
        if (targetId) {
          showContent(targetId);
        }
      });
    }
  });

  // Event Listeners: Rooms Tab Filters & Actions
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      currentPage = 1;
      fetchAndRenderUiForRoomsTab();
    });
  }
  if (priceRangeInput && minPriceSpan) {
    priceRangeInput.addEventListener("input", () => {
      minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
        "vi-VN"
      );
    });
    minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
      "vi-VN"
    );
  }
  if (occupantNumberRangeInput && minOccupantNumberSpan) {
    occupantNumberRangeInput.addEventListener("input", () => {
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  }
  if (roomTableBody) {
    // Event delegation for delete button
    roomTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-room-btn");
      if (deleteButton) {
        event.stopPropagation();
        const roomId = deleteButton.dataset.id;
        if (roomId) {
          handleDeleteRoom(roomId);
        }
      }
    });
  }

  // Event Listeners: Add New Room Modal
  if (addNewRoomButton && addNewRoomModal) {
    addNewRoomButton.addEventListener("click", () => {
      resetAddRoomForm();
      Promise.all([loadAmenitiesForModal(), loadUtilitiesForModal()]) // Load data before showing
        .then(() => {
          addNewRoomModal.show();
        })
        .catch((error) => {
          console.error(error);
          showModalFeedback(
            "addRoomModalFeedback",
            "Lỗi tải dữ liệu cho biểu mẫu.",
            "danger"
          ); // Specify feedback ID
        });
    });
  }
  if (addNewRoomModalElement) {
    addNewRoomModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddRoomForm
    ); // Reset on close
  }
  if (selectRoomImagesBtn && newRoomImagesInput) {
    selectRoomImagesBtn.addEventListener("click", () =>
      newRoomImagesInput.click()
    );
  }
  if (newRoomImagesInput) {
    newRoomImagesInput.addEventListener("change", handleImageSelection);
  }
  if (saveNewRoomBtn) {
    saveNewRoomBtn.addEventListener("click", handleSaveNewRoom);
  }

  // Event Listeners: Amenities and Utilities Tab Actions
  if (amenityTableBody) {
    // Event delegation for amenity delete
    amenityTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-amenity-btn");
      if (deleteButton) {
        event.stopPropagation();
        const amenityId = deleteButton.dataset.id;
        if (amenityId) {
          handleDeleteAmenity(amenityId);
        }
      }
    });
  }
  if (utilityTableBody) {
    // Event delegation for utility delete
    utilityTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-utility-btn");
      if (deleteButton) {
        event.stopPropagation();
        const utilityId = deleteButton.dataset.id;
        if (utilityId) {
          handleDeleteUtility(utilityId);
        }
      }
    });
  }

  // Event Listeners: Add New Amenity Modal
  if (addNewAmenityButton && addNewAmenityModal) {
    addNewAmenityButton.addEventListener("click", () => {
      resetAddAmenityForm();
      addNewAmenityModal.show();
    });
  }
  if (addNewAmenityModalElement) {
    addNewAmenityModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddAmenityForm
    );
  }
  if (selectAmenityImagesBtn && newAmenityImagesInput) {
    selectAmenityImagesBtn.addEventListener("click", () =>
      newAmenityImagesInput.click()
    );
  }
  if (newAmenityImagesInput) {
    newAmenityImagesInput.addEventListener(
      "change",
      handleAmenityImageSelection
    );
  }
  if (saveNewAmenityBtn) {
    saveNewAmenityBtn.addEventListener("click", handleSaveNewAmenity);
  }

  // Event Listeners: Add New Utility Modal
  if (addNewUtilityButton && addNewUtilityModal) {
    addNewUtilityButton.addEventListener("click", () => {
      resetAddUtilityForm();
      addNewUtilityModal.show();
    });
  }
  if (addNewUtilityModalElement) {
    addNewUtilityModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddUtilityForm
    );
  }
  if (selectUtilityImagesBtn && newUtilityImagesInput) {
    selectUtilityImagesBtn.addEventListener("click", () =>
      newUtilityImagesInput.click()
    );
  }
  if (newUtilityImagesInput) {
    newUtilityImagesInput.addEventListener(
      "change",
      handleUtilityImageSelection
    );
  }
  if (saveNewUtilityBtn) {
    saveNewUtilityBtn.addEventListener("click", handleSaveNewUtility);
  }

  // --- Initial Page Load Logic ---
  async function initializePage() {
    showContent("rooms-tab-container"); // Default tab
    
    await populateAddressFilter(); // Populate room filters
    await fetchAndRenderUiForRoomsTab(); // Initial room data load
    await fetchAndRenderUiForAmenitiesTab(); // Initial amenity data load
    await fetchAndRenderUiForUtilitiesTab(); // Initial utility data load
  }

  initializePage(); // Execute initialization
});
