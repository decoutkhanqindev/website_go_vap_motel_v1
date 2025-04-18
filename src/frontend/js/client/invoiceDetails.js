// --- START OF FILE /js/client/invoiceDetails.js ---

// Adjust import paths based on your actual client-side project structure
import InvoiceService from "../services/InvoiceService.js";
import RoomService from "../services/RoomService.js";
import UtilityService from "../services/UtilityService.js";

// --- Helper Maps (Keep for display) ---
const utilityNameMap = {
  wifi: "Wifi",
  parking: "Đỗ xe",
  cleaning: "Vệ sinh hàng tuần"
  // Add other known utility keys if needed
};

const paymentMethodMap = {
  "": "N/A",
  cash: "Tiền mặt",
  banking: "Chuyển khoản",
  all: "Tất cả" // Or just "Đã thanh toán" if method isn't crucial client-side
};

const paymentStatusMap = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  overdue: "Đã quá hạn"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors (Client Version) ---
  const invoiceViewForm = document.getElementById("invoiceViewForm");
  const invoiceCodeInput = document.getElementById("invoiceCode");
  const invoiceRoomDisplay = document.getElementById("invoiceRoomDisplay");
  const invoiceRentAmountInput = document.getElementById("invoiceRentAmount");
  const invoiceIssueDateInput = document.getElementById("invoiceIssueDate");
  const invoiceDueDateInput = document.getElementById("invoiceDueDate");
  const invoicePaymentStatusDisplay = document.getElementById(
    "invoicePaymentStatusDisplay"
  );
  const paymentDateGroup = document.getElementById("paymentDateGroup");
  const invoicePaymentDateInput = document.getElementById("invoicePaymentDate");
  const paymentMethodGroup = document.getElementById("paymentMethodGroup");
  const invoicePaymentMethodDisplay = document.getElementById(
    "invoicePaymentMethodDisplay"
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
  const backBtn = document.getElementById("backBtn");

  // --- Utility Functions (Keep/Add as needed) ---

  function getInvoiceIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    // Adjust index if URL structure is different (e.g., /client/invoice/:id)
    return pathSegments[pathSegments.length - 1] || null;
  }

  function formatDateForInput(dateStringOrObject) {
    if (!dateStringOrObject) return "";
    try {
      const date = new Date(dateStringOrObject);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return "N/A";
    // Simple formatting, adjust locale and options as needed
    return Number(amount).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND"
    });
  }

  function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) return "";
    return Number(number).toLocaleString("vi-VN"); // Format indices nicely
  }

  // --- UI Rendering ---

  async function renderUtilitiesListDisplay(
    invoiceUtilities,
    allUtilitiesData
  ) {
    if (!invoiceUtilitiesListDiv) return;
    invoiceUtilitiesListDiv.innerHTML = ""; // Clear previous

    if (!invoiceUtilities || invoiceUtilities.length === 0) {
      invoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Không có tiện ích nào.</p>';
      return;
    }

    // Ensure allUtilitiesData is an array
    const utilityDefinitions = Array.isArray(allUtilitiesData)
      ? allUtilitiesData
      : [];

    for (const util of invoiceUtilities) {
      let utilId = null;
      let price = 0; // Price from the invoice utility item itself (frozen)
      let definition = null;

      if (typeof util === "string") {
        // Invoice only stores ID
        utilId = util;
        definition = utilityDefinitions.find((def) => def._id === utilId);
        price = definition ? definition.price : 0; // Fallback to definition price
      } else if (typeof util === "object" && util !== null) {
        // Invoice stores object { _id, price }
        utilId = util._id;
        price = util.price !== undefined ? util.price : 0;
        definition = utilityDefinitions.find((def) => def._id === utilId);
      }

      if (!utilId) continue; // Skip invalid entries

      // Determine display name: Use definition name, map key, or fallback to ID
      const utilityDisplayName =
        definition?.name ||
        utilityNameMap[definition?.key] ||
        `Tiện ích (${utilId.substring(0, 6)}...)`;
      const priceDisplay = formatCurrency(price);

      const div = document.createElement("div");
      div.classList.add("utility-item"); // Uses flex layout from CSS

      const nameSpan = document.createElement("span");
      nameSpan.classList.add("utility-name");
      nameSpan.textContent = utilityDisplayName;

      const priceSpan = document.createElement("span");
      priceSpan.classList.add("utility-price");
      priceSpan.textContent = `(+ ${priceDisplay})`; // Include currency symbol from formatCurrency

      div.appendChild(nameSpan);
      div.appendChild(priceSpan);
      invoiceUtilitiesListDiv.appendChild(div);
    }
  }

  // --- Data Fetching and Population ---

  async function fetchAndDisplayInvoiceDetails() {
    const invoiceId = getInvoiceIdFromUrl();
    if (!invoiceId) {
      displayError("Lỗi: Không tìm thấy ID hóa đơn hợp lệ trong địa chỉ URL.");
      return;
    }

    setLoadingState(true);

    try {
      // Fetch invoice, all utility definitions, and the specific room concurrently
      const [invoiceData, allUtilitiesData, roomData] = await Promise.all([
        InvoiceService.getInvoiceById(invoiceId).catch((err) => {
          throw new Error(
            `Lỗi tải hóa đơn: ${err?.response?.data?.message || err.message}`
          );
        }),
        UtilityService.getAllUtilities().catch((err) => {
          console.warn("Could not load all utilities:", err);
          return [];
        }), // Non-critical, proceed without if fails
        // Fetch room only if invoiceData has roomId (chained promise)
        InvoiceService.getInvoiceById(invoiceId)
          .then((inv) => {
            if (inv && inv.roomId) {
              return RoomService.getRoomById(inv.roomId).catch((err) => {
                console.warn("Could not load room:", err);
                return null;
              }); // Non-critical room fetch
            }
            return null; // No roomId
          })
          .catch(() => null) // Ignore error here, handled above
      ]);

      // Populate the form with fetched data
      populateReadOnlyForm(invoiceData, roomData, allUtilitiesData);
    } catch (error) {
      console.error("Error loading invoice details:", error);
      displayError(error.message || "Đã xảy ra lỗi khi tải chi tiết hóa đơn.");
    } finally {
      setLoadingState(false);
    }
  }

  function populateReadOnlyForm(invoice, room, allUtilitiesData) {
    if (!invoice || !invoiceViewForm) return;

    // --- Basic Info ---
    if (invoiceCodeInput) invoiceCodeInput.value = invoice.invoiceCode || "N/A";
    if (invoiceRoomDisplay)
      invoiceRoomDisplay.value = room
        ? `P. ${room.roomNumber || "N/A"} - ĐC. ${room.address || "N/A"}`
        : invoice.roomId
        ? "Không tải được thông tin phòng"
        : "Không có phòng";
    if (invoiceRentAmountInput)
      invoiceRentAmountInput.value = formatCurrency(invoice.rentAmount);
    if (invoiceIssueDateInput)
      invoiceIssueDateInput.value = formatDateForInput(invoice.issueDate);
    if (invoiceDueDateInput)
      invoiceDueDateInput.value = formatDateForInput(invoice.dueDate);

    // --- Payment Info ---
    const statusText =
      paymentStatusMap[invoice.paymentStatus] || invoice.paymentStatus;
    if (invoicePaymentStatusDisplay)
      invoicePaymentStatusDisplay.value = statusText;

    const isPaid = invoice.paymentStatus === "paid";
    if (paymentDateGroup) {
      paymentDateGroup.style.display = isPaid ? "block" : "none";
      if (isPaid && invoicePaymentDateInput)
        invoicePaymentDateInput.value = formatDateForInput(invoice.paymentDate);
    }
    if (paymentMethodGroup) {
      paymentMethodGroup.style.display = isPaid ? "block" : "none";
      if (isPaid && invoicePaymentMethodDisplay) {
        const methodText =
          paymentMethodMap[invoice.paymentMethod || ""] ||
          invoice.paymentMethod ||
          "N/A";
        invoicePaymentMethodDisplay.value = methodText;
      }
    }

    // --- Amounts & Indices ---
    if (invoiceTotalAmountInput)
      invoiceTotalAmountInput.value = formatCurrency(invoice.totalAmount);

    // Electricity
    if (invoiceElecOldIndexInput)
      invoiceElecOldIndexInput.value = formatNumber(
        invoice.electricity?.oldIndex
      );
    if (invoiceElecNewIndexInput)
      invoiceElecNewIndexInput.value = formatNumber(
        invoice.electricity?.newIndex
      );
    if (invoiceElecPricePerUnitInput)
      invoiceElecPricePerUnitInput.value = formatCurrency(
        invoice.electricity?.pricePerUnit
      );
    // Water
    if (invoiceWaterOldIndexInput)
      invoiceWaterOldIndexInput.value = formatNumber(invoice.water?.oldIndex);
    if (invoiceWaterNewIndexInput)
      invoiceWaterNewIndexInput.value = formatNumber(invoice.water?.newIndex);
    if (invoiceWaterPricePerUnitInput)
      invoiceWaterPricePerUnitInput.value = formatCurrency(
        invoice.water?.pricePerUnit
      );

    // --- Notes ---
    if (invoiceNotesInput) {
      invoiceNotesInput.value = invoice.notes || "";
      invoiceNotesInput.placeholder = invoice.notes ? "" : "Không có ghi chú"; // Adjust placeholder
    }

    // --- Utilities ---
    renderUtilitiesListDisplay(invoice.utilities || [], allUtilitiesData);
  }

  function setLoadingState(isLoading) {
    // Simple loading indicator (e.g., dim the form)
    if (invoiceViewForm) {
      invoiceViewForm.style.opacity = isLoading ? "0.5" : "1";
      invoiceViewForm.style.pointerEvents = isLoading ? "none" : "auto";
    }
    // You could add a more prominent loading spinner if desired
    if (isLoading && invoiceUtilitiesListDiv) {
      invoiceUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải...</p>';
    }
  }

  function displayError(message) {
    // Display error message prominently, maybe replacing the form
    if (invoiceViewForm) {
      const errorContainer =
        invoiceViewForm.closest(".modal-content") ||
        invoiceViewForm.closest(".invoice-details");
      if (errorContainer) {
        errorContainer.innerHTML = `<div class="alert alert-danger m-3">${message}</div>`;
      } else {
        // Fallback if container structure changes
        document.body.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-danger m-3">${message}</div>`
        );
      }
    }
    setLoadingState(false); // Ensure loading state is turned off on error
  }

  // --- Event Listeners ---

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back(); // Navigate back
    });
  }

  // --- Initial Load ---
  fetchAndDisplayInvoiceDetails();
});
// --- END OF FILE /js/client/invoiceDetails.js ---
