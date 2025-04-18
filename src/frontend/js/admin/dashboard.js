import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";
import ContractService from "../services/ContractService.js";
import InvoiceService from "../services/InvoiceService.js";
import ExpenseService from "../services/ExpenseService.js";
import UserService from "../services/UserService.js";
import OccupantService from "../services/OccupantService.js";

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
let activeContractCode = 0;

// --- Store mapping for Payment Method name ---
const paymentMethodMap = {
  all: "Tất cả",
  cash: "Tiền mặt",
  banking: "Chuyển khoản"
};

// --- State for Expenses Tab ---
let expenseCurrentPage = 1;
let totalExpenses = 0;
const expensesPerPage = 10;
let currentExpenseData = [];
let allRoomsForExpenseFilter = [];
let selectedExpenseImageFiles = [];

// --- Store mapping for Expense Category name ---
const expenseCategoryMap = {
  repair: "Sửa chữa",
  maintenance: "Bảo trì",
  purchase: "Mua sắm"
  // Add more categories if needed
};

// --- Store mapping for Expense Payment Status name ---
const expensePaymentStatusMap = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  overdue: "Đã quá hạn"
};

// --- State for Users Tab ---
let userCurrentPage = 1;
let totalUsers = 0;
const usersPerPage = 10;
let currentUserData = [];

const roleMap = {
  landlord: "Chủ trọ",
  tenant: "Người thuê"
};

// --- State for Occupants Tab ---
// --- State for Occupants Tab ---
let occupantCurrentPage = 1;
let totalOccupants = 0;
const occupantsPerPage = 10;
let currentOccupantData = [];
let allOccupiedRoomsForOccupantFilter = [];
let selectedOccupantCccdImageFiles = [];
let availableTenantUsers = [];
let activeContractCodeForSelectedRoom = null;

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
  const searchContractBtn = document.getElementById("searchContractBtn");
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

  // --- Selectors: Expenses Tab UI ---
  const expenseTableBody = document.getElementById("expenseTableBody");
  const expensePaginationContainer =
    document.getElementById("expensePagination");
  const searchExpenseInput = document.getElementById("searchExpenseInput");
  const searchExpenseBtn = document.getElementById("searchExpenseBtn");
  const expenseRoomFilterSelect = document.getElementById("expenseRoomFilter");
  const expenseDateFilter = document.getElementById("expenseDateFilter");
  const expenseDueDateFilter = document.getElementById("expenseDueDateFilter");
  const expenseCategoryFilter = document.getElementById(
    "expenseCategoryFilter"
  );
  const expensePaymentMethodFilter = document.getElementById(
    "expensePaymentMethodFilter"
  );
  const expensePaymentDateFilter = document.getElementById(
    "expensePaymentDateFilter"
  );
  const expensePaymentStatusFilter = document.getElementById(
    "expensePaymentStatusFilter"
  );
  const applyExpenseFiltersBtn = document.getElementById("applyExpenseFilters");
  const addNewExpenseBtn = document.getElementById("addNewExpenseBtn");
  // Add New Expense Modal
  const addNewExpenseModalElement =
    document.getElementById("addNewExpenseModal");
  const addExpenseForm = document.getElementById("addExpenseForm");
  const expenseRoomSelectLoadingDiv = document.getElementById(
    "expenseRoomSelectLoading"
  );
  const newExpenseRoomIdSelect = document.getElementById("newExpenseRoomId");
  const newExpenseAmountInput = document.getElementById("newExpenseAmount");
  const newExpenseCategorySelect =
    document.getElementById("newExpenseCategory");
  const newExpenseDescriptionInput = document.getElementById(
    "newExpenseDescription"
  );
  const newExpenseDateInput = document.getElementById("newExpenseDate");
  const newExpenseDueDateInput = document.getElementById("newExpenseDueDate");
  const newExpenseImagesInput = document.getElementById(
    "newExpenseImagesInput"
  );
  const newExpensePaymentMethodSelect = document.getElementById(
    "newExpensePaymentMethod"
  );
  const selectExpenseImagesBtn = document.getElementById(
    "selectExpenseImagesBtn"
  );
  const newExpenseImagePreviewDiv = document.getElementById(
    "newExpenseImagePreview"
  );
  const saveNewExpenseBtn = document.getElementById("saveNewExpenseBtn");
  const addExpenseModalFeedbackDiv = document.getElementById(
    "addExpenseModalFeedback"
  );
  const saveNewExpenseSpinner =
    saveNewExpenseBtn?.querySelector(".spinner-border");

  // --- Selectors: Users Tab UI ---
  const userTableBody = document.getElementById("userTableBody");
  const userPaginationContainer = document.getElementById("userPagination");
  const searchUserInput = document.getElementById("searchUserInput");
  const searchUserBtn = document.getElementById("searchUserBtn");
  const userRoleFilter = document.getElementById("userRoleFilter");
  const applyUserFiltersBtn = document.getElementById("applyUserFilters");
  const addNewUserBtn = document.getElementById("addNewUserBtn");
  // Add New User Modal
  const addNewUserModalElement = document.getElementById("addNewUserModal");
  const addUserForm = document.getElementById("addUserForm");
  const newUserRoleSelect = document.getElementById("newUserRole");
  const newUsernameInput = document.getElementById("newUsername");
  const newUserPasswordInput = document.getElementById("newUserPassword");
  const newUserConfirmPasswordInput = document.getElementById(
    "newUserConfirmPassword"
  );
  const newUserPhoneInput = document.getElementById("newUserPhone");
  const saveNewUserBtn = document.getElementById("saveNewUserBtn");
  const addUserModalFeedbackDiv = document.getElementById(
    "addUserModalFeedback"
  );
  const newUserPasswordFeedbackDiv = document.getElementById(
    "newUserPasswordFeedback"
  );
  const confirmPasswordFeedbackDiv = document.getElementById(
    "confirmPasswordFeedback"
  );
  const saveNewUserSpinner = saveNewUserBtn?.querySelector(".spinner-border");
  const newUserPasswordToggle = document.getElementById(
    "newUserPasswordToggle"
  );
  const newUserConfirmPasswordToggle = document.getElementById(
    "newUserConfirmPasswordToggle"
  );

  // --- Selectors: Occupants Tab UI ---
  const occupantTableBody = document.getElementById("occupantTableBody");
  const occupantPaginationContainer =
    document.getElementById("occupantPagination");
  const searchOccupantContractCodeInput = document.getElementById(
    "searchOccupantContractCodeInput"
  );
  const searchOccupantCccdInput = document.getElementById(
    "searchOccupantCccdInput"
  );
  const searchOccupantBtn = document.getElementById("searchOccupantBtn");
  const occupantRoomFilterSelect =
    document.getElementById("occupantRoomFilter");
  const applyOccupantFiltersBtn = document.getElementById(
    "applyOccupantFilters"
  );
  const addNewOccupantBtn = document.getElementById("addNewOccupantBtn");
  // Add New Occupant Modal
  const addNewOccupantModalElement = document.getElementById(
    "addNewOccupantModal"
  );
  const addOccupantForm = document.getElementById("addOccupantForm");
  const newOccupantRoomIdSelect = document.getElementById("newOccupantRoomId");
  const occupantRoomSelectLoadingDiv = document.getElementById(
    "occupantRoomSelectLoading"
  );
  const newOccupantContractCodeInput = document.getElementById(
    "newOccupantContractCode"
  );
  const newOccupantTenantIdSelect = document.getElementById(
    "newOccupantTenantId"
  );
  const occupantTenantSelectLoadingDiv = document.getElementById(
    "occupantTenantSelectLoading"
  );
  const newOccupantFullNameInput = document.getElementById(
    "newOccupantFullName"
  );
  const newOccupantBirthdayInput = document.getElementById(
    "newOccupantBirthday"
  );
  const newOccupantAddressInput = document.getElementById("newOccupantAddress");
  const newOccupantCccdInput = document.getElementById("newOccupantCccd");
  const newOccupantCccdImagesInput = document.getElementById(
    "newOccupantCccdImagesInput"
  );
  const selectOccupantCccdImagesBtn = document.getElementById(
    "selectOccupantCccdImagesBtn"
  );
  const newOccupantCccdImagePreviewDiv = document.getElementById(
    "newOccupantCccdImagePreview"
  );
  const saveNewOccupantBtn = document.getElementById("saveNewOccupantBtn");
  const addOccupantModalFeedbackDiv = document.getElementById(
    "addOccupantModalFeedback"
  );
  const saveNewOccupantSpinner =
    saveNewOccupantBtn?.querySelector(".spinner-border");

  const logoutLink = document.querySelector(".logout-tab a");

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
  const addNewExpenseModal = addNewExpenseModalElement
    ? new bootstrap.Modal(addNewExpenseModalElement)
    : null;
  const addNewUserModal = addNewUserModalElement
    ? new bootstrap.Modal(addNewUserModalElement)
    : null;
  const addNewOccupantModal = addNewOccupantModalElement
    ? new bootstrap.Modal(addNewOccupantModalElement)
    : null;

  // --- Core UI Functions ---

  // Function: Toggles password input visibility and updates the toggle icon.
  function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (!passwordInput || !toggleIcon) return;
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleIcon.src = isPassword
      ? "/assets/logo_hint_password.png"
      : "/assets/logo_no_hint_password.png"; // Check paths
    toggleIcon.alt = isPassword ? "Hide password" : "Show password";
  }

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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
        console.error(roomError);
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
      console.error(error);
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
        console.error(error);
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
        utilitiesToDisplay.push(utilityDetail); // Add detail object
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
      console.error(error);
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
      contractCode: activeContractCode,
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
      console.error(error);
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

  // --- Expenses Tab: Data Fetching & Filtering Logic ---

  // Function: Populates the room filter dropdown on the main Expenses tab.
  async function populateExpenseRoomFilterDropdown() {
    if (!expenseRoomFilterSelect) return;

    expenseRoomFilterSelect.innerHTML =
      '<option value="all" selected>Tất cả phòng (Đã thuê)</option><option value="" disabled>Đang tải...</option>'; // Cập nhật text mặc định
    expenseRoomFilterSelect.disabled = true;

    try {
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      allRoomsForExpenseFilter = rooms;

      expenseRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option>'; // Reset

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          expenseRoomFilterSelect.appendChild(option);
        });
      } else {
        expenseRoomFilterSelect.innerHTML +=
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
      expenseRoomFilterSelect.disabled = false;
    } catch (error) {
      console.error(error);
      expenseRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Lỗi tải phòng</option>';
      allRoomsForExpenseFilter = [];
    }
  }

  // Function: Fetches expense data based on current filters and search term.
  async function fetchAndRenderUiForExpensesTab() {
    if (expenseTableBody) {
      expenseTableBody.innerHTML = `<tr><td colspan="10" class="text-center">Đang tải dữ liệu chi phí...</td></tr>`; // Colspan matches table header
    }
    if (expensePaginationContainer) {
      expensePaginationContainer.innerHTML = "";
    }

    try {
      // Gather filter values from UI elements
      const searchTerm = searchExpenseInput?.value.trim() || "";
      const selectedRoomId = expenseRoomFilterSelect?.value || "all";
      const expenseDate = expenseDateFilter?.value || "";
      const dueDate = expenseDueDateFilter?.value || "";
      const category = expenseCategoryFilter?.value || "all";
      const paymentMethod = expensePaymentMethodFilter?.value || "all";
      const paymentDate = expensePaymentDateFilter?.value || "";
      const paymentStatus = expensePaymentStatusFilter?.value || "all";

      // Construct filter object for the API call
      const filter = {};
      if (searchTerm) filter.expenseCode = searchTerm; // Ensure backend supports search by code
      if (selectedRoomId !== "all") filter.roomId = selectedRoomId;
      if (expenseDate) filter.expenseDate = expenseDate; // Use API expected key
      if (dueDate) filter.dueDate = dueDate;
      if (category !== "all") filter.category = category;
      if (paymentMethod !== "all") filter.paymentMethod = paymentMethod;
      if (paymentDate) filter.paymentDate = paymentDate;
      if (paymentStatus !== "all") filter.paymentStatus = paymentStatus;

      // Fetch expenses from the service
      const allMatchingExpenses = await ExpenseService.getAllExpenses(filter);

      // Update state and render UI
      currentExpenseData = allMatchingExpenses || [];
      totalExpenses = currentExpenseData.length;
      renderExpenseTableUI(); // Render the table with fetched data
    } catch (error) {
      console.error(error);
      if (expenseTableBody) {
        expenseTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Lỗi khi tải dữ liệu chi phí.</td></tr>`;
      }
      currentExpenseData = [];
      totalExpenses = 0;
      renderExpensePaginationUI(); // Still render pagination controls (which will be empty)
    }
  }

  // --- Expenses Tab: UI Rendering Logic ---

  // Function: Renders the HTML table rows for the expenses based on the current page and data.
  async function renderExpenseTableUI() {
    if (!expenseTableBody) return;
    expenseTableBody.innerHTML = ""; // Clear previous content

    if (currentExpenseData.length === 0) {
      expenseTableBody.innerHTML = `<tr><td colspan="10" class="text-center">Không tìm thấy chi phí nào phù hợp.</td></tr>`;
      renderExpensePaginationUI(); // Ensure pagination is cleared or shows nothing
      return;
    }

    // Calculate pagination indices
    const startIndex = (expenseCurrentPage - 1) * expensesPerPage;
    const endIndex = Math.min(startIndex + expensesPerPage, totalExpenses);
    const expensesToDisplay = currentExpenseData.slice(startIndex, endIndex);

    const roomIds = [
      ...new Set(expensesToDisplay.map((exp) => exp.roomId))
    ].filter(Boolean); // Get unique, valid room IDs
    const roomDetailsMap = new Map();
    if (roomIds.length > 0) {
      try {
        // Fetch details for only the rooms needed for the current page
        const roomPromises = roomIds.map((id) => RoomService.getRoomById(id));
        const roomResults = await Promise.allSettled(roomPromises);
        roomResults.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value) {
            roomDetailsMap.set(roomIds[index], result.value); // Map ID to room object
          } else if (result.status === "rejected") {
            console.warn(
              `Failed to fetch room details for ID: ${roomIds[index]}`,
              result.reason
            );
          }
        });
      } catch (roomError) {
        console.error(roomError);
        // Continue rendering, but room names might show as 'N/A'
      }
    }

    // Generate table rows
    expensesToDisplay.forEach((expense, index) => {
      const row = document.createElement("tr");
      row.dataset.id = expense._id; // Store ID for potential actions
      const sequentialNumber = startIndex + index + 1;

      // Get room display text safely
      const roomInfo = roomDetailsMap.get(expense.roomId);
      const roomDisplay = roomInfo
        ? `P. ${roomInfo.roomNumber || "N/A"} - ĐC. ${
            roomInfo.address || "N/A"
          }`
        : expense.roomId
        ? "ID phòng: " + expense.roomId.slice(-6)
        : "Không có phòng"; // Fallback

      // Format dates and values for display
      const formattedExpenseDate = expense.expenseDate
        ? new Date(expense.expenseDate).toLocaleDateString("vi-VN")
        : "N/A";
      const formattedDueDate = expense.dueDate
        ? new Date(expense.dueDate).toLocaleDateString("vi-VN")
        : "N/A";
      const formattedPaymentDate = expense.paymentDate
        ? new Date(expense.paymentDate).toLocaleDateString("vi-VN")
        : "Chưa thanh toán"; // Display text if no payment date

      // Use maps for readable text
      const categoryText =
        expenseCategoryMap[expense.category] || expense.category || "Không rõ";
      const paymentMethodText =
        paymentMethodMap[expense.paymentMethod] ||
        (expense.paymentStatus === "paid" ? "Không rõ" : "Chưa thanh toán");
      const paymentStatusText =
        expensePaymentStatusMap[expense.paymentStatus] ||
        expense.paymentStatus ||
        "Không rõ";
      const paymentStatusClass = `status-${expense.paymentStatus || "unknown"}`; // CSS class for styling

      // Populate row cells (ensure order matches HTML thead)
      row.innerHTML = `
            <td>${sequentialNumber}</td>
            <td>${expense.expenseCode || "N/A"}</td>
            <td>${roomDisplay}</td>
            <td class="text-center">${formattedExpenseDate}</td>
            <td class="text-center">${formattedDueDate}</td>
            <td class="text-center">${categoryText}</td>
            <td class="text-center">${paymentMethodText}</td>
            <td class="text-center">${formattedPaymentDate}</td>
            <td class="text-center">
                <span class="${paymentStatusClass}">${paymentStatusText}</span>
            </td>
            <td class="text-center action-cell">
                <button class="btn btn-sm btn-danger delete-expense-btn" data-id="${
                  expense._id
                }" title="Xóa chi phí">Xóa</button>
            </td>
          `;

      // Add click listener to the row (navigate to details page, avoiding action cell)
      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) {
          return; // Don't navigate if clicking within the action cell
        }
        // Redirect to the expense details page (adjust URL as needed)
        window.location.href = `/admin/expense/details/${expense._id}`;
      });

      expenseTableBody.appendChild(row);
    });

    renderExpensePaginationUI(); // Update pagination controls
  }

  // Funtion: Renders the pagination controls based on the total number of expenses.
  function renderExpensePaginationUI() {
    if (!expensePaginationContainer) return;
    expensePaginationContainer.innerHTML = ""; // Clear existing controls

    const totalPages = Math.ceil(totalExpenses / expensesPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed if 0 or 1 page
    }

    // Create pagination links
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === expenseCurrentPage) {
        pageNumberItem.classList.add("active"); // Highlight current page
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#"; // Prevent page jump
      pageNumberLink.textContent = i;

      // Add click listener to change page
      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== expenseCurrentPage) {
          expenseCurrentPage = i;
          renderExpenseTableUI(); // Re-render table for the new page
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      expensePaginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Expenses Tab: Delete Expense Logic ---
  async function handleDeleteExpense(expenseId) {
    // Confirmation dialog
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa chi phí này không?"
    );
    if (!confirmed) return;

    const deleteButton = expenseTableBody?.querySelector(
      `.delete-expense-btn[data-id="${expenseId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";

    // Show loading state on button
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      // Call the service to delete the expense
      await ExpenseService.deleteExpense(expenseId);

      // --- Update local state and UI ---
      // Remove from the data array
      const indexToRemove = currentExpenseData.findIndex(
        (exp) => exp._id === expenseId
      );
      if (indexToRemove > -1) {
        currentExpenseData.splice(indexToRemove, 1);
      }
      totalExpenses = currentExpenseData.length; // Update total count

      // Adjust current page if the last item on a page was deleted
      const totalPagesAfterDeletion = Math.ceil(
        totalExpenses / expensesPerPage
      );
      if (
        expenseCurrentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        expenseCurrentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        expenseCurrentPage = 1; // Reset to page 1 if no expenses left
      }

      // Re-render the table and pagination
      renderExpenseTableUI();

      // Optional: Show success toast/notification
      // Example: showToast("Xóa chi phí thành công!");
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi không mong muốn."
      ).toString();
      // Show error alert to the user
      alert(
        `Lỗi khi xóa chi phí: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
      // Restore button state on error
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Expenses Tab: Add New Expense Modal Logic ---

  // Function: Loads ONLY OCCUPIED rooms into the 'Add Expense' modal's dropdown.
  async function loadRoomsForExpenseModal() {
    if (!newExpenseRoomIdSelect || !expenseRoomSelectLoadingDiv) return;

    // Show loading state
    newExpenseRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải danh sách phòng đang thuê...</option>';
    newExpenseRoomIdSelect.disabled = true;
    expenseRoomSelectLoadingDiv.style.display = "block";

    try {
      const rooms = await RoomService.getAllRooms({ status: "occupied" });

      newExpenseRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>'; // Reset placeholder

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          newExpenseRoomIdSelect.appendChild(option);
        });
        newExpenseRoomIdSelect.disabled = false; // Enable select
      } else {
        // CHỈNH SỬA: Cập nhật thông báo
        newExpenseRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng nào đang được thuê để chọn</option>';
      }
    } catch (error) {
      console.error(error);
      newExpenseRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải danh sách phòng</option>';
    } finally {
      expenseRoomSelectLoadingDiv.style.display = "none"; // Hide loading indicator
    }
  }

  // Function: Renders previews of selected images (receipts) in the 'Add Expense' modal,
  // matching the style of other image previews.
  function renderExpenseImagePreviews() {
    if (!newExpenseImagePreviewDiv) return;
    newExpenseImagePreviewDiv.innerHTML = ""; // Clear previous previews

    selectedExpenseImageFiles.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Create preview element using the SAME structure and classes as other previews
        const previewItem = document.createElement("div");
        previewItem.classList.add("image-preview-item"); // Use the standard class
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${file.name}">
          <button type="button" class="remove-image-btn" data-index="${index}" title="Xóa ảnh này">×</button>
        `; // Use standard button class and structure

        // Add event listener to the remove button for this specific image
        previewItem
          .querySelector(".remove-image-btn") // Target the standard class
          .addEventListener("click", (event) => {
            // Find the index from the button clicked
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            // Check if index is valid before splicing
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < selectedExpenseImageFiles.length
            ) {
              selectedExpenseImageFiles.splice(indexToRemove, 1); // Remove file from array
              renderExpenseImagePreviews(); // Re-render previews with updated array and indices
            } else {
              console.error(
                "Invalid index found on remove image button:",
                indexToRemove
              );
            }
          });
        newExpenseImagePreviewDiv.appendChild(previewItem);
      };

      reader.onerror = (error) => {
        console.error(error);
        // Keep error display simple and consistent
        const errorPreviewItem = document.createElement("div");
        errorPreviewItem.classList.add(
          "image-preview-item",
          "text-danger",
          "p-2",
          "border",
          "border-danger"
        );
        errorPreviewItem.textContent = `Lỗi: ${file.name}`;
        errorPreviewItem.style.maxWidth = "80px"; // Optional: constrain width for consistency
        errorPreviewItem.style.wordBreak = "break-word";
        newExpenseImagePreviewDiv.appendChild(errorPreviewItem);
      };

      reader.readAsDataURL(file); // Start reading the file
    });

    // Display message if no images are selected (consistent message)
    if (selectedExpenseImageFiles.length === 0) {
      newExpenseImagePreviewDiv.innerHTML =
        '<p class="text-muted small mb-0">Chưa chọn ảnh nào.</p>'; // Match other modals
    }
  }

  // Function: Handles the selection of new image files for the expense.
  function handleExpenseImageSelection(event) {
    const files = Array.from(event.target.files);
    selectedExpenseImageFiles.push(...files);
    renderExpenseImagePreviews(); // Update the UI
    event.target.value = null;
  }

  // Function: Resets the 'Add New Expense' modal form to its default state.
  function resetAddExpenseForm() {
    if (addExpenseForm) {
      addExpenseForm.reset(); // Reset form fields
      addExpenseForm.classList.remove("was-validated"); // Remove validation styling
    }

    // Reset room dropdown specifically
    if (newExpenseRoomIdSelect) {
      newExpenseRoomIdSelect.innerHTML =
        '<option value="" selected disabled>--- Chọn phòng ---</option>';
      newExpenseRoomIdSelect.disabled = true; // Keep disabled until loaded
    }

    // Reset image state
    selectedExpenseImageFiles = []; // Clear the array of selected files
    renderExpenseImagePreviews(); // Clear the image preview area

    // Hide any previous feedback messages
    hideModalFeedback("addExpenseModalFeedback");
  }

  // Function: Handles the submission of the 'Add New Expense' form.
  // Collects data into an object, gathers image files, and calls the ExpenseService.
  async function handleSaveNewExpense() {
    hideModalFeedback("addExpenseModalFeedback"); // Clear previous messages

    // --- Step 1: Form Validation ---
    if (!addExpenseForm || !addExpenseForm.checkValidity()) {
      if (addExpenseForm) addExpenseForm.classList.add("was-validated");
      showModalFeedback(
        "addExpenseModalFeedback",
        "Vui lòng điền đầy đủ thông tin vào các trường bắt buộc (*).",
        "warning"
      );
      return; // Stop submission if basic validation fails
    }

    // --- Step 2: Specific Field Validations ---
    const amount = parseFloat(newExpenseAmountInput?.value || 0);
    if (isNaN(amount) || amount <= 0) {
      showModalFeedback(
        "addExpenseModalFeedback",
        "Số tiền chi phí phải là một số lớn hơn 0.",
        "warning"
      );
      newExpenseAmountInput?.classList.add("is-invalid"); // Highlight field
      return;
    } else {
      newExpenseAmountInput?.classList.remove("is-invalid");
    }

    const expenseDate = newExpenseDateInput?.value;
    const dueDate = newExpenseDueDateInput?.value;
    if (expenseDate && dueDate && new Date(dueDate) < new Date(expenseDate)) {
      showModalFeedback(
        "addExpenseModalFeedback",
        "Ngày hết hạn thanh toán không được trước ngày phát sinh chi phí.",
        "warning"
      );
      newExpenseDueDateInput?.classList.add("is-invalid");
      return;
    } else {
      newExpenseDueDateInput?.classList.remove("is-invalid");
    }

    if (addExpenseForm) addExpenseForm.classList.add("was-validated"); // Mark validated if all checks pass

    // --- Step 3: Prepare Data Object and Image Files Array ---
    const expenseData = {
      roomId: newExpenseRoomIdSelect.value,
      amount: amount, // Use validated amount
      category: newExpenseCategorySelect.value,
      description: newExpenseDescriptionInput.value.trim(),
      expenseDate: newExpenseDateInput.value,
      dueDate: newExpenseDueDateInput.value,
      paymentMethod: newExpensePaymentMethodSelect.value,
      paymentStatus: "pending",
      description: newExpenseDescriptionInput.value.trim()
    };

    // The image files are already collected in the global `selectedExpenseImageFiles` array

    // --- Step 4: API Call & Feedback ---
    // Show loading state
    if (saveNewExpenseBtn) saveNewExpenseBtn.disabled = true;
    if (saveNewExpenseSpinner)
      saveNewExpenseSpinner.style.display = "inline-block";

    try {
      // Call the service with the data object and the image files array
      // The ExpenseService.addNewExpense handles creating FormData internally
      await ExpenseService.addNewExpense(
        expenseData,
        selectedExpenseImageFiles
      );

      // Success: Show feedback, refresh list, close modal
      showModalFeedback(
        "addExpenseModalFeedback",
        "Thêm chi phí mới thành công!",
        "success"
      );
      expenseCurrentPage = 1; // Go to first page to likely see the new item
      await fetchAndRenderUiForExpensesTab(); // Refresh the expenses table

      // Close modal after a short delay
      setTimeout(() => {
        if (addNewExpenseModal) addNewExpenseModal.hide();
        // Form reset is handled by the 'hidden.bs.modal' event listener
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message || // Check for detailed error from backend
        error.message ||
        "Không thể lưu chi phí. Vui lòng thử lại."
      ).toString();
      showModalFeedback(
        "addExpenseModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      // Always re-enable button and hide spinner
      if (saveNewExpenseBtn) saveNewExpenseBtn.disabled = false;
      if (saveNewExpenseSpinner) saveNewExpenseSpinner.style.display = "none";
    }
  }

  // --- Users Tab: Data Fetching & Filtering Logic ---

  // Function: Fetches user data based on filters/search and triggers UI rendering
  async function fetchAndRenderUiForUsersTab() {
    // Display loading state
    if (userTableBody)
      userTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Loading user data...</td></tr>`; // Colspan = 5
    if (userPaginationContainer) userPaginationContainer.innerHTML = "";

    try {
      // Get filter values
      const searchTerm = searchUserInput?.value.trim() || "";
      const role = userRoleFilter?.value || "all";
      const filter = {};
      if (searchTerm) filter.username = searchTerm;
      if (role !== "all") filter.role = role;

      // Fetch data via API service
      const allMatchingUsers = await UserService.getAllUsers(filter); // Assumes UserService is imported

      // Update state
      currentUserData = allMatchingUsers || [];
      totalUsers = currentUserData.length;

      // Render table and pagination
      renderUserTableUI();
    } catch (error) {
      console.error(error);
      if (userTableBody)
        userTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi tải dữ liệu người dùng.</td></tr>`; // Colspan = 5
      currentUserData = [];
      totalUsers = 0;
      renderUserPaginationUI(); // Render empty pagination
    }
  }

  // --- Users Tab: UI Rendering Logic ---

  // Function: Renders the user table based on current data and pagination
  function renderUserTableUI() {
    if (!userTableBody) return;
    userTableBody.innerHTML = ""; // Clear previous content

    // Handle empty data case
    if (currentUserData.length === 0) {
      userTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No users found matching the criteria.</td></tr>`; // Colspan = 5
      renderUserPaginationUI();
      return;
    }

    // Paginate data
    const startIndex = (userCurrentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, totalUsers);
    const usersToDisplay = currentUserData.slice(startIndex, endIndex);

    // Create table rows
    usersToDisplay.forEach((user, index) => {
      const row = document.createElement("tr");
      row.dataset.id = user._id;
      const sequentialNumber = startIndex + index + 1;
      const roleText = roleMap[user.role] || user.role || "Unknown";

      row.innerHTML = `
            <td>${sequentialNumber}</td>
            <td>${roleText}</td>
            <td>${user.username || "N/A"}</td>
            <td>${user.phone || "N/A"}</td>
            <td class="text-center action-cell">
                 <button class="btn btn-sm btn-danger delete-user-btn" data-id="${
                   user._id
                 }" title="Delete User">Xóa</button>
            </td>
        `;
      userTableBody.appendChild(row);

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) {
          return;
        }
        window.location.href = `/admin/user/details/${user._id}`; // Redirect to user details page
      });
    });

    renderUserPaginationUI(); // Render pagination controls
  }

  // Function: Renders pagination controls for the user table
  function renderUserPaginationUI() {
    if (!userPaginationContainer) return;
    userPaginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalUsers / usersPerPage);
    if (totalPages <= 1) return; // No pagination needed

    // Create page links
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add(
        "page-item",
        i === userCurrentPage ? "active" : ""
      );
      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#";
      pageNumberLink.textContent = i;
      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== userCurrentPage) {
          userCurrentPage = i;
          renderUserTableUI(); // Re-render table for new page
        }
      });
      pageNumberItem.appendChild(pageNumberLink);
      userPaginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Users Tab: Delete User Logic ---
  async function handleDeleteUser(userId) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa người dùng này không?`
    );
    if (!confirmed) return;

    const deleteButton = userTableBody?.querySelector(
      `.delete-user-btn[data-id="${userId}"]` // <<< Tìm button bằng userId
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";

    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await UserService.deleteUser(userId);

      const indexToRemove = currentUserData.findIndex(
        (user) => user._id === userId
      );
      if (indexToRemove > -1) currentUserData.splice(indexToRemove, 1);
      totalUsers = currentUserData.length;

      const totalPagesAfterDeletion = Math.ceil(totalUsers / usersPerPage);
      if (
        userCurrentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        userCurrentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        userCurrentPage = 1;
      }
      renderUserTableUI();
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi không xác định."
      ).toString();
      alert(
        `Lỗi khi xóa người dùng: ${
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

  // --- Users Tab: Add New User Modal Logic ---

  // Function: Resets the 'Add User' form to its default state
  function resetAddUserForm() {
    if (addUserForm) {
      addUserForm.reset();
      addUserForm.classList.remove("was-validated");
    }
    if (newUserRoleSelect) newUserRoleSelect.value = "tenant";
    if (newUserPasswordInput) {
      newUserPasswordInput.classList.remove("is-invalid");
      newUserPasswordInput.type = "password";
    }
    if (newUserConfirmPasswordInput) {
      newUserConfirmPasswordInput.classList.remove("is-invalid");
      newUserConfirmPasswordInput.type = "password";
    }
    if (confirmPasswordFeedbackDiv)
      confirmPasswordFeedbackDiv.textContent = "Vui lòng xác nhận mật khẩu.";
    // Reset specific password feedback
    if (newUserPasswordFeedbackDiv) {
      newUserPasswordFeedbackDiv.textContent = "Vui lòng nhập mật khẩu.";
    }
    // Reset toggle icons
    if (newUserPasswordToggle) {
      newUserPasswordToggle.src = "/assets/logo_no_hint_password.png";
      newUserPasswordToggle.alt = "Hiện mật khẩu";
    }
    if (newUserConfirmPasswordToggle) {
      newUserConfirmPasswordToggle.src = "/assets/logo_no_hint_password.png";
      newUserConfirmPasswordToggle.alt = "Hiện mật khẩu";
    }
    hideModalFeedback("addUserModalFeedback");
  }

  // Function: Handles the submission of the 'Add New User' form
  async function handleSaveNewUser() {
    hideModalFeedback("addUserModalFeedback"); // Clear previous general feedback
    // Reset individual field validation states before re-validating
    if (newUserPasswordInput)
      newUserPasswordInput.classList.remove("is-invalid");
    if (newUserConfirmPasswordInput)
      newUserConfirmPasswordInput.classList.remove("is-invalid");
    if (confirmPasswordFeedbackDiv)
      confirmPasswordFeedbackDiv.textContent = "Vui lòng xác nhận mật khẩu."; // Default Vietnamese msg
    if (confirmPasswordFeedbackDiv)
      confirmPasswordFeedbackDiv.textContent = "Vui lòng nhập mật khẩu."; // Reset specific password feedback

    // --- Step 1: Basic Form Validation (Checks required) ---
    if (!addUserForm || !addUserForm.checkValidity()) {
      if (addUserForm) addUserForm.classList.add("was-validated");
      showModalFeedback(
        "addUserModalFeedback",
        "Vui lòng điền đầy đủ các trường bắt buộc.",
        "warning"
      );
      return; // Stop if required fields are missing
    }

    // --- Step 2: Password Length Check ---
    const passwordValue = newUserPasswordInput.value;
    if (passwordValue.length < 8) {
      showModalFeedback(
        "addUserModalFeedback",
        "Mật khẩu phải có ít nhất 8 ký tự.", // Specific error message
        "warning"
      );
      // Mark the password field as invalid
      if (newUserPasswordInput)
        newUserPasswordInput.classList.add("is-invalid");
      // Optionally update the specific feedback div under the password input
      if (passwordFeedbackDiv) {
        passwordFeedbackDiv.textContent = "Mật khẩu phải có ít nhất 8 ký tự.";
      }
      return; // Stop submission
    }

    // --- Step 3: Password Confirmation Check ---
    const confirmPasswordValue = newUserConfirmPasswordInput.value;
    if (passwordValue !== confirmPasswordValue) {
      showModalFeedback(
        "addUserModalFeedback",
        "Mật khẩu và mật khẩu xác nhận không khớp.",
        "warning"
      );
      if (newUserPasswordInput)
        newUserPasswordInput.classList.add("is-invalid");
      if (newUserConfirmPasswordInput)
        newUserConfirmPasswordInput.classList.add("is-invalid");
      if (confirmPasswordFeedbackDiv)
        confirmPasswordFeedbackDiv.textContent =
          "Mật khẩu xác nhận không khớp.";
      return; // Stop submission
    }

    // --- Step 4: Show Loading State ---
    if (saveNewUserBtn) saveNewUserBtn.disabled = true;
    if (saveNewUserSpinner) saveNewUserSpinner.style.display = "inline-block";

    // --- Step 5: Prepare Data for API ---
    const userData = {
      username: newUsernameInput.value.trim(),
      password: passwordValue, // Send only the original password
      phone: newUserPhoneInput.value.trim(),
      role: newUserRoleSelect.value
    };

    // --- Step 6: Call API ---
    try {
      await UserService.addNewUser(userData); // Assuming UserService is imported

      // --- Success Actions ---
      showModalFeedback(
        "addUserModalFeedback",
        "Thêm người dùng mới thành công!",
        "success"
      );
      userCurrentPage = 1; // Go to first page
      await fetchAndRenderUiForUsersTab(); // Refresh the user list table

      // Close modal after delay
      setTimeout(() => {
        if (addNewUserModal) addNewUserModal.hide();
      }, 1500);
    } catch (error) {
      // --- Error Handling ---
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể thêm người dùng. Vui lòng thử lại."
      ).toString();
      showModalFeedback(
        "addUserModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      // --- Step 7: Reset Loading State ---
      if (saveNewUserBtn) saveNewUserBtn.disabled = false;
      if (saveNewUserSpinner) saveNewUserSpinner.style.display = "none";
    }
  }

  // --- Occupants Tab: Data Fetching & Filtering Logic ---

  // Function: Fetches occupied rooms and populates the room filter dropdown for the Occupants tab.
  async function populateOccupantRoomFilterDropdown() {
    if (!occupantRoomFilterSelect) return;

    occupantRoomFilterSelect.innerHTML =
      '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Đang tải...</option>';
    occupantRoomFilterSelect.disabled = true;

    try {
      // Fetch only rooms that are currently occupied
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      allOccupiedRoomsForOccupantFilter = rooms || []; // Store globally

      occupantRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option>'; // Reset

      if (allOccupiedRoomsForOccupantFilter.length > 0) {
        allOccupiedRoomsForOccupantFilter.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id; // Use room ID as value
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          occupantRoomFilterSelect.appendChild(option);
        });
      } else {
        occupantRoomFilterSelect.innerHTML +=
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
      occupantRoomFilterSelect.disabled = false;
    } catch (error) {
      console.error(error);
      occupantRoomFilterSelect.innerHTML =
        '<option value="all" selected>Tất cả phòng</option><option value="" disabled>Lỗi tải phòng</option>';
      allOccupiedRoomsForOccupantFilter = []; // Reset on error
    }
  }

  // Function: Fetches occupant data based on current filters/search terms and renders the UI.
  async function fetchAndRenderUiForOccupantsTab() {
    if (occupantTableBody) {
      occupantTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu người thuê...</td></tr>`; // Colspan = 7
    }
    if (occupantPaginationContainer) {
      occupantPaginationContainer.innerHTML = "";
    }

    try {
      // Get filter values from UI elements
      const contractCodeTerm =
        searchOccupantContractCodeInput?.value.trim() || "";
      const cccdTerm = searchOccupantCccdInput?.value.trim() || "";
      const selectedRoomId = occupantRoomFilterSelect?.value || "all";

      // Construct filter object for the API call
      const filter = {};
      if (contractCodeTerm) filter.contractCode = contractCodeTerm; // Assuming backend supports search by contractCode
      if (cccdTerm) filter.cccd = cccdTerm; // Assuming backend supports search by cccd
      if (selectedRoomId !== "all") filter.roomId = selectedRoomId;

      // Fetch occupants using the OccupantService
      const allMatchingOccupants = await OccupantService.getAllOccupants(
        filter
      ); // Use the imported service

      // Update state and render UI
      currentOccupantData = allMatchingOccupants || [];
      totalOccupants = currentOccupantData.length;
      renderOccupantTableUI(); // Render the table with fetched data
    } catch (error) {
      console.error(error);
      if (occupantTableBody) {
        occupantTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu người thuê.</td></tr>`; // Colspan = 7
      }
      currentOccupantData = [];
      totalOccupants = 0;
      renderOccupantPaginationUI(); // Render empty pagination on error
    }
  }

  // --- Occupants Tab: UI Rendering Logic ---

  // Function: Renders the occupant table based on current data and pagination.
  async function renderOccupantTableUI() {
    if (!occupantTableBody) return;
    occupantTableBody.innerHTML = ""; // Clear previous rows

    if (currentOccupantData.length === 0) {
      occupantTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy người thuê nào phù hợp.</td></tr>`; // Colspan = 7
      renderOccupantPaginationUI();
      return;
    }

    // Calculate start and end index for the current page
    const startIndex = (occupantCurrentPage - 1) * occupantsPerPage;
    const endIndex = Math.min(startIndex + occupantsPerPage, totalOccupants);
    const occupantsToDisplay = currentOccupantData.slice(startIndex, endIndex);

    // --- Fetch related data efficiently ---
    const roomIds = [
      ...new Set(occupantsToDisplay.map((occ) => occ.roomId))
    ].filter(Boolean);
    const userIds = [
      ...new Set(occupantsToDisplay.map((occ) => occ.tenantId))
    ].filter(Boolean); // Use tenantId

    const roomPromises = roomIds.map((id) =>
      RoomService.getRoomById(id).catch((e) => {
        console.error(e);
        return null;
      })
    );
    // Assuming UserService has a method like getUserById. Adjust if needed.
    const userPromises = userIds.map((id) =>
      UserService.getUserById(id).catch((e) => {
        console.error(e);
        return null;
      })
    );

    const [roomResults, userResults] = await Promise.all([
      Promise.allSettled(roomPromises),
      Promise.allSettled(userPromises)
    ]);

    const roomDetailsMap = new Map();
    roomResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        roomDetailsMap.set(result.value._id, result.value);
      }
    });

    const userDetailsMap = new Map();
    userResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        userDetailsMap.set(result.value._id, result.value); // Use user._id as key
      }
    });
    // --- End Fetch related data ---

    occupantsToDisplay.forEach((occupant, index) => {
      const row = document.createElement("tr");
      row.dataset.id = occupant._id; // Use occupant's _id
      const sequentialNumber = startIndex + index + 1;

      // Get Room Info
      const roomInfo = roomDetailsMap.get(occupant.roomId);
      const roomDisplay = roomInfo
        ? `P. ${roomInfo.roomNumber || "N/A"} - ĐC. ${
            roomInfo.address || "N/A"
          }`
        : "Phòng không xác định";

      // Get User Info (Username)
      const userInfo = userDetailsMap.get(occupant.tenantId); // Get user by tenantId
      const userDisplay = userInfo ? userInfo.username : "Không có"; // Display username or 'Không có'

      row.innerHTML = `
        <td>${sequentialNumber}</td>
        <td>${roomDisplay}</td>
        <td>${userDisplay}</td>
        <td>${occupant.contractCode || "N/A"}</td>
        <td>${occupant.fullName || "Chưa cập nhật"}</td>
        <td>${occupant.cccd || "Chưa cập nhật"}</td>
        <td class="text-center action-cell">
            <button class="btn btn-sm btn-danger delete-occupant-btn" data-id="${
              occupant._id
            }" title="Xóa người thuê">Xóa</button>
        </td>
      `;

      row.addEventListener("click", (event) => {
        if (event.target.closest(".action-cell")) return;
        window.location.href = `/admin/occupant/details/${occupant._id}`;
      });

      occupantTableBody.appendChild(row);
    });

    renderOccupantPaginationUI(); // Render pagination controls
  }

  // Function: Renders pagination controls for the occupant table.
  function renderOccupantPaginationUI() {
    if (!occupantPaginationContainer) return;
    occupantPaginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalOccupants / occupantsPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === occupantCurrentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#";
      pageNumberLink.textContent = i;

      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== occupantCurrentPage) {
          occupantCurrentPage = i;
          renderOccupantTableUI(); // Re-render the table for the new page
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      occupantPaginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Occupants Tab: Delete Occupant Logic ---
  async function handleDeleteOccupant(occupantId) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa người thuê này không?"
    );
    if (!confirmed) return;

    const deleteButton = occupantTableBody?.querySelector(
      `.delete-occupant-btn[data-id="${occupantId}"]`
    );
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "Xóa";

    // Show loading state
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xóa...`;
    }

    try {
      await OccupantService.deleteOccupant(occupantId);

      // Remove from local data and update total
      const indexToRemove = currentOccupantData.findIndex(
        (occ) => occ._id === occupantId
      );
      if (indexToRemove > -1) {
        currentOccupantData.splice(indexToRemove, 1);
      }
      totalOccupants = currentOccupantData.length;

      // Adjust current page if necessary
      const totalPagesAfterDeletion = Math.ceil(
        totalOccupants / occupantsPerPage
      );
      if (
        occupantCurrentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        occupantCurrentPage = totalPagesAfterDeletion;
      } else if (totalPagesAfterDeletion === 0) {
        occupantCurrentPage = 1;
      }

      renderOccupantTableUI(); // Re-render the table
      // Optionally show success toast
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể xóa người thuê"
      ).toString();
      alert(
        `Lỗi khi xóa người thuê: ${
          errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
        }`
      );
    } finally {
      // Restore button state
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- Occupants Tab: Add New Occupant Modal Logic ---

  // Function: Resets the 'Add New Occupant' form to its default state.
  function resetAddOccupantForm() {
    if (addOccupantForm) {
      addOccupantForm.reset(); // Reset form fields
      addOccupantForm.classList.remove("was-validated"); // Remove validation styling
    }

    // Reset room dropdown
    if (newOccupantRoomIdSelect) {
      newOccupantRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';
      newOccupantRoomIdSelect.disabled = true; // Keep disabled until loaded
    }
    // Reset tenant dropdown
    if (newOccupantTenantIdSelect) {
      newOccupantTenantIdSelect.innerHTML =
        '<option value="" selected>Không có tài khoản</option><option value="loading" disabled>Đang tải tài khoản...</option>';
      newOccupantTenantIdSelect.disabled = true;
    }
    // Clear prefilled contract code
    if (newOccupantContractCodeInput) {
      newOccupantContractCodeInput.value = "";
      newOccupantContractCodeInput.placeholder =
        "Sẽ tự động điền khi chọn phòng";
    }
    activeContractCodeForSelectedRoom = null; // Reset stored contract code

    // Reset image state
    selectedOccupantCccdImageFiles = []; // Clear the array
    renderOccupantCccdImagePreviews(); // Clear the preview area

    // Hide any previous feedback messages
    hideModalFeedback("addOccupantModalFeedback");
  }

  // Function: Fetches occupied rooms and populates the room dropdown in the Add Occupant modal.
  async function loadOccupiedRoomsForOccupantModal() {
    if (!newOccupantRoomIdSelect || !occupantRoomSelectLoadingDiv) return;

    // Show loading state
    newOccupantRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải phòng...</option>';
    newOccupantRoomIdSelect.disabled = true;
    occupantRoomSelectLoadingDiv.style.display = "block";

    try {
      const rooms = await RoomService.getAllRooms({ status: "occupied" });
      // Note: We might need filtering later if a room can only have one 'main' occupant defined this way. For now, load all occupied.

      newOccupantRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>'; // Reset placeholder

      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          // Store contract code potentially later if needed directly
          newOccupantRoomIdSelect.appendChild(option);
        });
        newOccupantRoomIdSelect.disabled = false; // Enable select
      } else {
        newOccupantRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
    } catch (error) {
      console.error(error);
      newOccupantRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      occupantRoomSelectLoadingDiv.style.display = "none"; // Hide loading indicator
    }
  }

  // Function: Fetches tenant users and populates the tenant dropdown in the Add Occupant modal.
  async function loadTenantUsersForOccupantModal() {
    if (!newOccupantTenantIdSelect || !occupantTenantSelectLoadingDiv) return;

    // Show loading state
    newOccupantTenantIdSelect.innerHTML =
      '<option value="" selected>Không có tài khoản</option><option value="loading" disabled>Đang tải tài khoản...</option>';
    newOccupantTenantIdSelect.disabled = true;
    occupantTenantSelectLoadingDiv.style.display = "block";

    try {
      // Step 1 & 2: Fetch both tenants and current occupants concurrently
      const [tenantUsersResponse, occupantsResponse] = await Promise.allSettled(
        [
          UserService.getAllUsers({ role: "tenant" }),
          OccupantService.getAllOccupants({}) // Fetch all occupants to check assignments
        ]
      );

      // Process Tenant Users result
      let allTenantUsers = [];
      if (
        tenantUsersResponse.status === "fulfilled" &&
        tenantUsersResponse.value
      ) {
        allTenantUsers = tenantUsersResponse.value;
      } else if (tenantUsersResponse.status === "rejected") {
        console.error(
          "Error fetching tenant users:",
          tenantUsersResponse.reason
        );
        // Throw an error or handle it gracefully - here we'll let the main catch handle it
        throw new Error("Lỗi khi tải danh sách tài khoản người thuê.");
      }

      // Process Occupants result to get assigned IDs
      let assignedTenantIds = new Set();
      if (occupantsResponse.status === "fulfilled" && occupantsResponse.value) {
        const allOccupants = occupantsResponse.value;
        allOccupants.forEach((occ) => {
          // Add tenantId to the set if it exists
          if (occ.tenantId) {
            // Ensure comparison works correctly (assuming IDs are strings or can be converted)
            assignedTenantIds.add(String(occ.tenantId));
          }
        });
        console.log("Assigned Tenant IDs:", assignedTenantIds); // For debugging
      } else if (occupantsResponse.status === "rejected") {
        // Log the error but don't necessarily block the process.
        // We can still show tenants, just without filtering.
        console.warn(
          "Could not fetch occupants to filter tenant list:",
          occupantsResponse.reason
        );
        // assignedTenantIds will remain empty, so filtering won't occur
        // Optionally show a less critical feedback message later
      }

      // Step 4: Filter Tenant Users
      const availableTenantUsers = allTenantUsers.filter(
        (user) => !assignedTenantIds.has(String(user._id)) // Keep user if their ID is NOT in the assigned set
      );
      console.log("Available (unassigned) Tenant Users:", availableTenantUsers); // For debugging

      // Step 5: Populate Dropdown
      // Reset dropdown, keeping the 'No account' option
      newOccupantTenantIdSelect.innerHTML =
        '<option value="" selected>Không có tài khoản</option>';

      if (availableTenantUsers.length > 0) {
        availableTenantUsers.forEach((user) => {
          const option = document.createElement("option");
          option.value = user._id; // Use user's _id
          option.textContent = `${user.username} (${user.phone || "N/A"})`;
          newOccupantTenantIdSelect.appendChild(option);
        });
      } else {
        // If all tenants are assigned or no tenants exist
        newOccupantTenantIdSelect.innerHTML +=
          '<option value="" disabled>Không có tài khoản người thuê nào khả dụng</option>';
      }

      newOccupantTenantIdSelect.disabled = false; // Enable select
    } catch (error) {
      console.error("Error loading data for occupant tenant selection:", error);
      // Update dropdown to show error state
      newOccupantTenantIdSelect.innerHTML =
        '<option value="" selected>Không có tài khoản</option><option value="" disabled>Lỗi tải tài khoản</option>';
      // Optionally keep it disabled
      // newOccupantTenantIdSelect.disabled = true;
      showModalFeedback(
        "addOccupantModalFeedback",
        error.message || "Lỗi tải danh sách tài khoản.",
        "danger"
      );
    } finally {
      occupantTenantSelectLoadingDiv.style.display = "none"; // Hide loading indicator
    }
  }

  // Function: Handles changes in the room selection dropdown in the Add Occupant modal.
  async function handleOccupantRoomChange() {
    const selectedRoomId = newOccupantRoomIdSelect?.value;
    activeContractCodeForSelectedRoom = null; // Reset contract code
    if (newOccupantContractCodeInput) {
      newOccupantContractCodeInput.value = ""; // Clear display
      newOccupantContractCodeInput.placeholder = "Đang tìm hợp đồng...";
    }

    if (!selectedRoomId) {
      if (newOccupantContractCodeInput)
        newOccupantContractCodeInput.placeholder = "Vui lòng chọn phòng";
      return;
    }

    try {
      const contracts = await ContractService.getAllContracts({
        roomId: selectedRoomId,
        status: "active" // Find only the active contract for this room
      });

      if (contracts && contracts.length > 0) {
        activeContractCodeForSelectedRoom = contracts[0].contractCode; // Store the code
        if (newOccupantContractCodeInput) {
          newOccupantContractCodeInput.value =
            activeContractCodeForSelectedRoom; // Display it
        }
      } else {
        if (newOccupantContractCodeInput) {
          newOccupantContractCodeInput.placeholder =
            "Không tìm thấy hợp đồng đang hoạt động";
        }
        showModalFeedback(
          // Show warning if no active contract found
          "addOccupantModalFeedback",
          "Phòng này hiện không có hợp đồng nào đang hoạt động.",
          "warning"
        );
      }
    } catch (error) {
      console.error(error);
      if (newOccupantContractCodeInput) {
        newOccupantContractCodeInput.placeholder = "Lỗi khi tìm hợp đồng";
      }
      showModalFeedback(
        "addOccupantModalFeedback",
        "Đã xảy ra lỗi khi tìm hợp đồng cho phòng này.",
        "danger"
      );
    }
  }

  // Funtion: Renders previews of selected CCCD images in the 'Add Occupant' modal.
  function renderOccupantCccdImagePreviews() {
    if (!newOccupantCccdImagePreviewDiv) return;
    newOccupantCccdImagePreviewDiv.innerHTML = ""; // Clear previous previews

    selectedOccupantCccdImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        // Use the same class as other modals for consistency
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
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < selectedOccupantCccdImageFiles.length
            ) {
              selectedOccupantCccdImageFiles.splice(indexToRemove, 1);
              renderOccupantCccdImagePreviews(); // Re-render after removal
            }
          });
        newOccupantCccdImagePreviewDiv.appendChild(previewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        const errorItem = document.createElement("div");
        errorItem.className = "image-preview-item text-danger small p-1";
        errorItem.textContent = `Lỗi đọc file`;
        newOccupantCccdImagePreviewDiv.appendChild(errorItem);
      };
      reader.readAsDataURL(file);
    });

    // Show placeholder if no images selected
    if (selectedOccupantCccdImageFiles.length === 0) {
      newOccupantCccdImagePreviewDiv.innerHTML =
        '<p class="text-muted small mb-0">Chưa chọn ảnh nào.</p>';
    }
  }

  // Funtion: Handles the selection of new CCCD image files.
  function handleOccupantCccdImageSelection(event) {
    const files = Array.from(event.target.files);
    // Optional: Add validation for file types or size here if needed
    selectedOccupantCccdImageFiles.push(...files);
    renderOccupantCccdImagePreviews(); // Update the UI
    event.target.value = null; // Reset input value to allow selecting the same file again
  }

  // Function: Handles the submission of the 'Add New Occupant' form.
  async function handleSaveNewOccupant() {
    hideModalFeedback("addOccupantModalFeedback"); // Clear previous messages

    // --- Step 1: Basic Form Validation (Room is required) ---
    if (!addOccupantForm || !newOccupantRoomIdSelect.value) {
      if (!newOccupantRoomIdSelect.value && newOccupantRoomIdSelect) {
        newOccupantRoomIdSelect.classList.add("is-invalid");
      }
      showModalFeedback(
        "addOccupantModalFeedback",
        "Vui lòng chọn phòng.",
        "warning"
      );
      return;
    }
    if (newOccupantRoomIdSelect.value && newOccupantRoomIdSelect) {
      newOccupantRoomIdSelect.classList.remove("is-invalid");
      if (addOccupantForm) addOccupantForm.classList.add("was-validated");
    }

    // --- Step 1.1: Check if contract code was found ---
    if (!activeContractCodeForSelectedRoom) {
      showModalFeedback(
        "addOccupantModalFeedback",
        "Không thể lưu người thuê vì không tìm thấy hợp đồng đang hoạt động cho phòng này.",
        "danger"
      );
      return;
    }

    const selectedRoomId = newOccupantRoomIdSelect.value;

    const selectedRoomInfo = allOccupiedRoomsForOccupantFilter.find(
      (room) => room._id === selectedRoomId
    );
    const maxOccupants = selectedRoomInfo?.occupantsNumber || 0;

    if (maxOccupants <= 0) {
      console.warn(
        "Could not determine max occupants for room or max is 0:",
        selectedRoomId
      );
    } else {
      try {
        const countFilter = {
          roomId: selectedRoomId,
          contractCode: activeContractCodeForSelectedRoom
        };
        const currentOccupantsInRoom = await OccupantService.getAllOccupants(
          countFilter
        );
        const currentOccupantCount = currentOccupantsInRoom.length;

        if (currentOccupantCount >= maxOccupants) {
          showModalFeedback(
            "addOccupantModalFeedback",
            `Phòng đã đủ số người tối đa (${maxOccupants}). Không thể thêm người thuê mới.`,
            "danger"
          );
          return;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(
            "No existing occupants found for this room/contract, proceeding."
          );
        } else {
          console.error(error);
          showModalFeedback(
            "addOccupantModalFeedback",
            "Lỗi khi kiểm tra số lượng người thuê hiện tại. Vui lòng thử lại.",
            "danger"
          );
          return;
        }
      }
    }

    // --- Step 2: Prepare Data Object ---
    const occupantData = {
      roomId: selectedRoomId,
      contractCode: activeContractCodeForSelectedRoom,
      tenantId: newOccupantTenantIdSelect.value || null,
      fullName: newOccupantFullNameInput.value.trim() || null,
      birthday: newOccupantBirthdayInput.value || null,
      address: newOccupantAddressInput.value.trim() || null,
      cccd: newOccupantCccdInput.value.trim() || null
    };

    // --- Step 3: Prepare FormData ---
    const formData = new FormData();
    for (const key in occupantData) {
      if (occupantData[key] !== null && occupantData[key] !== undefined) {
        formData.append(key, occupantData[key]);
      }
    }
    selectedOccupantCccdImageFiles.forEach((file) => {
      formData.append("cccdImages", file);
    });

    // --- Step 4: API Call & Feedback ---
    if (saveNewOccupantBtn) saveNewOccupantBtn.disabled = true;
    if (saveNewOccupantSpinner)
      saveNewOccupantSpinner.style.display = "inline-block";

    try {
      await OccupantService.addNewOccupant(formData);

      showModalFeedback(
        "addOccupantModalFeedback",
        "Thêm người thuê mới thành công!",
        "success"
      );
      occupantCurrentPage = 1;
      await fetchAndRenderUiForOccupantsTab();

      setTimeout(() => {
        if (addNewOccupantModal) addNewOccupantModal.hide();
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = (
        error?.response?.data?.message ||
        error.message ||
        "Không thể lưu người thuê. Vui lòng thử lại."
      ).toString();
      showModalFeedback(
        "addOccupantModalFeedback",
        `Lỗi: ${errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)}`,
        "danger"
      );
    } finally {
      if (saveNewOccupantBtn) saveNewOccupantBtn.disabled = false;
      if (saveNewOccupantSpinner) saveNewOccupantSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---

  // Event Listeners: Navigation
  navItems.forEach((navItem) => {
    if (!navItem.classList.contains("logout-tab")) {
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
  if (searchContractBtn) {
    searchContractBtn.addEventListener("click", () => {
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
        console.error(error);
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
        console.error(error);
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
        selectedOption?.dataset.defaultRentPrice || 0
      );

      // --- Reset fields while loading new data ---
      if (newInvoiceUtilitiesListDiv) {
        newInvoiceUtilitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Đang tải dữ liệu phòng...</p>';
      }
      activeContractUtilities = [];
      activeContractRentPrice = defaultRentPrice;
      if (newInvoiceRentAmountInput) {
        newInvoiceRentAmountInput.value = activeContractRentPrice;
      }
      // Clear old indices initially while loading
      if (newInvoiceElecOldIndexInput) newInvoiceElecOldIndexInput.value = "";
      if (newInvoiceWaterOldIndexInput) newInvoiceWaterOldIndexInput.value = "";
      calculateTotalAmount();

      if (!selectedRoomId) {
        // Reset if no room is selected
        if (newInvoiceUtilitiesListDiv) {
          newInvoiceUtilitiesListDiv.innerHTML =
            '<p class="text-muted small m-0">Vui lòng chọn phòng.</p>';
        }
        loadUtilitiesForInvoiceModal([]); // Clear utilities display
        if (newInvoiceRentAmountInput)
          newInvoiceRentAmountInput.value = defaultRentPrice;
        activeContractRentPrice = defaultRentPrice;
        if (newInvoiceElecOldIndexInput) newInvoiceElecOldIndexInput.value = 0;
        if (newInvoiceWaterOldIndexInput)
          newInvoiceWaterOldIndexInput.value = 0;
        calculateTotalAmount();
        return;
      }

      // --- Combined Fetching Logic ---
      try {
        // 1. Fetch Active Contract (for rent price and utilities)
        let contractUtilities = [];
        let contractRent = defaultRentPrice; // Start with default
        try {
          const contracts = await ContractService.getAllContracts({
            roomId: selectedRoomId,
            status: "active"
          });
          if (contracts && contracts.length > 0) {
            const activeContract = contracts[0];
            contractUtilities = activeContract.utilities || [];
            contractRent = activeContract.rentPrice || defaultRentPrice;
            activeContractUtilities = contractUtilities.map((u) =>
              typeof u === "object" ? u._id : u
            ); // Store IDs
            activeContractCode = activeContract.contractCode;
          } else {
            // No active contract
            activeContractUtilities = [];
            showModalFeedback(
              "addInvoiceModalFeedback",
              "Phòng này không có hợp đồng hiệu lực. Sử dụng giá thuê mặc định.",
              "info" // Use info or warning
            );
          }
        } catch (contractError) {
          console.error("Error fetching contract:", contractError);
          // Continue with default rent, clear utilities, show warning
          activeContractUtilities = [];
          contractRent = defaultRentPrice;
          showModalFeedback(
            "addInvoiceModalFeedback",
            "Lỗi khi tải hợp đồng. Sử dụng giá thuê mặc định.",
            "warning"
          );
        }

        // Update UI based on contract fetch results
        activeContractRentPrice = contractRent;
        if (newInvoiceRentAmountInput) {
          newInvoiceRentAmountInput.value = activeContractRentPrice;
        }
        await loadUtilitiesForInvoiceModal(contractUtilities); // Load utilities based on what was found

        // 2. Fetch Latest Previous Invoice (for old indices)
        let latestPreviousInvoice = null;
        try {
          // Fetch invoices for the room, sorted by issueDate descending
          // Ideally, backend supports sorting & limiting: ?sort=-issueDate&limit=1
          // Client-side sort as fallback:
          const previousInvoices = await InvoiceService.getAllInvoices({
            roomId: selectedRoomId
          });

          if (previousInvoices && previousInvoices.length > 0) {
            // Sort descending by issueDate to find the most recent
            previousInvoices.sort((a, b) => {
              const dateA = a.issueDate ? new Date(a.issueDate) : new Date(0); // Handle potentially missing dates
              const dateB = b.issueDate ? new Date(b.issueDate) : new Date(0);
              return dateB - dateA; // Descending
            });
            latestPreviousInvoice = previousInvoices[0];
            console.log(
              "Latest previous invoice found:",
              latestPreviousInvoice
            );
          } else {
            console.log("No previous invoices found for this room.");
          }
        } catch (invoiceError) {
          // Handle 404 Not Found specifically - it's not an error, just means no invoices yet
          if (invoiceError.response && invoiceError.response.status === 404) {
            console.log("No previous invoices found for this room (404).");
            latestPreviousInvoice = null;
          } else {
            // Log other errors
            console.error("Error fetching previous invoices:", invoiceError);
            latestPreviousInvoice = null; // Ensure it's null on error
            // Optionally show a warning to the user about index prefill failing
            showModalFeedback(
              "addInvoiceModalFeedback",
              "Không thể tải chỉ số cũ từ hóa đơn trước.",
              "warning"
            );
          }
        }

        // 3. Set Old Indices based on latestPreviousInvoice
        const oldElecIndex = latestPreviousInvoice?.electricity?.newIndex ?? 0; // Default to 0 if not found
        const oldWaterIndex = latestPreviousInvoice?.water?.newIndex ?? 0; // Default to 0 if not found

        if (newInvoiceElecOldIndexInput) {
          newInvoiceElecOldIndexInput.value = oldElecIndex;
        }
        if (newInvoiceWaterOldIndexInput) {
          newInvoiceWaterOldIndexInput.value = oldWaterIndex;
        }
        console.log(
          `Prefilled Old Indices - Elec: ${oldElecIndex}, Water: ${oldWaterIndex}`
        );
      } catch (error) {
        // --- Main Error Handling (e.g., if something unexpected breaks) ---
        console.error("Error processing room change details:", error);
        showModalFeedback(
          "addInvoiceModalFeedback",
          `Lỗi: ${
            error.message || "Không thể tải đầy đủ chi tiết cho phòng này."
          }`,
          "danger"
        );
        // Reset fields to a safe state on major error
        if (newInvoiceRentAmountInput)
          newInvoiceRentAmountInput.value = defaultRentPrice;
        activeContractRentPrice = defaultRentPrice;
        loadUtilitiesForInvoiceModal([]);
        if (newInvoiceElecOldIndexInput) newInvoiceElecOldIndexInput.value = 0;
        if (newInvoiceWaterOldIndexInput)
          newInvoiceWaterOldIndexInput.value = 0;
      } finally {
        // --- Always Recalculate Total ---
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

  // Event Listeners: Expenses Tab Filters & Actions
  if (searchExpenseBtn) {
    searchExpenseBtn.addEventListener("click", () => {
      expenseCurrentPage = 1; // Reset to page 1 on filter/search
      fetchAndRenderUiForExpensesTab();
    });
  }

  if (searchExpenseInput) {
    // Allow searching on Enter key press
    searchExpenseInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        expenseCurrentPage = 1;
        fetchAndRenderUiForExpensesTab();
      }
    });
  }

  if (applyExpenseFiltersBtn) {
    applyExpenseFiltersBtn.addEventListener("click", () => {
      expenseCurrentPage = 1;
      fetchAndRenderUiForExpensesTab();
    });
  }

  // Event Listener: Expense Table
  if (expenseTableBody) {
    expenseTableBody.addEventListener("click", (event) => {
      // Check if the clicked element is a delete button
      const deleteButton = event.target.closest(".delete-expense-btn");
      if (deleteButton) {
        event.stopPropagation(); // Prevent row click listener from firing
        const expenseId = deleteButton.dataset.id;
        handleDeleteExpense(expenseId); // Call delete handler
      }
    });
  }

  // Event Listeners: Add New Expense Modal
  if (addNewExpenseBtn && addNewExpenseModal) {
    addNewExpenseBtn.addEventListener("click", () => {
      resetAddExpenseForm(); // Reset form before showing
      addNewExpenseModal.show();
      loadRoomsForExpenseModal().catch((error) => {
        console.error(error);
        showModalFeedback(
          "addExpenseModalFeedback",
          "Lỗi khi tải danh sách phòng. Vui lòng thử đóng và mở lại.",
          "danger"
        );
      });
    });
  }

  // Reset form when the modal is fully hidden
  if (addNewExpenseModalElement) {
    addNewExpenseModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddExpenseForm
    );
  }

  // Trigger file input when the custom "Select Images" button is clicked
  if (selectExpenseImagesBtn && newExpenseImagesInput) {
    selectExpenseImagesBtn.addEventListener(
      "click",
      () => newExpenseImagesInput.click() // Open file dialog
    );
  }

  // Handle file selection when the hidden file input changes
  if (newExpenseImagesInput) {
    newExpenseImagesInput.addEventListener(
      "change",
      handleExpenseImageSelection
    );
  }

  // Save new expense when the modal's save button is clicked
  if (saveNewExpenseBtn) {
    saveNewExpenseBtn.addEventListener("click", handleSaveNewExpense);
  }

  // Event Listeners: Users Tab Filters & Actions
  // Search button click
  if (searchUserBtn) {
    searchUserBtn.addEventListener("click", () => {
      userCurrentPage = 1;
      fetchAndRenderUiForUsersTab();
    });
  }

  // Search input Enter key press
  if (searchUserInput) {
    searchUserInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        userCurrentPage = 1;
        fetchAndRenderUiForUsersTab();
      }
    });
  }

  // Apply filters button click
  if (applyUserFiltersBtn) {
    applyUserFiltersBtn.addEventListener("click", () => {
      userCurrentPage = 1;
      fetchAndRenderUiForUsersTab();
    });
  }

  // Event Listener: User Table Delete Button
  if (userTableBody) {
    userTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-user-btn");
      if (deleteButton) {
        event.stopPropagation();
        const userId = deleteButton.dataset.id;
        if (userId) handleDeleteUser(userId);
      }
    });
  }

  // Event Listeners: Add New User Modal
  // Open modal button click
  if (addNewUserBtn && addNewUserModal) {
    addNewUserBtn.addEventListener("click", () => {
      resetAddUserForm();
      addNewUserModal.show();
    });
  }

  // Reset form when modal is hidden
  if (addNewUserModalElement) {
    addNewUserModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddUserForm
    );
  }

  // Save button click inside modal
  if (saveNewUserBtn) {
    saveNewUserBtn.addEventListener("click", handleSaveNewUser);
  }

  // Password toggle icon clicks
  if (newUserPasswordToggle && newUserPasswordInput) {
    newUserPasswordToggle.addEventListener("click", () =>
      togglePasswordVisibility(newUserPasswordInput, newUserPasswordToggle)
    );
  }
  if (newUserConfirmPasswordToggle && newUserConfirmPasswordInput) {
    newUserConfirmPasswordToggle.addEventListener("click", () =>
      togglePasswordVisibility(
        newUserConfirmPasswordInput,
        newUserConfirmPasswordToggle
      )
    );
  }

  // Event Listeners: Occupants Tab Actions
  if (searchOccupantBtn) {
    searchOccupantBtn.addEventListener("click", () => {
      occupantCurrentPage = 1; // Reset page on new search/filter
      fetchAndRenderUiForOccupantsTab();
    });
  }
  // Allow searching on Enter key press in both search inputs
  [searchOccupantContractCodeInput, searchOccupantCccdInput].forEach(
    (input) => {
      if (input) {
        input.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            occupantCurrentPage = 1;
            fetchAndRenderUiForOccupantsTab();
          }
        });
      }
    }
  );

  if (applyOccupantFiltersBtn) {
    applyOccupantFiltersBtn.addEventListener("click", () => {
      occupantCurrentPage = 1;
      fetchAndRenderUiForOccupantsTab();
    });
  }

  // Event delegation for delete buttons in the occupant table
  if (occupantTableBody) {
    occupantTableBody.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-occupant-btn");
      if (deleteButton) {
        event.stopPropagation(); // Prevent row click
        const occupantId = deleteButton.dataset.id;
        if (occupantId) {
          handleDeleteOccupant(occupantId);
        }
      }
    });
  }

  // Event Listeners: Add New Occupant Modal
  if (addNewOccupantBtn && addNewOccupantModal) {
    addNewOccupantBtn.addEventListener("click", () => {
      resetAddOccupantForm(); // Reset first
      addNewOccupantModal.show();
      // Load dropdown data after showing modal
      Promise.all([
        loadOccupiedRoomsForOccupantModal(),
        loadTenantUsersForOccupantModal()
      ]).catch((error) => {
        console.error(error);
        showModalFeedback(
          "addOccupantModalFeedback",
          "Lỗi tải dữ liệu cần thiết cho biểu mẫu.",
          "danger"
        );
      });
    });
  }

  // Reset form when the modal is fully hidden
  if (addNewOccupantModalElement) {
    addNewOccupantModalElement.addEventListener(
      "hidden.bs.modal",
      resetAddOccupantForm
    );
  }

  // Listener for room selection change to prefill contract code
  if (newOccupantRoomIdSelect) {
    newOccupantRoomIdSelect.addEventListener(
      "change",
      handleOccupantRoomChange
    );
  }

  // Trigger file input when the custom "Select Images" button is clicked
  if (selectOccupantCccdImagesBtn && newOccupantCccdImagesInput) {
    selectOccupantCccdImagesBtn.addEventListener(
      "click",
      () => newOccupantCccdImagesInput.click() // Open file dialog
    );
  }

  // Handle file selection when the hidden file input changes
  if (newOccupantCccdImagesInput) {
    newOccupantCccdImagesInput.addEventListener(
      "change",
      handleOccupantCccdImageSelection
    );
  }

  // Save new occupant when the modal's save button is clicked
  if (saveNewOccupantBtn) {
    saveNewOccupantBtn.addEventListener("click", handleSaveNewOccupant);
  }

  // Event Listener for Logout Link (Specific Handler)
  if (logoutLink) {
    logoutLink.addEventListener("click", async (event) => {
      event.preventDefault(); // Stop default link behavior

      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn đăng xuất không?"
      );
      if (!confirmed) {
        return; // Stop if user cancels
      }

      logoutLink.style.pointerEvents = "none"; // Make it unclickable

      try {
        // Call the logout method from UserService
        await UserService.logoutUser(); // Assumes this handles API call and localStorage removal
      } catch (error) {
        console.error(error);
        // Ensure client-side cleanup even if API fails
        localStorage.removeItem("accessToken");
        alert(
          "Đã xảy ra lỗi khi đăng xuất khỏi máy chủ, nhưng bạn sẽ được đăng xuất khỏi trình duyệt này."
        );
      } finally {
        // Always redirect to the login page
        // ADJUST THE PATH if your login page is different
        window.location.replace("/");
      }
    });
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

    // Initialize Expenses Tab
    await populateExpenseRoomFilterDropdown(); // For expense filter
    await fetchAndRenderUiForExpensesTab();

    // Initialize Users Tab
    await fetchAndRenderUiForUsersTab();

    // Initialize Occupants Tab
    await populateOccupantRoomFilterDropdown(); // For occupant filter
    await fetchAndRenderUiForOccupantsTab();

    // ... Initialize other tabs as needed ...
  }

  initializePage(); // Execute initialization
});
