import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";
import ContractService from "../services/ContractService.js";
import InvoiceService from "../services/InvoiceService.js";

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

// --- Store mapping for Amenity name ---
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

// --- Store mapping for Utiltiy name ---
const utilityNameMap = {
  // Optional: Map for friendly names
  wifi: "Wifi",
  parking: "Đỗ xe",
  cleaning: "Vệ sinh hàng tuần"
};

// --- State for Contracts Tab ---
let contractCurrentPage = 1;
let totalContracts = 0;
const contractsPerPage = 10;
let currentContractData = [];
let vacantRoomsData = [];
let allAmenitiesData = [];
let allUtilitiesData = [];
let baseContractDeposit = 0;
let allRoomsForFilter = [];

// --- State for Invoices Tab ---
let invoiceCurrentPage = 1;
let totalInvoices = 0;
const invoicesPerPage = 10;
let currentInvoiceData = [];
let allOccupiedRoomsForInvoiceFilter = [];
let activeContractUtilities = [];
let activeContractRentPrice = 0;

// --- Store mapping for Payment Method name ---
const paymentMethodMap = {
  all: "Tất cả",
  cash: "Tiền mặt",
  banking: "Chuyển khoản"
};

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

  // --- Selectors: Contracts Tab UI ---
  const contractTableBody = document.getElementById("contractTableBody");
  const contractPaginationContainer =
    document.getElementById("contractPagination");
  const searchContractInput = document.getElementById("searchContractInput");
  const searchContractsBtn = document.getElementById("searchContractsBtn");
  const contractRoomFilterSelect =
    document.getElementById("contractRoomFilter");
  const contractStartDateFilter = document.getElementById(
    "contractStartDateFilter"
  );
  const contractEndDateFilter = document.getElementById(
    "contractEndDateFilter"
  );
  const contractStatusFilter = document.getElementById("contractStatusFilter");
  const applyContractFiltersBtn = document.getElementById(
    "applyContractFilters"
  );
  const addNewContractBtn = document.getElementById("addNewContractBtn");
  // Add New Contract Modal
  const addNewContractModalElement = document.getElementById(
    "addNewContractModal"
  );
  const addContractForm = document.getElementById("addContractForm");
  const newContractRoomIdSelect = document.getElementById("newContractRoomId");
  const newContractStartDateInput = document.getElementById(
    "newContractStartDate"
  );
  const newContractEndDateInput = document.getElementById("newContractEndDate");
  const newContractRentPriceInput = document.getElementById(
    "newContractRentPrice"
  );
  const newContractDepositInput = document.getElementById("newContractDeposit");
  const saveNewContractBtn = document.getElementById("saveNewContractBtn");
  const addContractModalFeedbackDiv = document.getElementById(
    "addContractModalFeedback"
  );
  const saveNewContractSpinner =
    saveNewContractBtn?.querySelector(".spinner-border");
  const roomSelectLoadingDiv = document.getElementById("roomSelectLoading"); // Loading indicator for room dropdown
  const newContractAmenitiesListDiv = document.getElementById(
    "newContractAmenitiesList"
  );
  const newContractUtilitiesListDiv = document.getElementById(
    "newContractUtilitiesList"
  );

  // --- Selectors: Invoices Tab UI ---
  const invoiceTableBody = document.getElementById("invoiceTableBody");
  const invoicePaginationContainer =
    document.getElementById("invoicePagination");
  const searchInvoiceInput = document.getElementById("searchInvoiceInput");
  const searchInvoiceBtn = document.getElementById("searchInvoiceBtn"); // Corrected ID from HTML
  const invoiceRoomFilterSelect = document.getElementById("invoiceRoomFilter");
  const invoiceIssueDateFilter = document.getElementById(
    "invoiceIssueDateFilter"
  );
  const invoiceDueDateFilter = document.getElementById("invoiceDueDateFilter");
  const invoicePaymentMethodFilter = document.getElementById(
    "invoicePaymentMethodFilter"
  );
  const invoicePaymentDateFilter = document.getElementById(
    "invoicePaymentDateFilter"
  );
  const invoicePaymentStatusFilter = document.getElementById(
    "invoicePaymentStatusFilter"
  );
  const applyInvoiceFiltersBtn = document.getElementById("applyInvoiceFilters");
  const addNewInvoiceBtn = document.getElementById("addNewInvoiceBtn");
  // Add New Invoice Modal
  const addNewInvoiceModalElement =
    document.getElementById("addNewInvoiceModal");
  const addInvoiceForm = document.getElementById("addInvoiceForm");
  const newInvoiceRoomIdSelect = document.getElementById("newInvoiceRoomId");
  const invoiceRoomSelectLoadingDiv = document.getElementById(
    "invoiceRoomSelectLoading"
  );
  const newInvoiceRentAmountInput = document.getElementById(
    "newInvoiceRentAmount"
  );
  const newInvoiceIssueDateInput = document.getElementById(
    "newInvoiceIssueDate"
  );
  const newInvoiceDueDateInput = document.getElementById("newInvoiceDueDate");
  const newInvoicePaymentMethodSelect = document.getElementById(
    "newInvoicePaymentMethod"
  );
  const newInvoiceElecOldIndexInput = document.getElementById(
    "newInvoiceElecOldIndex"
  );
  const newInvoiceElecNewIndexInput = document.getElementById(
    "newInvoiceElecNewIndex"
  );
  const newInvoiceElecPricePerUnitInput = document.getElementById(
    "newInvoiceElecPricePerUnit"
  );
  const newInvoiceWaterOldIndexInput = document.getElementById(
    "newInvoiceWaterOldIndex"
  );
  const newInvoiceWaterNewIndexInput = document.getElementById(
    "newInvoiceWaterNewIndex"
  );
  const newInvoiceWaterPricePerUnitInput = document.getElementById(
    "newInvoiceWaterPricePerUnit"
  );
  const newInvoiceUtilitiesListDiv = document.getElementById(
    "newInvoiceUtilitiesList"
  );
  const newInvoiceTotalAmountInput = document.getElementById(
    "newInvoiceTotalAmount"
  );
  const newInvoiceNotesInput = document.getElementById("newInvoiceNotes");
  const saveNewInvoiceBtn = document.getElementById("saveNewInvoiceBtn");
  const addInvoiceModalFeedbackDiv = document.getElementById(
    "addInvoiceModalFeedback"
  );
  const saveNewInvoiceSpinner =
    saveNewInvoiceBtn?.querySelector(".spinner-border");

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
  const addNewContractModal = addNewContractModalElement
    ? new bootstrap.Modal(addNewContractModalElement)
    : null;
  const addNewInvoiceModal = addNewInvoiceModalElement
    ? new bootstrap.Modal(addNewInvoiceModalElement)
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
        roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu phòng.</td></tr>`;
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

      const indexToRemove = currentRoomData.findIndex((r) => r._id === roomId);
      if (indexToRemove > -1) {
        currentRoomData.splice(indexToRemove, 1);
      }

      totalRooms = currentRoomData.length;

      const totalPagesAfterDeletion = Math.ceil(totalRooms / roomsPerPage);
      if (
        currentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        currentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        currentPage = 1;
      }

      renderRoomTableUIRoomsTab();
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      alert(
        `Lỗi khi xóa phòng: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
    } finally {
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
      status: "vacant",
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

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) {
          return;
        }
        window.location.href = `/admin/amenity/details/${amenity._id}`;
      });

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

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) {
          return;
        }
        window.location.href = `/admin/utility/details/${utility._id}`;
      });

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

  // --- Contracts Tab: Data Fetching & Filtering Logic ---

  // Function: Populates the room filter dropdown with all rooms.
  async function populateContractRoomFilterDropdown() {
    if (!contractRoomFilterSelect) return;

    contractRoomFilterSelect.innerHTML =
      '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Đang tải...</option>';
    contractRoomFilterSelect.disabled = true;

    try {
      // Fetch ALL rooms (not just vacant)
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      allRoomsForFilter = rooms; // Store globally if needed elsewhere, otherwise just use locally

      // Clear loading and add options
      contractRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option>';

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id; // Use room ID as value
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          contractRoomFilterSelect.appendChild(option);
        });
      } else {
        // Optionally add a message if no rooms exist at all
        // contractRoomFilterSelect.innerHTML += '<option value="" disabled>Không có phòng nào</option>';
      }
      contractRoomFilterSelect.disabled = false;
    } catch (error) {
      console.error("Error loading rooms for filter:", error);
      contractRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Lỗi tải phòng</option>';
    }
  }

  // Function: Fetches contract data based on filters/search and triggers UI rendering
  async function fetchAndRenderUiForContractsTab() {
    if (contractTableBody) {
      contractTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu hợp đồng...</td></tr>`;
    }
    if (contractPaginationContainer) {
      contractPaginationContainer.innerHTML = "";
    }

    try {
      // Get filter values
      const searchTerm = searchContractInput
        ? searchContractInput.value.trim()
        : "";
      const selectedRoomId = contractRoomFilterSelect
        ? contractRoomFilterSelect.value
        : "all";
      const startDate = contractStartDateFilter
        ? contractStartDateFilter.value
        : "";
      const endDate = contractEndDateFilter ? contractEndDateFilter.value : "";
      const status = contractStatusFilter ? contractStatusFilter.value : "all";

      // Build filter object
      const filter = {};
      if (searchTerm) filter.contractCode = searchTerm;
      if (selectedRoomId !== "all") filter.roomId = selectedRoomId;
      if (startDate) filter.startDate = startDate;
      if (endDate) filter.endDate = endDate;
      if (status !== "all") filter.status = status;

      // Fetch contracts with the updated filter object
      const allMatchingContracts = await ContractService.getAllContracts(
        filter
      );

      // Store and render
      currentContractData = allMatchingContracts || [];
      totalContracts = currentContractData.length;
      renderContractTableUI();
    } catch (error) {
      console.error(error);
      if (contractTableBody) {
        contractTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu hợp đồng</td></tr>`; // Sửa lại lỗi chính tả
      }
      currentContractData = [];
      totalContracts = 0;
      renderContractPaginationUI();
    }
  }

  // --- Contracts Tab: UI Rendering Logic ---

  // Function: Renders the contract table based on current data and pagination
  function renderContractTableUI() {
    if (!contractTableBody) return;
    contractTableBody.innerHTML = ""; // Clear previous rows

    // Check if there's any data in the full list
    if (currentContractData.length === 0) {
      contractTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy hợp đồng nào phù hợp.</td></tr>`;
      renderContractPaginationUI(); // Still render pagination (which will be empty)
      return;
    }

    // Calculate start and end index for the current page
    const startIndex = (contractCurrentPage - 1) * contractsPerPage;
    const endIndex = Math.min(startIndex + contractsPerPage, totalContracts); // Use totalContracts

    // Slice the data to get only the contracts for the current page
    const contractsToDisplay = currentContractData.slice(startIndex, endIndex);

    // Render only the contracts for the current page
    contractsToDisplay.forEach(async (contract, index) => {
      const row = document.createElement("tr");
      row.dataset.id = contract._id;

      // Calculate sequential number based on the start index of the page
      const sequentialNumber = startIndex + index + 1;

      const formattedStartDate = contract.startDate
        ? new Date(contract.startDate).toLocaleDateString("vi-VN")
        : "N/A";
      const formattedEndDate = contract.endDate
        ? new Date(contract.endDate).toLocaleDateString("vi-VN")
        : "N/A";

      const room = await RoomService.getRoomById(contract.roomId);

      let statusText = "Không xác định";
      let statusClass = "status-unknown";
      switch (contract.status) {
        case "active":
          statusText = "Còn hiệu lực";
          statusClass = "status-active";
          break;
        case "expired":
          statusText = "Hết hạn";
          statusClass = "status-expired";
          break;
        case "terminated":
          statusText = "Đã hủy";
          statusClass = "status-terminated";
          break;
      }

      row.innerHTML = `
        <td>${sequentialNumber}</td>
        <td>${contract.contractCode || "N/A"}</td>
        <td>P. ${room.roomNumber || "N/A"} - ĐC. ${room.address || "N/A"}</td>
        <td class="text-center">${formattedStartDate}</td>
        <td class="text-center">${formattedEndDate}</td>
        <td class="text-center">
          <span class="${statusClass}">${statusText}</span>
        </td>
        <td class="text-center action-cell">
          <button class="btn btn-sm btn-danger delete-contract-btn" data-id="${
            contract._id
          }">Xóa</button>
        </td>
      `;

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) return;
        window.location.href = `/admin/contract/details/${contract._id}`;
      });

      contractTableBody.appendChild(row);
    });

    // Render pagination controls after rendering the table rows
    renderContractPaginationUI();
  }

  // Function: Renders pagination controls for the contract table
  function renderContractPaginationUI() {
    if (!contractPaginationContainer) return;
    contractPaginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalContracts / contractsPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed for 0 or 1 page
    }

    // Create page number links
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === contractCurrentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#"; // Prevent default link behavior
      pageNumberLink.textContent = i;

      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== contractCurrentPage) {
          contractCurrentPage = i;
          renderContractTableUI();
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      contractPaginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Contracts Tab: Delete Contract Logic ---
  async function handleDeleteContract(contractId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa hợp đồng này không?"
    );
    if (!confirmed) return;

    const deleteButton = contractTableBody?.querySelector(
      `.delete-contract-btn[data-id="${contractId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";

    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await ContractService.deleteContract(contractId);

      const indexToRemove = currentContractData.findIndex(
        (c) => c._id === contractId
      );
      if (indexToRemove > -1) {
        currentContractData.splice(indexToRemove, 1);
      }

      totalContracts = currentContractData.length;

      const totalPagesAfterDeletion = Math.ceil(
        totalContracts / contractsPerPage
      );
      if (
        contractCurrentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        contractCurrentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        contractCurrentPage = 1; // Reset to page 1 if no contracts left
      }

      renderContractTableUI();
    } catch (error) {
      console.error("Error deleting contract:", error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể xóa hợp đồng"
      ).toString();
      alert(
        `Lỗi khi xóa hợp đồng: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
      // No need to re-render here on error, just restore the button
    } finally {
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Contracts Tab: Add New Contract Modal Logic ---

  // Function: Loads vaccant rooms into the 'Add Contract' modal checkboxes.
  async function loadVacantRoomsForModal() {
    if (!newContractRoomIdSelect || !roomSelectLoadingDiv) return;

    newContractRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    newContractRoomIdSelect.disabled = true;
    roomSelectLoadingDiv.style.display = "block"; // Show loading indicator

    try {
      // Fetch only vacant rooms
      const rooms = await RoomService.getAllRooms({ status: "vacant" });
      vacantRoomsData = rooms; // Store fetched data globally

      newContractRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>'; // Reset dropdown

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          // Store rent price directly on the option for easy access
          option.dataset.rentPrice = room.rentPrice || 0;
          newContractRoomIdSelect.appendChild(option);
        });
        newContractRoomIdSelect.disabled = false;
      } else {
        newContractRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng trống</option>';
      }
    } catch (error) {
      console.error(error);
      newContractRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      roomSelectLoadingDiv.style.display = "none"; // Hide loading indicator
    }
  }

  // Function: Loads amenities into the 'Add Contract' modal checkboxes.
  async function loadContractAmenitiesForModal() {
    if (!newContractAmenitiesListDiv) return;
    newContractAmenitiesListDiv.innerHTML =
      '<p class="text-muted small m-0">Đang tải tiện nghi...</p>';
    try {
      const amenities = await AmenityService.getAllAmenities();
      allAmenitiesData = amenities; // Store globally
      newContractAmenitiesListDiv.innerHTML = "";
      if (amenities && amenities.length > 0) {
        amenities.forEach((amenity) => {
          const div = document.createElement("div");
          div.classList.add("form-check", "form-check-sm"); // Smaller checks maybe
          const amenityName =
            amenityNameMap[amenity.name] ||
            (amenity.name
              ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
              : "Tiện nghi");
          div.innerHTML = `
                    <input class="form-check-input contract-amenity-checkbox" type="checkbox" value="${
                      amenity._id
                    }" id="contract-amenity-${amenity._id}" data-price="${
            amenity.price || 0
          }">
                    <label class="form-check-label" for="contract-amenity-${
                      amenity._id
                    }">${amenityName} (+${(amenity.price || 0).toLocaleString(
            "vi-VN"
          )} VNĐ)</label>
                `;
          newContractAmenitiesListDiv.appendChild(div);
        });
      } else {
        newContractAmenitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Không có tiện nghi nào.</p>';
      }
    } catch (error) {
      console.error(error);
      allAmenitiesData = []; // Clear on error
      newContractAmenitiesListDiv.innerHTML =
        '<p class="text-danger small m-0">Lỗi tải tiện nghi.</p>';
    }
  }

  // Function: Loads utilities into the 'Add Contract' modal checkboxes.
  async function loadContractUtilitiesForModal() {
    if (!newContractUtilitiesListDiv) return;
    newContractUtilitiesListDiv.innerHTML =
      '<p class="text-muted small m-0">Đang tải tiện ích...</p>';
    try {
      const utilities = await UtilityService.getAllUtilities();
      allUtilitiesData = utilities; // Store globally
      newContractUtilitiesListDiv.innerHTML = "";
      if (utilities && utilities.length > 0) {
        utilities.forEach((utility) => {
          const div = document.createElement("div");
          div.classList.add("form-check", "form-check-sm");
          const utilityName =
            utilityNameMap[utility.name] ||
            (utility.name
              ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
              : "Tiện ích");
          div.innerHTML = `
                    <input class="form-check-input contract-utility-checkbox" type="checkbox" value="${
                      utility._id
                    }" id="contract-utility-${utility._id}" data-price="${
            utility.price || 0
          }">
                    <label class="form-check-label" for="contract-utility-${
                      utility._id
                    }">${utilityName} (+${(utility.price || 0).toLocaleString(
            "vi-VN"
          )} VNĐ)</label>
                `;
          newContractUtilitiesListDiv.appendChild(div);
        });
      } else {
        newContractUtilitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Không có tiện ích nào.</p>';
      }
    } catch (error) {
      console.error(error);
      allUtilitiesData = []; // Clear on error
      newContractUtilitiesListDiv.innerHTML =
        '<p class="text-danger small m-0">Lỗi tải tiện ích.</p>';
    }
  }

  // Function :Updates the deposit amount based on selected room and checked amenities/utilities.
  function updateContractDeposit() {
    if (!newContractDepositInput) return;

    let totalDeposit = baseContractDeposit; // Start with the base deposit from the room

    // Add price of checked amenities
    const checkedAmenities =
      newContractAmenitiesListDiv?.querySelectorAll(
        ".contract-amenity-checkbox:checked"
      ) || [];
    checkedAmenities.forEach((checkbox) => {
      totalDeposit += parseFloat(checkbox.dataset.price || 0);
    });

    // // Add price of checked utilities
    // const checkedUtilities =
    //   newContractUtilitiesListDiv?.querySelectorAll(
    //     ".contract-utility-checkbox:checked"
    //   ) || [];
    // checkedUtilities.forEach((checkbox) => {
    //   totalDeposit += parseFloat(checkbox.dataset.price || 0);
    // });

    newContractDepositInput.value = totalDeposit;
  }

  // Function: Resets the 'Add Contract' form to its default state.
  function resetAddContractForm() {
    if (addContractForm) {
      addContractForm.reset();
      addContractForm.classList.remove("was-validated");
    }
    // Reset dropdown to initial state
    if (newContractRoomIdSelect) {
      newContractRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';
      newContractRoomIdSelect.disabled = true; // Disable until loaded again
    }
    if (newContractRentPriceInput) newContractRentPriceInput.value = "";
    if (newContractDepositInput) newContractDepositInput.value = "";
    baseContractDeposit = 0; // Reset base deposit

    // Clear and reset checkboxes
    if (newContractAmenitiesListDiv)
      newContractAmenitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Chọn phòng để tải tiện nghi...</p>';
    if (newContractUtilitiesListDiv)
      newContractUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Chọn phòng để tải tiện ích...</p>';

    hideModalFeedback("addContractModalFeedback");
  }

  // Function: Handles the submission of the 'Add New Contract' form.
  async function handleSaveNewContract() {
    hideModalFeedback("addContractModalFeedback");

    if (!addContractForm || !addContractForm.checkValidity()) {
      if (addContractForm) addContractForm.classList.add("was-validated");
      showModalFeedback(
        "addContractModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc và chọn phòng.",
        "warning"
      );
      return;
    }
    // Optional: Add date validation (end date >= start date)
    const startDate = newContractStartDateInput?.value;
    const endDate = newContractEndDateInput?.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      showModalFeedback(
        "addContractModalFeedback",
        "Ngày kết thúc không được trước ngày bắt đầu.",
        "warning"
      );
      return;
    }

    if (addContractForm) addContractForm.classList.add("was-validated");

    if (saveNewContractBtn) saveNewContractBtn.disabled = true;
    if (saveNewContractSpinner)
      saveNewContractSpinner.style.display = "inline-block";

    const amenityIds = Array.from(
      document.querySelectorAll(
        '#newContractAmenitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);
    const utilityIds = Array.from(
      document.querySelectorAll(
        '#newContractUtilitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);

    // Collect data
    const contractData = {
      roomId: newContractRoomIdSelect.value,
      startDate: newContractStartDateInput.value,
      endDate: newContractEndDateInput.value,
      rentPrice: parseInt(newContractRentPriceInput.value || 0, 10),
      deposit: parseInt(newContractDepositInput.value || 0, 10),
      amenities: amenityIds,
      utilities: utilityIds,
      status: "active"
    };

    try {
      await ContractService.addNewContract(contractData);
      showModalFeedback(
        "addContractModalFeedback",
        "Thêm hợp đồng thành công!",
        "success"
      );
      contractCurrentPage = 1; // Go to first page to see the new contract
      await fetchAndRenderUiForContractsTab(); // Refresh contract list
      setTimeout(() => {
        if (addNewContractModal) addNewContractModal.hide();
        // Reset is handled by hidden.bs.modal listener
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm hợp đồng"
      ).toString();
      showModalFeedback(
        "addContractModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewContractBtn) saveNewContractBtn.disabled = false;
      if (saveNewContractSpinner) saveNewContractSpinner.style.display = "none";
    }
  }

  // --- Invoices Tab: Data Fetching & Filtering Logic ---

  // Function: Populates the room filter dropdown for invoices (similar to contracts, might need adjustments based on needs)
  async function populateInvoiceRoomFilterDropdown() {
    if (!invoiceRoomFilterSelect) return;

    invoiceRoomFilterSelect.innerHTML =
      '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Đang tải...</option>';
    invoiceRoomFilterSelect.disabled = true;

    try {
      // Fetch rooms, potentially occupied ones or all depending on logic
      // Using occupied rooms similar to contract filter for now
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      allOccupiedRoomsForInvoiceFilter = rooms; // Store globally

      invoiceRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option>';

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id; // Use room ID as value
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          invoiceRoomFilterSelect.appendChild(option);
        });
      }
      invoiceRoomFilterSelect.disabled = false;
    } catch (error) {
      console.error("Error loading rooms for invoice filter:", error);
      invoiceRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Lỗi tải phòng</option>';
    }
  }

  // Function: Fetches invoice data based on filters/search and triggers UI rendering
  async function fetchAndRenderUiForInvoicesTab() {
    if (invoiceTableBody) {
      invoiceTableBody.innerHTML = `<tr><td colspan="9" class="text-center">Đang tải dữ liệu hóa đơn...</td></tr>`; // Updated colspan
    }
    if (invoicePaginationContainer) {
      invoicePaginationContainer.innerHTML = "";
    }

    try {
      // Get filter values
      const searchTerm = searchInvoiceInput
        ? searchInvoiceInput.value.trim()
        : "";
      const selectedRoomId = invoiceRoomFilterSelect
        ? invoiceRoomFilterSelect.value
        : "all";
      const issueDate = invoiceIssueDateFilter
        ? invoiceIssueDateFilter.value
        : "";
      const dueDate = invoiceDueDateFilter ? invoiceDueDateFilter.value : "";
      const paymentMethod = invoicePaymentMethodFilter
        ? invoicePaymentMethodFilter.value
        : "all";
      const paymentDate = invoicePaymentDateFilter
        ? invoicePaymentDateFilter.value
        : "";
      const paymentStatus = invoicePaymentStatusFilter
        ? invoicePaymentStatusFilter.value
        : "all";

      // Build filter object
      const filter = {};
      if (searchTerm) filter.invoiceCode = searchTerm; // Assuming search by invoiceCode
      if (selectedRoomId !== "all") filter.roomId = selectedRoomId;
      if (issueDate) filter.issueDate = issueDate;
      if (dueDate) filter.dueDate = dueDate;
      if (paymentMethod !== "all") filter.paymentMethod = paymentMethod;
      if (paymentDate) filter.paymentDate = paymentDate;
      if (paymentStatus !== "all") filter.paymentStatus = paymentStatus;

      // Fetch invoices with the filter object
      const allMatchingInvoices = await InvoiceService.getAllInvoices(filter);

      // Store and render
      currentInvoiceData = allMatchingInvoices || [];
      totalInvoices = currentInvoiceData.length;
      renderInvoiceTableUI(); // Call the function to render the table
    } catch (error) {
      console.error("Error fetching invoices:", error);
      if (invoiceTableBody) {
        invoiceTableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Lỗi khi tải dữ liệu hóa đơn.</td></tr>`; // Updated colspan
      }
      currentInvoiceData = [];
      totalInvoices = 0;
      renderInvoicePaginationUI(); // Render empty pagination on error
    }
  }

  // --- Invoices Tab: UI Rendering Logic ---

  // Function: Renders the invoice table based on current data and pagination
  async function renderInvoiceTableUI() {
    if (!invoiceTableBody) return;
    invoiceTableBody.innerHTML = ""; // Clear previous rows

    if (currentInvoiceData.length === 0) {
      invoiceTableBody.innerHTML = `<tr><td colspan="9" class="text-center">Không tìm thấy hóa đơn nào phù hợp.</td></tr>`; // Updated colspan
      renderInvoicePaginationUI();
      return;
    }

    // Calculate start and end index for the current page
    const startIndex = (invoiceCurrentPage - 1) * invoicesPerPage;
    const endIndex = Math.min(startIndex + invoicesPerPage, totalInvoices);
    const invoicesToDisplay = currentInvoiceData.slice(startIndex, endIndex);

    // Fetch room details for the invoices being displayed (can be optimized)
    const roomIds = [
      ...new Set(invoicesToDisplay.map((inv) => inv.roomId))
    ].filter(Boolean);
    const roomDetailsMap = new Map();
    if (roomIds.length > 0) {
      try {
        // In a real app, consider fetching these more efficiently, maybe one API call
        const roomPromises = roomIds.map((id) => RoomService.getRoomById(id));
        const roomResults = await Promise.allSettled(roomPromises);
        roomResults.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            roomDetailsMap.set(roomIds[index], result.value);
          }
        });
      } catch (roomError) {
        console.error("Error fetching room details for invoices:", roomError);
        // Handle error, maybe show placeholder room info
      }
    }

    invoicesToDisplay.forEach((invoice, index) => {
      const row = document.createElement("tr");
      row.dataset.id = invoice._id;
      const sequentialNumber = startIndex + index + 1;

      const roomInfo = roomDetailsMap.get(invoice.roomId);
      const roomDisplay = roomInfo
        ? `P. ${roomInfo.roomNumber || "N/A"} - ĐC. ${
            roomInfo.address || "N/A"
          }`
        : "Phòng không xác định";

      const formattedIssueDate = invoice.issueDate
        ? new Date(invoice.issueDate).toLocaleDateString("vi-VN")
        : "N/A";
      const formattedDueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("vi-VN")
        : "N/A";
      const formattedPaymentDate = invoice.paymentDate
        ? new Date(invoice.paymentDate).toLocaleDateString("vi-VN")
        : "Chưa thanh toán";

      const paymentMethodText =
        paymentMethodMap[invoice.paymentMethod] || "Không rõ";

      let statusText = "Không xác định";
      let statusClass = "status-unknown";
      switch (invoice.paymentStatus) {
        case "pending":
          statusText = "Đang chờ";
          statusClass = "status-pending";
          break;
        case "paid":
          statusText = "Đã thanh toán";
          statusClass = "status-paid";
          break;
        case "overdue":
          statusText = "Đã quá hạn";
          statusClass = "status-overdue";
          break;
      }

      row.innerHTML = `
        <td>${sequentialNumber}</td>
        <td>${invoice.invoiceCode || "N/A"}</td>
        <td>${roomDisplay}</td>
        <td class="text-center">${formattedIssueDate}</td>
        <td class="text-center">${formattedDueDate}</td>
        <td class="text-center">${paymentMethodText}</td>
        <td class="text-center">${formattedPaymentDate}</td>
        <td class="text-center">
            <span class="${statusClass}">${statusText}</span>
        </td>
        <td class="text-center action-cell">
            <button class="btn btn-sm btn-danger delete-invoice-btn" data-id="${
              invoice._id
            }">Xóa</button>
        </td>
      `;

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) return;
        window.location.href = `/admin/invoice/details/${invoice._id}`;
      });

      invoiceTableBody.appendChild(row);
    });

    renderInvoicePaginationUI(); // Render pagination controls
  }

  // Function: Renders pagination controls for the invoice table
  function renderInvoicePaginationUI() {
    if (!invoicePaginationContainer) return;
    invoicePaginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalInvoices / invoicesPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === invoiceCurrentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#";
      pageNumberLink.textContent = i;

      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== invoiceCurrentPage) {
          invoiceCurrentPage = i;
          renderInvoiceTableUI(); // Re-render the table for the new page
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      invoicePaginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Invoices Tab: Delete Invoice Logic ---
  async function handleDeleteInvoice(invoiceId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa hóa đơn này không?"
    );
    if (!confirmed) return;

    const deleteButton = invoiceTableBody?.querySelector(
      `.delete-invoice-btn[data-id="${invoiceId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";

    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await InvoiceService.deleteInvoice(invoiceId);

      // Remove from local data and update total
      const indexToRemove = currentInvoiceData.findIndex(
        (inv) => inv._id === invoiceId
      );
      if (indexToRemove > -1) {
        currentInvoiceData.splice(indexToRemove, 1);
      }
      totalInvoices = currentInvoiceData.length;

      // Adjust current page if necessary
      const totalPagesAfterDeletion = Math.ceil(
        totalInvoices / invoicesPerPage
      );
      if (
        invoiceCurrentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        invoiceCurrentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        invoiceCurrentPage = 1;
      }

      renderInvoiceTableUI(); // Re-render the table
      // Add success notification/toast if desired
    } catch (error) {
      console.error("Error deleting invoice:", error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể xóa hóa đơn"
      ).toString();
      alert(
        `Lỗi khi xóa hóa đơn: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
    } finally {
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Invoices Tab: Add New Invoice Modal Logic ---

  // Function: Calculates and updates the total amount in the modal.
  function calculateTotalAmount() {
    if (!newInvoiceTotalAmountInput) return;

    let total = 0;

    // 1. Rent Amount (Lấy từ giá hợp đồng đã lưu)
    total += activeContractRentPrice; // Sử dụng giá thuê từ hợp đồng

    // 2. Electricity Cost
    const elecOld = parseFloat(newInvoiceElecOldIndexInput?.value || 0);
    const elecNew = parseFloat(newInvoiceElecNewIndexInput?.value || 0);
    const elecPrice = parseFloat(newInvoiceElecPricePerUnitInput?.value || 0);
    if (elecNew >= elecOld && elecPrice > 0) {
      total += (elecNew - elecOld) * elecPrice;
    }

    // 3. Water Cost
    const waterOld = parseFloat(newInvoiceWaterOldIndexInput?.value || 0);
    const waterNew = parseFloat(newInvoiceWaterNewIndexInput?.value || 0);
    const waterPrice = parseFloat(newInvoiceWaterPricePerUnitInput?.value || 0);
    if (waterNew >= waterOld && waterPrice > 0) {
      total += (waterNew - waterOld) * waterPrice;
    }

    // 4. Utilities Cost (Lấy từ các item đã render dựa trên contract)
    const renderedUtilityItems =
      newInvoiceUtilitiesListDiv?.querySelectorAll(".invoice-utility-item") ||
      []; // Query các item đã render
    renderedUtilityItems.forEach((item) => {
      total += parseFloat(item.dataset.price || 0); // Lấy giá từ data-price
    });

    // Update the display
    newInvoiceTotalAmountInput.value = total;
  }

  // Function: Loads utilities based on the active contract for the selected room.
  async function loadUtilitiesForInvoiceModal(contractUtilityIds = []) {
    if (!newInvoiceUtilitiesListDiv) return;
    newInvoiceUtilitiesListDiv.innerHTML =
      '<p class="text-muted small m-0">Đang tải tiện ích từ hợp đồng...</p>';
    activeContractUtilities = []; // Reset global list for this invoice

    // Fetch all utility details if not already available globally (nên fetch 1 lần ở initializePage)
    if (!allUtilitiesData || allUtilitiesData.length === 0) {
      try {
        allUtilitiesData = await UtilityService.getAllUtilities();
      } catch (error) {
        console.error("Failed to fetch all utilities details:", error);
        newInvoiceUtilitiesListDiv.innerHTML =
          '<p class="text-danger small m-0">Lỗi tải chi tiết tiện ích.</p>';
        return; // Stop if we can't get details
      }
    }

    newInvoiceUtilitiesListDiv.innerHTML = ""; // Clear loading/previous

    if (contractUtilityIds && contractUtilityIds.length > 0) {
      const utilitiesToDisplay = [];
      contractUtilityIds.forEach((contractUtilId) => {
        const idToFind =
          typeof contractUtilId === "object"
            ? contractUtilId._id
            : contractUtilId;
        const utilityDetail = allUtilitiesData.find(
          (util) => util._id === idToFind
        );
        if (utilityDetail) {
          utilitiesToDisplay.push(utilityDetail); // Add detail object
        } else {
          console.warn(`Utility detail not found for ID: ${idToFind}`);
        }
      });

      if (utilitiesToDisplay.length > 0) {
        activeContractUtilities = utilitiesToDisplay.map((u) => u._id); // Store IDs globally for saving
        utilitiesToDisplay.forEach((utility) => {
          const div = document.createElement("div");
          div.classList.add(
            "form-check",
            "form-check-sm",
            "invoice-utility-item"
          );
          // Lưu giá vào data attribute
          div.dataset.price = utility.price || 0;
          const utilityName =
            utilityNameMap[utility.name] ||
            (utility.name
              ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
              : "Tiện ích");
          const priceDisplay = (utility.price || 0).toLocaleString("vi-VN");

          div.innerHTML = `
              <input class="form-check-input" type="checkbox" value="${utility._id}" id="invoice-utility-${utility._id}" checked disabled>
              <label class="form-check-label" for="invoice-utility-${utility._id}">
                  ${utilityName} (+${priceDisplay} VNĐ) 
              </label>
          `;
          // Hoặc dạng text đơn giản:
          // div.innerHTML = `
          //     <span class="utility-name">${utilityName}</span>
          //     <span class="utility-price float-end">(+${priceDisplay} VNĐ)</span>
          // `;
          // div.style.marginBottom = '0.3rem'; // Thêm khoảng cách nếu dùng span

          newInvoiceUtilitiesListDiv.appendChild(div);
        });
      } else {
        newInvoiceUtilitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Hợp đồng không đăng ký tiện ích nào.</p>';
      }
    } else {
      newInvoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Hợp đồng không đăng ký tiện ích nào.</p>';
    }

    // Recalculate total after loading/clearing utilities
    calculateTotalAmount();
  }

  // Function: Loads occupied rooms into the 'Add Invoice' modal dropdown.
  async function loadOccupiedRoomsForInvoiceModal() {
    if (!newInvoiceRoomIdSelect || !invoiceRoomSelectLoadingDiv) return;

    newInvoiceRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    newInvoiceRoomIdSelect.disabled = true;
    invoiceRoomSelectLoadingDiv.style.display = "block";

    try {
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      const occupiedRoomsForInvoiceModal = rooms;

      newInvoiceRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          option.dataset.defaultRentPrice = room.rentPrice || 0;
          newInvoiceRoomIdSelect.appendChild(option);
        });
        newInvoiceRoomIdSelect.disabled = false;
      } else {
        newInvoiceRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
    } catch (error) {
      console.error("Error loading occupied rooms for invoice modal:", error);
      newInvoiceRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      invoiceRoomSelectLoadingDiv.style.display = "none";
    }
  }

  // Function: Resets the 'Add Invoice' form to its default state.
  function resetAddInvoiceForm() {
    if (addInvoiceForm) {
      addInvoiceForm.reset();
      addInvoiceForm.classList.remove("was-validated");
    }
    // Reset dropdowns
    if (newInvoiceRoomIdSelect) {
      newInvoiceRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';
      newInvoiceRoomIdSelect.disabled = true;
    }
    if (newInvoicePaymentMethodSelect) {
      newInvoicePaymentMethodSelect.value = "cash";
    }
    // Clear calculated/prefilled fields
    if (newInvoiceRentAmountInput) newInvoiceRentAmountInput.value = "";
    if (newInvoiceTotalAmountInput) newInvoiceTotalAmountInput.value = "";
    // Clear utility list and reset global state
    if (newInvoiceUtilitiesListDiv)
      newInvoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Chọn phòng để tải tiện ích...</p>';
    activeContractUtilities = [];
    activeContractRentPrice = 0;

    hideModalFeedback("addInvoiceModalFeedback");
  }

  // Function: Handles the submission of the 'Add New Invoice' form.
  async function handleSaveNewInvoice() {
    hideModalFeedback("addInvoiceModalFeedback");

    // Basic form validation
    if (
      !addInvoiceForm ||
      !addInvoiceForm.checkValidity() ||
      !newInvoiceRoomIdSelect.value
    ) {
      if (addInvoiceForm) addInvoiceForm.classList.add("was-validated");
      showModalFeedback(
        "addInvoiceModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc.",
        "warning"
      );
      return;
    }

    const elecOld = parseFloat(newInvoiceElecOldIndexInput?.value || 0);
    const elecNew = parseFloat(newInvoiceElecNewIndexInput?.value || 0);
    const waterOld = parseFloat(newInvoiceWaterOldIndexInput?.value || 0);
    const waterNew = parseFloat(newInvoiceWaterNewIndexInput?.value || 0);

    if (elecNew < elecOld) {
      showModalFeedback(
        "addInvoiceModalFeedback",
        "Chỉ số điện mới không được nhỏ hơn chỉ số cũ.",
        "warning"
      );
      newInvoiceElecNewIndexInput?.classList.add("is-invalid");
      return;
    } else {
      newInvoiceElecNewIndexInput?.classList.remove("is-invalid");
    }

    if (waterNew < waterOld) {
      showModalFeedback(
        "addInvoiceModalFeedback",
        "Chỉ số nước mới không được nhỏ hơn chỉ số cũ.",
        "warning"
      );
      newInvoiceWaterNewIndexInput?.classList.add("is-invalid");
      return;
    } else {
      newInvoiceWaterNewIndexInput?.classList.remove("is-invalid");
    }

    const issueDate = newInvoiceIssueDateInput?.value;
    const dueDate = newInvoiceDueDateInput?.value;
    if (issueDate && dueDate && new Date(dueDate) < new Date(issueDate)) {
      showModalFeedback(
        "addInvoiceModalFeedback",
        "Ngày hết hạn không được trước ngày phát hành.",
        "warning"
      );
      newInvoiceDueDateInput?.classList.add("is-invalid");
      return;
    } else {
      newInvoiceDueDateInput?.classList.remove("is-invalid");
    }

    if (addInvoiceForm) addInvoiceForm.classList.add("was-validated");

    // Recalculate final total before sending
    const finalTotalAmount = parseFloat(newInvoiceTotalAmountInput?.value || 0);

    // UI feedback
    if (saveNewInvoiceBtn) saveNewInvoiceBtn.disabled = true;
    if (saveNewInvoiceSpinner)
      saveNewInvoiceSpinner.style.display = "inline-block";

    const invoiceData = {
      roomId: newInvoiceRoomIdSelect.value,
      issueDate: newInvoiceIssueDateInput.value,
      dueDate: newInvoiceDueDateInput.value,
      rentAmount: activeContractRentPrice,
      electricity: {
        oldIndex: elecOld,
        newIndex: elecNew,
        pricePerUnit: parseFloat(newInvoiceElecPricePerUnitInput.value || 0)
      },
      water: {
        oldIndex: waterOld,
        newIndex: waterNew,
        pricePerUnit: parseFloat(newInvoiceWaterPricePerUnitInput.value || 0)
      },
      utilities: activeContractUtilities,
      paymentMethod: newInvoicePaymentMethodSelect.value,
      paymentStatus: "pending",
      notes: newInvoiceNotesInput.value.trim()
    };

    try {
      await InvoiceService.addNewInvoice(invoiceData);
      showModalFeedback(
        "addInvoiceModalFeedback",
        "Thêm hóa đơn thành công!",
        "success"
      );
      invoiceCurrentPage = 1;
      await fetchAndRenderUiForInvoicesTab();
      setTimeout(() => {
        if (addNewInvoiceModal) addNewInvoiceModal.hide();
      }, 1500);
    } catch (error) {
      console.error("Error adding new invoice:", error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm hóa đơn"
      ).toString();
      showModalFeedback(
        "addInvoiceModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewInvoiceBtn) saveNewInvoiceBtn.disabled = false;
      if (saveNewInvoiceSpinner) saveNewInvoiceSpinner.style.display = "none";
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

  // Event Listeners: Contracts Tab Actions
  if (searchContractsBtn) {
    searchContractsBtn.addEventListener("click", () => {
      contractCurrentPage = 1; // Reset to first page on new search/filter
      fetchAndRenderUiForContractsTab();
    });
  }

  if (searchContractInput) {
    searchContractInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        contractCurrentPage = 1; // Reset to first page on new search/filter
        fetchAndRenderUiForContractsTab();
      }
    });
  }

  if (applyContractFiltersBtn) {
    applyContractFiltersBtn.addEventListener("click", () => {
      contractCurrentPage = 1; // Reset to first page on new search/filter
      fetchAndRenderUiForContractsTab();
    });
  }

  if (contractTableBody) {
    // Event delegation for delete button
    contractTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-contract-btn");
      if (deleteButton) {
        event.stopPropagation(); // Prevent row click event
        const contractId = deleteButton.dataset.id;
        if (contractId) {
          handleDeleteContract(contractId);
        }
      }
    });
  }

  // --- Event Listeners: Add New Contract Modal ---
  if (addNewContractBtn && addNewContractModal) {
    addNewContractBtn.addEventListener("click", () => {
      resetAddContractForm(); // Reset form first

      // Show modal immediately, load data in background
      addNewContractModal.show();

      // Load necessary data for the form
      Promise.all([
        loadVacantRoomsForModal(),
        loadContractAmenitiesForModal(),
        loadContractUtilitiesForModal()
      ]).catch((error) => {
        console.error(error);
        showModalFeedback(
          "addContractModalFeedback",
          "Lỗi tải dữ liệu cần thiết cho biểu mẫu.",
          "danger"
        );
      });
    });
  }
  if (newContractRoomIdSelect) {
    newContractRoomIdSelect.addEventListener("change", (event) => {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const rentPrice = parseFloat(selectedOption.dataset.rentPrice || 0);

      if (newContractRentPriceInput) {
        newContractRentPriceInput.value = rentPrice;
      }

      baseContractDeposit = rentPrice;
      updateContractDeposit();
    });
  }
  if (newContractAmenitiesListDiv) {
    newContractAmenitiesListDiv.addEventListener("change", (event) => {
      if (event.target.classList.contains("contract-amenity-checkbox")) {
        updateContractDeposit();
      }
    });
  }
  // if (newContractUtilitiesListDiv) {
  //   newContractUtilitiesListDiv.addEventListener("change", (event) => {
  //     if (event.target.classList.contains("contract-utility-checkbox")) {
  //       updateContractDeposit();
  //     }
  //   });
  // }
  if (addNewContractModalElement) {
    addNewContractModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddContractForm
    );
  }
  if (saveNewContractBtn) {
    saveNewContractBtn.addEventListener("click", handleSaveNewContract);
  }

  // Event Listeners: Invoices Tab Actions
  if (searchInvoiceBtn) {
    searchInvoiceBtn.addEventListener("click", () => {
      invoiceCurrentPage = 1; // Reset page on new search/filter
      fetchAndRenderUiForInvoicesTab();
    });
  }
  if (searchInvoiceInput) {
    searchInvoiceInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        invoiceCurrentPage = 1;
        fetchAndRenderUiForInvoicesTab();
      }
    });
  }
  if (applyInvoiceFiltersBtn) {
    applyInvoiceFiltersBtn.addEventListener("click", () => {
      invoiceCurrentPage = 1;
      fetchAndRenderUiForInvoicesTab();
    });
  }
  if (invoiceTableBody) {
    // Event delegation for delete buttons
    invoiceTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-invoice-btn");

      if (deleteButton) {
        event.stopPropagation(); // Prevent row click
        const invoiceId = deleteButton.dataset.id;
        if (invoiceId) {
          handleDeleteInvoice(invoiceId);
        }
      }
    });
  }

  // Event Listeners: Add New Invoice Modal
  if (addNewInvoiceBtn && addNewInvoiceModal) {
    addNewInvoiceBtn.addEventListener("click", () => {
      resetAddInvoiceForm(); // Reset trước
      addNewInvoiceModal.show();
      loadOccupiedRoomsForInvoiceModal().catch((error) => {
        console.error("Error loading rooms for invoice modal:", error);
        showModalFeedback(
          "addInvoiceModalFeedback",
          "Lỗi tải danh sách phòng.",
          "danger"
        );
      });
    });
  }
  if (addNewInvoiceModalElement) {
    addNewInvoiceModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddInvoiceForm
    );
  }
  // Event Listeners: Add New Invoice Modal
  if (addNewInvoiceBtn && addNewInvoiceModal) {
    addNewInvoiceBtn.addEventListener("click", () => {
      resetAddInvoiceForm();
      addNewInvoiceModal.show();
      // Load rooms and potentially utilities after showing modal
      Promise.all([
        loadOccupiedRoomsForInvoiceModal(),
        loadUtilitiesForInvoiceModal()
      ]).catch((error) => {
        console.error("Error loading initial data for invoice modal:", error);
        showModalFeedback(
          "addInvoiceModalFeedback",
          "Lỗi tải dữ liệu cần thiết cho form.",
          "danger"
        );
      });
    });
  }

  if (newInvoiceRoomIdSelect) {
    newInvoiceRoomIdSelect.addEventListener("change", async (event) => {
      const selectedRoomId = event.target.value;
      const selectedOption = event.target.options[event.target.selectedIndex];
      const defaultRentPrice = parseFloat(
        selectedOption.dataset.defaultRentPrice || 0
      );

      newInvoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tìm hợp đồng...</p>';
      activeContractUtilities = [];
      activeContractRentPrice = defaultRentPrice;
      if (newInvoiceRentAmountInput) {
        newInvoiceRentAmountInput.value = activeContractRentPrice;
      }
      calculateTotalAmount();

      if (!selectedRoomId) {
        newInvoiceUtilitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Vui lòng chọn phòng.</p>';
        return;
      }

      try {
        // Fetch active contract for the selected room
        const contracts = await ContractService.getAllContracts({
          roomId: selectedRoomId,
          status: "active"
        });

        if (contracts && contracts.length > 0) {
          const activeContract = contracts[0];
          console.log("Active contract found:", activeContract);
          activeContractUtilities = activeContract.utilities || [];
          activeContractRentPrice =
            activeContract.rentPrice || defaultRentPrice;

          if (newInvoiceRentAmountInput) {
            newInvoiceRentAmountInput.value = activeContractRentPrice;
          }
          await loadUtilitiesForInvoiceModal(activeContractUtilities);
        } else {
          console.log("No active contract found for room:", selectedRoomId);
          newInvoiceUtilitiesListDiv.innerHTML =
            '<p class="text-info small m-0">Không tìm thấy hợp đồng đang hoạt động cho phòng này.</p>';
          activeContractUtilities = [];
          activeContractRentPrice = defaultRentPrice;
          if (newInvoiceRentAmountInput) {
            newInvoiceRentAmountInput.value = activeContractRentPrice;
          }
          calculateTotalAmount();
        }
      } catch (error) {
        console.error("Error fetching active contract:", error);
        showModalFeedback(
          "addInvoiceModalFeedback",
          "Lỗi khi tải thông tin hợp đồng.",
          "warning"
        );
        newInvoiceUtilitiesListDiv.innerHTML =
          '<p class="text-danger small m-0">Lỗi tải tiện ích từ hợp đồng.</p>';
        activeContractUtilities = [];
        activeContractRentPrice = defaultRentPrice;
        if (newInvoiceRentAmountInput) {
          newInvoiceRentAmountInput.value = activeContractRentPrice;
        }
        calculateTotalAmount();
      }
    });
  }

  // Add listeners to inputs that affect the total amount
  const calculationInputs = [
    newInvoiceRentAmountInput,
    newInvoiceElecOldIndexInput,
    newInvoiceElecNewIndexInput,
    newInvoiceElecPricePerUnitInput,
    newInvoiceWaterOldIndexInput,
    newInvoiceWaterNewIndexInput,
    newInvoiceWaterPricePerUnitInput
  ];
  calculationInputs.forEach((input) => {
    if (input) {
      input.addEventListener("input", calculateTotalAmount);
    }
  });

  if (addNewInvoiceModalElement) {
    addNewInvoiceModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddInvoiceForm
    );
  }
  if (saveNewInvoiceBtn) {
    saveNewInvoiceBtn.addEventListener("click", handleSaveNewInvoice);
  }

  // --- Initial Page Load Logic ---
  async function initializePage() {
    showContent("rooms-tab-container"); // Default tab

    // Initialize Rooms Tab
    await populateAddressFilter();
    await fetchAndRenderUiForRoomsTab();

    // Initialize Amenities & Utilities Tab
    await fetchAndRenderUiForAmenitiesTab();
    await fetchAndRenderUiForUtilitiesTab();

    // Initialize Contracts Tab
    await populateContractRoomFilterDropdown(); // For contract filter
    await fetchAndRenderUiForContractsTab();

    // Initialize Invoices Tab
    await populateInvoiceRoomFilterDropdown(); // For invoice filter
    await fetchAndRenderUiForInvoicesTab();

    // ... Initialize other tabs as needed ...
  }

  initializePage(); // Execute initialization
});
