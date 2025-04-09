import InvoiceService from "../services/InvoiceService.js";
import RoomService from "../services/RoomService.js";
import UtilityService from "../services/UtilityService.js";
import ContractService from "../services/ContractService.js";

// --- Global Scope: State Variables ---
// --- State for Invoice Editing ---
let currentInvoiceId = null;
let currentInvoiceData = null;
let allOccupiedRooms = [];
let allUtilitiesData = [];
let activeContractUtilities = [];
let activeContractRentPrice = 0;

// --- Store mapping for Utility name ---
const utilityNameMap = {
  wifi: "Wifi",
  parking: "Đỗ xe",
  cleaning: "Vệ sinh hàng tuần"
};

// --- Store mapping for Payment Method name ---
const paymentMethodMap = {
  "": "Chọn phương thức...",
  cash: "Tiền mặt",
  banking: "Chuyển khoản"
};

// --- Store mapping for Payment Status name ---
const paymentStatusMap = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  overdue: "Đã quá hạn"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const editInvoiceForm = document.getElementById("editInvoiceForm");
  const invoiceCodeInput = document.getElementById("invoiceCode");
  const invoiceRoomIdSelect = document.getElementById("invoiceRoomId");
  const invoiceRoomSelectLoadingDiv = document.getElementById(
    "invoiceRoomSelectLoading"
  );
  const invoiceRentAmountInput = document.getElementById("invoiceRentAmount");
  const invoiceIssueDateInput = document.getElementById("invoiceIssueDate");
  const invoiceDueDateInput = document.getElementById("invoiceDueDate");
  const invoicePaymentStatusSelect = document.getElementById(
    "invoicePaymentStatus"
  );
  const paymentDateGroup = document.getElementById("paymentDateGroup");
  const invoicePaymentDateInput = document.getElementById("invoicePaymentDate");
  const invoicePaymentMethodSelect = document.getElementById(
    "invoicePaymentMethod"
  );
  const invoiceTotalAmountInput = document.getElementById("invoiceTotalAmount");
  const invoiceNotesInput = document.getElementById("invoiceNotes");
  const invoiceElecOldIndexInput = document.getElementById(
    "invoiceElecOldIndex"
  );
  const invoiceElecNewIndexInput = document.getElementById(
    "invoiceElecNewIndex"
  );
  const invoiceElecPricePerUnitInput = document.getElementById(
    "invoiceElecPricePerUnit"
  );
  const invoiceWaterOldIndexInput = document.getElementById(
    "invoiceWaterOldIndex"
  );
  const invoiceWaterNewIndexInput = document.getElementById(
    "invoiceWaterNewIndex"
  );
  const invoiceWaterPricePerUnitInput = document.getElementById(
    "invoiceWaterPricePerUnit"
  );
  const invoiceUtilitiesListDiv = document.getElementById(
    "invoiceUtilitiesList"
  );
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const markAsPaidBtn = document.getElementById("markAsPaidBtn");
  const editInvoiceFeedbackDiv = document.getElementById(
    "editInvoiceModalFeedback"
  );
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");
  const markAsPaidSpinner = markAsPaidBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the Invoice ID from the current URL path.
  function getInvoiceIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (success/error) on the page.
  function showModalFeedback(message, type = "danger") {
    if (editInvoiceFeedbackDiv) {
      editInvoiceFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editInvoiceFeedbackDiv.className = `alert alert-${type} mt-3`;
      editInvoiceFeedbackDiv.style.display = "block";
      editInvoiceFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides the feedback message area.
  function hideModalFeedback() {
    if (editInvoiceFeedbackDiv) {
      editInvoiceFeedbackDiv.style.display = "none";
      editInvoiceFeedbackDiv.textContent = "";
      editInvoiceFeedbackDiv.className = "alert";
    }
  }

  // Function: Formats date object or string to YYYY-MM-DD for input[type=date]
  function formatDateForInput(dateStringOrObject) {
    if (!dateStringOrObject) return "";
    try {
      const date = new Date(dateStringOrObject);
      if (isNaN(date.getTime())) {
        console.error(dateStringOrObject);
        return "";
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  // --- Calculation Functions ---

  // Function: Calculates and updates the total invoice amount based on current form values.
  function calculateTotalAmount() {
    if (!invoiceTotalAmountInput) return;

    let total = 0;

    // 1. Rent Amount (Use the stored activeContractRentPrice)
    total += activeContractRentPrice || 0;

    // 2. Electricity Cost
    const elecOld = parseFloat(invoiceElecOldIndexInput?.value || 0);
    const elecNew = parseFloat(invoiceElecNewIndexInput?.value || 0);
    const elecPrice = parseFloat(invoiceElecPricePerUnitInput?.value || 0);
    if (elecNew >= elecOld && elecPrice > 0) {
      total += (elecNew - elecOld) * elecPrice;
    }

    // 3. Water Cost
    const waterOld = parseFloat(invoiceWaterOldIndexInput?.value || 0);
    const waterNew = parseFloat(invoiceWaterNewIndexInput?.value || 0);
    const waterPrice = parseFloat(invoiceWaterPricePerUnitInput?.value || 0);
    if (waterNew >= waterOld && waterPrice > 0) {
      total += (waterNew - waterOld) * waterPrice;
    }

    // 4. Utilities Cost (Sum prices from the activeContractUtilities array)
    activeContractUtilities.forEach((utility) => {
      total += utility.price || 0;
    });

    // Update the display (read-only input)
    invoiceTotalAmountInput.value = total;
  }

  // --- UI Rendering Functions ---

  // Function: Renders the list of utilities based on the active contract.
  function renderUtilitiesListDisplay() {
    if (!invoiceUtilitiesListDiv) return;
    invoiceUtilitiesListDiv.innerHTML = ""; // Clear previous content

    if (activeContractUtilities && activeContractUtilities.length > 0) {
      activeContractUtilities.forEach((utility) => {
        const div = document.createElement("div");
        div.classList.add("utility-item", "mb-1"); // Simple display class

        const utilityDisplayName =
          utilityNameMap[utility.name] ||
          (utility.name
            ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
            : "Tiện ích");
        const priceDisplay = (utility.price || 0).toLocaleString("vi-VN");

        // Display as simple text, not checkboxes, as they come from the contract
        div.innerHTML = `
                <span class="utility-name">${utilityDisplayName}</span>
                <span class="utility-price float-end">(+${priceDisplay} VNĐ)</span>
            `;
        invoiceUtilitiesListDiv.appendChild(div);
      });
    } else {
      invoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Phòng này không có tiện ích nào được đăng ký trong hợp đồng đang hoạt động.</p>';
    }
  }

  // Function: Renders the room selection dropdown (Occupied rooms + original invoice room).
  async function renderRoomSelectionDropdown() {
    if (!invoiceRoomIdSelect || !invoiceRoomSelectLoadingDiv) return;

    invoiceRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    invoiceRoomIdSelect.disabled = true;
    invoiceRoomSelectLoadingDiv.style.display = "block";

    try {
      // Add the original invoice's room to the list if it exists and isn't already there
      let currentInvoiceRoomDetails = null;
      if (
        currentInvoiceData?.roomId &&
        !allOccupiedRooms.some((room) => room._id === currentInvoiceData.roomId)
      ) {
        try {
          currentInvoiceRoomDetails = await RoomService.getRoomById(
            currentInvoiceData.roomId
          );
          if (currentInvoiceRoomDetails) {
            allOccupiedRooms.push(currentInvoiceRoomDetails); // Temporarily add for display
          }
        } catch (roomFetchError) {
          console.warn(roomFetchError);
        }
      }

      // Reset dropdown
      invoiceRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';

      if (allOccupiedRooms.length > 0) {
        allOccupiedRooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          } (Phòng gốc hóa đơn)`;
          // Store default rent price for fallback
          option.dataset.defaultRentPrice = room.rentPrice || 0;

          // Mark the contract's current room as selected
          if (room._id === currentInvoiceData?.roomId) {
            option.selected = true;
          }
          invoiceRoomIdSelect.appendChild(option);
        });
        invoiceRoomIdSelect.disabled = false;
      } else {
        invoiceRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
    } catch (error) {
      console.error(error);
      invoiceRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      invoiceRoomSelectLoadingDiv.style.display = "none";
    }
  }

  // --- Data Fetching and Population ---

  // Function: Fetches the active contract for a room and updates related state/UI.
  async function loadContractDataForRoom(roomId) {
    // Reset state related to contract
    activeContractUtilities = [];
    activeContractRentPrice = 0; // Reset before fetching

    // Find the selected room's default rent price from the dropdown options
    const selectedOption = Array.from(invoiceRoomIdSelect.options).find(
      (opt) => opt.value === roomId
    );
    const defaultRentPrice = parseFloat(
      selectedOption?.dataset.defaultRentPrice || 0
    );
    activeContractRentPrice = defaultRentPrice; // Set default initially

    if (!roomId) {
      renderUtilitiesListDisplay(); // Show empty state
      if (invoiceRentAmountInput) invoiceRentAmountInput.value = 0;
      calculateTotalAmount();
      return;
    }

    try {
      const contracts = await ContractService.getAllContracts({
        roomId: roomId,
        status: "active" // Look for the active contract
      });

      if (contracts && contracts.length > 0) {
        const activeContract = contracts[0];

        // Use contract's rent price if available
        activeContractRentPrice = activeContract.rentPrice || defaultRentPrice;

        // Get utility IDs from the contract
        const contractUtilityIds = activeContract.utilities || [];

        // Map IDs to full utility details from globally loaded data
        activeContractUtilities = contractUtilityIds
          .map((utilId) =>
            allUtilitiesData.find((utilDef) => utilDef._id === utilId)
          )
          .filter(Boolean); // Filter out any not found utilities
      } else {
        // No active contract found, use default rent and no utilities
        activeContractUtilities = [];
        activeContractRentPrice = defaultRentPrice;
        // Optionally show a message in the utilities area
        if (invoiceUtilitiesListDiv) {
          invoiceUtilitiesListDiv.innerHTML =
            '<p class="text-info small m-0">Không tìm thấy hợp đồng đang hoạt động cho phòng này.</p>';
        }
      }
    } catch (error) {
      console.error(error);
      // Fallback to default rent and no utilities on error
      activeContractUtilities = [];
      activeContractRentPrice = defaultRentPrice;
      showModalFeedback("Lỗi khi tải thông tin hợp đồng.", "warning");
      if (invoiceUtilitiesListDiv) {
        invoiceUtilitiesListDiv.innerHTML =
          '<p class="text-danger small m-0">Lỗi tải tiện ích từ hợp đồng.</p>';
      }
    } finally {
      // Update UI after fetching (or failing to fetch) contract data
      if (invoiceRentAmountInput) {
        invoiceRentAmountInput.value = activeContractRentPrice;
      }
      renderUtilitiesListDisplay();
      calculateTotalAmount();
    }
  }

  // Function: Fetches all necessary data and populates the form UI on initial load.
  async function fetchAndRenderUiInvoiceDetails() {
    currentInvoiceId = getInvoiceIdFromUrl();
    if (!currentInvoiceId) {
      showModalFeedback(
        "Không tìm thấy ID hóa đơn hợp lệ trong URL.",
        "danger"
      );
      if (editInvoiceForm) editInvoiceForm.style.display = "none";
      return;
    }

    // Reset state
    currentInvoiceData = null;
    allOccupiedRooms = [];
    allUtilitiesData = [];
    activeContractUtilities = [];
    activeContractRentPrice = 0;

    hideModalFeedback();
    if (editInvoiceForm) editInvoiceForm.style.display = "block";
    if (invoiceUtilitiesListDiv)
      invoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải dữ liệu...</p>';

    try {
      // Fetch invoice details, all occupied rooms, and all utility definitions concurrently
      const [invoiceDetails, occupiedRooms, utilities] = await Promise.all([
        InvoiceService.getInvoiceById(currentInvoiceId),
        RoomService.getAllRooms({ status: "occupied" }), // Fetch occupied rooms
        UtilityService.getAllUtilities()
      ]);

      currentInvoiceData = invoiceDetails;
      allOccupiedRooms = occupiedRooms || [];
      allUtilitiesData = utilities || [];

      // Populate basic form fields first
      populateFormFieldsBasicInfo();

      // Render room dropdown
      await renderRoomSelectionDropdown(); // Needs allOccupiedRooms

      // Load contract data (and subsequently utilities/rent) for the initially selected room
      // This will also trigger the first calculateTotalAmount
      await loadContractDataForRoom(currentInvoiceData.roomId);

      // Attach listeners for inputs that trigger recalculation
      setupCalculationListeners();

      // Ensure form validation state is reset
      if (editInvoiceForm) editInvoiceForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu hóa đơn: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editInvoiceForm) editInvoiceForm.style.display = "none";
    }
  }

  // Function: Populates basic form fields with current Invoice data.
  function populateFormFieldsBasicInfo() {
    if (!currentInvoiceData || !editInvoiceForm) return;

    if (invoiceCodeInput) {
      invoiceCodeInput.value = currentInvoiceData.invoiceCode || "N/A";
    }
    // Room selection is handled by renderRoomSelectionDropdown
    if (invoiceRentAmountInput) {
      // This will be overwritten by loadContractDataForRoom, but set initial value
      invoiceRentAmountInput.value = currentInvoiceData.rentAmount || 0;
    }
    if (invoiceIssueDateInput) {
      invoiceIssueDateInput.value = formatDateForInput(
        currentInvoiceData.issueDate
      );
    }
    if (invoiceDueDateInput) {
      invoiceDueDateInput.value = formatDateForInput(
        currentInvoiceData.dueDate
      );
    }
    if (invoicePaymentStatusSelect) {
      invoicePaymentStatusSelect.value =
        currentInvoiceData.paymentStatus || "pending";
      // Trigger change handler to show/hide payment date initially
      handleStatusChange();
    }
    if (invoicePaymentDateInput) {
      invoicePaymentDateInput.value = formatDateForInput(
        currentInvoiceData.paymentDate
      ); // Populate if already paid
    }
    if (invoicePaymentMethodSelect) {
      invoicePaymentMethodSelect.value = currentInvoiceData.paymentMethod || ""; // Set to '' if null/undefined
    }
    if (invoiceTotalAmountInput) {
      // Will be calculated, but set placeholder or initial value if available
      invoiceTotalAmountInput.value = currentInvoiceData.totalAmount || "";
    }
    if (invoiceNotesInput) {
      invoiceNotesInput.value = currentInvoiceData.notes || "";
    }
    // Electricity
    if (invoiceElecOldIndexInput) {
      invoiceElecOldIndexInput.value =
        currentInvoiceData.electricity?.oldIndex ?? "";
    }
    if (invoiceElecNewIndexInput) {
      invoiceElecNewIndexInput.value =
        currentInvoiceData.electricity?.newIndex ?? "";
    }
    if (invoiceElecPricePerUnitInput) {
      invoiceElecPricePerUnitInput.value =
        currentInvoiceData.electricity?.pricePerUnit ?? "";
    }
    // Water
    if (invoiceWaterOldIndexInput) {
      invoiceWaterOldIndexInput.value =
        currentInvoiceData.water?.oldIndex ?? "";
    }
    if (invoiceWaterNewIndexInput) {
      invoiceWaterNewIndexInput.value =
        currentInvoiceData.water?.newIndex ?? "";
    }
    if (invoiceWaterPricePerUnitInput) {
      invoiceWaterPricePerUnitInput.value =
        currentInvoiceData.water?.pricePerUnit ?? "";
    }
    // Utilities list is populated by renderUtilitiesListDisplay via loadContractDataForRoom
  }

  // --- Event Handlers ---

  // Function: Handles the change event for the Room selection dropdown.
  function handleRoomChange(event) {
    const newRoomId = event.target.value;
    if (newRoomId) {
      loadContractDataForRoom(newRoomId); // Reload contract data, utilities, rent, and recalculate total
    }
  }

  // Function: Handles input changes for fields affecting the total calculation.
  function handleCalculationInputChange() {
    // Simple validation for indices before calculating
    const elecOld = parseFloat(invoiceElecOldIndexInput?.value || 0);
    const elecNew = parseFloat(invoiceElecNewIndexInput?.value || 0);
    const waterOld = parseFloat(invoiceWaterOldIndexInput?.value || 0);
    const waterNew = parseFloat(invoiceWaterNewIndexInput?.value || 0);

    if (elecNew < elecOld) {
      invoiceElecNewIndexInput?.classList.add("is-invalid");
    } else {
      invoiceElecNewIndexInput?.classList.remove("is-invalid");
    }
    if (waterNew < waterOld) {
      invoiceWaterNewIndexInput?.classList.add("is-invalid");
    } else {
      invoiceWaterNewIndexInput?.classList.remove("is-invalid");
    }

    calculateTotalAmount();
  }

  // Function: Handles changes in the Payment Status dropdown.
  function handleStatusChange() {
    const isPaid = invoicePaymentStatusSelect.value === "paid";
    if (paymentDateGroup) {
      paymentDateGroup.style.display = isPaid ? "block" : "none";
    }
    // If status changes *away* from 'paid', clear the date and method maybe?
    // Or just leave them as they were for historical record. Hiding is enough.
    // We only require method selection when *marking* as paid.
    if (!isPaid) {
      invoicePaymentMethodSelect?.classList.remove("is-invalid"); // Remove highlight if changing away from paid
    }
  }

  // Function: Handles the 'Mark as Paid' button click.
  async function handleMarkAsPaid() {
    hideModalFeedback();

    const paymentMethod = invoicePaymentMethodSelect.value;
    // Require a payment method selection *before* marking as paid
    if (!paymentMethod || paymentMethod === "all") {
      showModalFeedback(
        "Vui lòng chọn phương thức thanh toán trước khi đánh dấu đã thanh toán.",
        "warning"
      );
      invoicePaymentMethodSelect.classList.add("is-invalid"); // Highlight the dropdown
      invoicePaymentMethodSelect.focus();
      return;
    } else {
      invoicePaymentMethodSelect.classList.remove("is-invalid");
    }

    if (!currentInvoiceId) {
      showModalFeedback("Lỗi: Không xác định được ID hóa đơn.", "danger");
      return;
    }

    if (markAsPaidBtn) markAsPaidBtn.disabled = true;
    if (markAsPaidSpinner) markAsPaidSpinner.style.display = "inline-block";

    try {
      await InvoiceService.markIsPaid(currentInvoiceId, paymentMethod);
      showModalFeedback("Hóa đơn đã được đánh dấu đã thanh toán!", "success");

      // Reload the data after a short delay
      setTimeout(() => {
        fetchAndRenderUiInvoiceDetails();
      }, 1500);
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Unknown error"
      ).toString();
      showModalFeedback(
        `Lỗi: ${errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}`,
        "danger"
      );
    } finally {
      if (markAsPaidBtn) markAsPaidBtn.disabled = false;
      if (markAsPaidSpinner) markAsPaidSpinner.style.display = "none";
    }
  }

  // Function: Handles the form submission for saving general changes.
  async function handleSaveChanges() {
    hideModalFeedback(); // Uses the file's specific feedback hide function

    if (!editInvoiceForm || !editInvoiceForm.checkValidity()) {
      if (editInvoiceForm) editInvoiceForm.classList.add("was-validated");
      showModalFeedback(
        // Uses the file's specific feedback show function
        "Vui lòng kiểm tra lại các trường thông tin bắt buộc.",
        "warning"
      );
      return;
    }

    // Specific index validation
    const elecOld = parseFloat(invoiceElecOldIndexInput?.value || 0);
    const elecNew = parseFloat(invoiceElecNewIndexInput?.value || 0);
    const waterOld = parseFloat(invoiceWaterOldIndexInput?.value || 0);
    const waterNew = parseFloat(invoiceWaterNewIndexInput?.value || 0);

    if (elecNew < elecOld) {
      showModalFeedback(
        "Chỉ số điện mới không được nhỏ hơn chỉ số cũ.",
        "warning"
      );
      invoiceElecNewIndexInput?.classList.add("is-invalid");
      invoiceElecNewIndexInput?.focus();
      return;
    } else {
      invoiceElecNewIndexInput?.classList.remove("is-invalid");
    }
    if (waterNew < waterOld) {
      showModalFeedback(
        "Chỉ số nước mới không được nhỏ hơn chỉ số cũ.",
        "warning"
      );
      invoiceWaterNewIndexInput?.classList.add("is-invalid");
      invoiceWaterNewIndexInput?.focus();
      return;
    } else {
      invoiceWaterNewIndexInput?.classList.remove("is-invalid");
    }

    // Date validation
    const issueDate = invoiceIssueDateInput?.value;
    const dueDate = invoiceDueDateInput?.value;
    if (issueDate && dueDate && new Date(dueDate) < new Date(issueDate)) {
      showModalFeedback(
        "Ngày hết hạn không được trước ngày phát hành.",
        "warning"
      );
      invoiceDueDateInput?.classList.add("is-invalid");
      invoiceDueDateInput?.focus();
      return;
    } else {
      invoiceDueDateInput?.classList.remove("is-invalid");
    }

    // Payment date/method validation (if status is 'paid')
    const paymentStatus = invoicePaymentStatusSelect.value;
    const paymentDate = invoicePaymentDateInput?.value;
    const paymentMethod = invoicePaymentMethodSelect.value || null; // Get method, use null if empty

    if (paymentStatus === "paid") {
      if (!paymentDate) {
        showModalFeedback(
          "Vui lòng nhập ngày thanh toán khi trạng thái là 'Đã thanh toán'.",
          "warning"
        );
        invoicePaymentDateInput?.classList.add("is-invalid");
        invoicePaymentDateInput?.focus();
        return;
      } else if (issueDate && new Date(paymentDate) < new Date(issueDate)) {
        showModalFeedback(
          "Ngày thanh toán không được trước ngày phát hành.",
          "warning"
        );
        invoicePaymentDateInput?.classList.add("is-invalid");
        invoicePaymentDateInput?.focus();
        return;
      } else {
        invoicePaymentDateInput?.classList.remove("is-invalid");
      }

      // Require a payment method if status is 'paid' during save as well
      if (!paymentMethod) {
        showModalFeedback(
          "Vui lòng chọn phương thức thanh toán khi trạng thái là 'Đã thanh toán'.",
          "warning"
        );
        invoicePaymentMethodSelect?.classList.add("is-invalid");
        invoicePaymentMethodSelect?.focus();
        return;
      } else {
        invoicePaymentMethodSelect?.classList.remove("is-invalid");
      }
    } else {
      invoicePaymentDateInput?.classList.remove("is-invalid");
      invoicePaymentMethodSelect?.classList.remove("is-invalid"); // Also remove if not 'paid'
    }

    if (editInvoiceForm) editInvoiceForm.classList.add("was-validated"); // Mark as validated if all checks pass

    if (!currentInvoiceId || !currentInvoiceData) {
      showModalFeedback("Lỗi: Không xác định được ID hóa đơn.", "danger"); // Uses the file's specific feedback show function
      return;
    }

    // Recalculate final total before comparison and sending
    calculateTotalAmount();
    const finalTotalAmount = parseFloat(invoiceTotalAmountInput?.value || 0);

    // Get current form values for comparison
    const currentFormData = {
      roomId: invoiceRoomIdSelect.value,
      issueDate: invoiceIssueDateInput.value,
      dueDate: invoiceDueDateInput.value,
      rentAmount: activeContractRentPrice, // Use state value
      elecOldIndex: elecOld,
      elecNewIndex: elecNew,
      elecPricePerUnit: parseFloat(invoiceElecPricePerUnitInput.value || 0),
      waterOldIndex: waterOld,
      waterNewIndex: waterNew,
      waterPricePerUnit: parseFloat(invoiceWaterPricePerUnitInput.value || 0),
      utilities: activeContractUtilities.map((util) => util._id), // Use state value (IDs)
      paymentMethod: paymentStatus === "paid" ? paymentMethod : null, // Only relevant if paid
      paymentStatus: paymentStatus,
      paymentDate: paymentStatus === "paid" && paymentDate ? paymentDate : null, // Only relevant if paid
      notes: invoiceNotesInput.value.trim(),
      totalAmount: finalTotalAmount
    };

    let hasChanges = false;
    // Compare current form data with initial data (currentInvoiceData)
    if (
      currentFormData.roomId !== currentInvoiceData.roomId ||
      formatDateForInput(currentFormData.issueDate) !==
        formatDateForInput(currentInvoiceData.issueDate) ||
      formatDateForInput(currentFormData.dueDate) !==
        formatDateForInput(currentInvoiceData.dueDate) ||
      Number(currentFormData.rentAmount) !==
        Number(currentInvoiceData.rentAmount || 0) ||
      Number(currentFormData.elecOldIndex) !==
        Number(currentInvoiceData.electricity?.oldIndex ?? 0) ||
      Number(currentFormData.elecNewIndex) !==
        Number(currentInvoiceData.electricity?.newIndex ?? 0) ||
      Number(currentFormData.elecPricePerUnit) !==
        Number(currentInvoiceData.electricity?.pricePerUnit ?? 0) ||
      Number(currentFormData.waterOldIndex) !==
        Number(currentInvoiceData.water?.oldIndex ?? 0) ||
      Number(currentFormData.waterNewIndex) !==
        Number(currentInvoiceData.water?.newIndex ?? 0) ||
      Number(currentFormData.waterPricePerUnit) !==
        Number(currentInvoiceData.water?.pricePerUnit ?? 0) ||
      !arraysAreEqual(
        currentFormData.utilities,
        currentInvoiceData.utilities?.map((u) =>
          typeof u === "string" ? u : u._id
        ) || []
      ) || // Helper needed
      currentFormData.paymentMethod !==
        (currentInvoiceData.paymentMethod || null) ||
      currentFormData.paymentStatus !== currentInvoiceData.paymentStatus ||
      formatDateForInput(currentFormData.paymentDate) !==
        formatDateForInput(currentInvoiceData.paymentDate) ||
      (currentFormData.notes || "") !== (currentInvoiceData.notes || "") ||
      Number(currentFormData.totalAmount) !==
        Number(currentInvoiceData.totalAmount || 0)
    ) {
      hasChanges = true;
    }
    // Helper function to compare arrays of IDs (can be defined inside or outside)
    function arraysAreEqual(arr1, arr2) {
      if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
      const set1 = new Set(arr1);
      const set2 = new Set(arr2);
      if (set1.size !== set2.size) return false; // Ensure no duplicates causing length match
      for (const item of set1) {
        if (!set2.has(item)) return false;
      }
      return true;
    }

    if (hasChanges) {
      if (saveChangesBtn) saveChangesBtn.disabled = true;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";

      try {
        // Prepare the final update payload using current form values
        const updatedInvoiceData = {
          roomId: currentFormData.roomId,
          issueDate: currentFormData.issueDate,
          dueDate: currentFormData.dueDate,
          rentAmount: currentFormData.rentAmount,
          electricity: {
            oldIndex: currentFormData.elecOldIndex,
            newIndex: currentFormData.elecNewIndex,
            pricePerUnit: currentFormData.elecPricePerUnit
          },
          water: {
            oldIndex: currentFormData.waterOldIndex,
            newIndex: currentFormData.waterNewIndex,
            pricePerUnit: currentFormData.waterPricePerUnit
          },
          utilities: currentFormData.utilities, // Already IDs
          paymentMethod: currentFormData.paymentMethod, // Null if not paid or empty
          paymentStatus: currentFormData.paymentStatus,
          paymentDate: currentFormData.paymentDate, // Null if not paid
          notes: currentFormData.notes,
          totalAmount: currentFormData.totalAmount // Use final calculated total
        };

        // Single API Call
        await InvoiceService.updateInvoice(
          currentInvoiceId,
          updatedInvoiceData
        );
        showModalFeedback("Cập nhật hóa đơn thành công!", "success"); // Uses the file's specific feedback show function

        setTimeout(() => {
          fetchAndRenderUiInvoiceDetails();
        }, 1500);
      } catch (error) {
        console.error(error);
        // Ensure error message is a string before using string methods
        const errorMessageString = (
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi không xác định khi lưu."
        ).toString();
        showModalFeedback(
          // Uses the file's specific feedback show function
          `Lỗi: ${
            errorMessageString.charAt(0).toUpperCase() +
            errorMessageString.slice(1)
          }`,
          "danger"
        );
      } finally {
        if (saveChangesBtn) saveChangesBtn.disabled = false;
        if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
      }
    } else {
      // No changes detected
      showModalFeedback("Không có thay đổi nào để lưu.", "info"); // Uses the file's specific feedback show function
    }
  }

  // --- Event Listener Setup ---

  // Function to setup listeners for inputs that trigger recalculation
  function setupCalculationListeners() {
    const calculationInputs = [
      invoiceElecOldIndexInput,
      invoiceElecNewIndexInput,
      invoiceElecPricePerUnitInput,
      invoiceWaterOldIndexInput,
      invoiceWaterNewIndexInput,
      invoiceWaterPricePerUnitInput
      // invoiceRentAmountInput is usually derived, not manually set here
      // Utility changes trigger via room change
    ];
    calculationInputs.forEach((input) => {
      if (input) {
        // Remove existing listener first to prevent duplicates if called multiple times
        input.removeEventListener("input", handleCalculationInputChange);
        input.addEventListener("input", handleCalculationInputChange);
      }
    });
  }

  // Event Listener: Room Selection Change
  if (invoiceRoomIdSelect) {
    invoiceRoomIdSelect.addEventListener("change", handleRoomChange);
  }

  // Event Listener: Payment Status Change
  if (invoicePaymentStatusSelect) {
    invoicePaymentStatusSelect.addEventListener("change", handleStatusChange);
  }

  // Event Listener: Save Changes Button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // Event Listener: Mark as Paid Button
  if (markAsPaidBtn) {
    markAsPaidBtn.addEventListener("click", handleMarkAsPaid);
  }

  // Event Listener: Cancel Button
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", () => {
      window.location.href = "/admin/dashboard";
    });
  }

  // --- Initial Load ---
  fetchAndRenderUiInvoiceDetails(); // Fetch data and populate the form when the page loads
});
