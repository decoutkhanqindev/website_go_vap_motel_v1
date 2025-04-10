import ExpenseService from "../services/ExpenseService.js";
import RoomService from "../services/RoomService.js";

// --- Global Scope: State Variables ---
let currentExpenseId = null;
let currentExpenseData = null;
let allOccupiedRooms = [];
let existingImageInfo = [];
let newImageFiles = [];
let imageIdsToRemove = [];

// --- Mappings ---
const paymentMethodMap = {
  all: "Tất cả",
  cash: "Tiền mặt",
  banking: "Chuyển khoản"
};

const paymentStatusMap = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  overdue: "Đã quá hạn"
};

const expenseCategoryMap = {
  repair: "Sửa chữa",
  maintenance: "Bảo trì",
  purchase: "Mua sắm"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const editExpenseForm = document.getElementById("editExpenseForm");
  const expenseCodeInput = document.getElementById("expenseCode");
  const expenseRoomIdSelect = document.getElementById("expenseRoomId");
  const expenseRoomSelectLoadingDiv = document.getElementById(
    "expenseRoomSelectLoading"
  );
  const expenseAmountInput = document.getElementById("expenseAmount");
  const expenseCategorySelect = document.getElementById("expenseCategory");
  const expensePaymentStatusSelect = document.getElementById(
    "expensePaymentStatus"
  );
  const paymentDateGroup = document.getElementById("paymentDateGroup");
  const expensePaymentDateInput = document.getElementById("expensePaymentDate");
  const expensePaymentMethodSelect = document.getElementById(
    "expensePaymentMethod"
  );
  const expenseDateInput = document.getElementById("expenseDate");
  const expenseDueDateInput = document.getElementById("expenseDueDate");
  const expenseDescriptionInput = document.getElementById("expenseDescription");
  // Image related selectors
  const expenseImagesInput = document.getElementById("expenseImagesInput");
  const selectExpenseImagesBtn = document.getElementById(
    "selectExpenseImagesBtn"
  );
  const expenseImagePreviewDiv = document.getElementById("expenseImagePreview");
  // Action buttons and feedback
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const markAsPaidBtn = document.getElementById("markAsPaidBtn");
  const editExpenseFeedbackDiv = document.getElementById("editExpenseFeedback");
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");
  const markAsPaidSpinner = markAsPaidBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  function getExpenseIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  function showModalFeedback(message, type = "danger") {
    if (editExpenseFeedbackDiv) {
      editExpenseFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editExpenseFeedbackDiv.className = `alert alert-${type} mt-3`;
      editExpenseFeedbackDiv.style.display = "block";
      editExpenseFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  function hideModalFeedback() {
    if (editExpenseFeedbackDiv) {
      editExpenseFeedbackDiv.style.display = "none";
      editExpenseFeedbackDiv.textContent = "";
      editExpenseFeedbackDiv.className = "alert";
    }
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
      console.error(e);
      return "";
    }
  }

  // --- UI Rendering Functions ---

  async function renderRoomSelectionDropdown() {
    // Logic remains the same as previous correct version
    if (!expenseRoomIdSelect || !expenseRoomSelectLoadingDiv) return;
    expenseRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    expenseRoomIdSelect.disabled = true;
    expenseRoomSelectLoadingDiv.style.display = "block";
    try {
      let currentExpenseRoomDetails = null;
      if (
        currentExpenseData?.roomId &&
        !allOccupiedRooms.some((room) => room._id === currentExpenseData.roomId)
      ) {
        try {
          currentExpenseRoomDetails = await RoomService.getRoomById(
            currentExpenseData.roomId
          );
          if (
            currentExpenseRoomDetails &&
            !allOccupiedRooms.some(
              (room) => room._id === currentExpenseData.roomId
            )
          ) {
            allOccupiedRooms.push(currentExpenseRoomDetails);
          }
        } catch (roomFetchError) {
          console.warn(roomFetchError);
        }
      }
      expenseRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>';
      if (allOccupiedRooms.length > 0) {
        allOccupiedRooms.sort((a, b) =>
          (a.roomNumber || "").localeCompare(b.roomNumber || "")
        );
        allOccupiedRooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent = `P. ${room.roomNumber || "N/A"} - ĐC. ${
            room.address || "N/A"
          }`;
          if (room._id === currentExpenseData?.roomId) option.selected = true;
          expenseRoomIdSelect.appendChild(option);
        });
        expenseRoomIdSelect.disabled = false;
      } else {
        expenseRoomIdSelect.innerHTML =
          '<option value="" disabled>Không có phòng nào đang được thuê</option>';
      }
    } catch (error) {
      console.error(error);
      expenseRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      expenseRoomSelectLoadingDiv.style.display = "none";
    }
  }

  // Function: Renders image previews (Corrected logic based on utilityDetails)
  // Assumes `existingImageInfo` contains {id, url}
  async function renderImagePreviews() {
    // Make the function async
    if (!expenseImagePreviewDiv) return;
    expenseImagePreviewDiv.innerHTML = ""; // Clear previous

    let previewGenerated = false;

    // 1. Render existing images by fetching each one
    //    existingImageInfo now contains only IDs
    const existingImagePromises = existingImageInfo.map(async (imageId) => {
      if (imageIdsToRemove.includes(imageId)) return null; // Skip if marked for removal

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // Default fallback

      try {
        // --- Fetch individual image data using the correct service method ---
        const imageDataResponse =
          await ExpenseService.getExpenseReceiptImageById(imageId);

        // --- Convert ArrayBuffer/Buffer to Base64 Data URL ---
        // Assuming response structure matches utility: { data: { data: ArrayBuffer/Buffer }, contentType: string }
        if (imageDataResponse?.data?.data && imageDataResponse?.contentType) {
          const buffer = imageDataResponse.data.data; // Assuming it's Buffer or ArrayBuffer like structure
          const base64Image = btoa(
            new Uint8Array(buffer).reduce(
              // Use Uint8Array to handle potential ArrayBuffer
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          imageSrc = `data:${imageDataResponse.contentType};base64,${base64Image}`;
          previewGenerated = true; // Mark that at least one image is likely displayed
        } else {
          console.error(
            `Invalid image data structure received for ID: ${imageId}`
          );
        }
      } catch (error) {
        console.error(error);
        // Keep fallback image source
      }

      previewItem.innerHTML = `
        <img src="${imageSrc}" alt="Biên lai chi phí hiện có">
        <button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imageId}" title="Xóa ảnh này">×</button>
      `;

      // Add listener inside the map's async callback AFTER element is created
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (event) => {
          const idToRemove = event.target.getAttribute("data-image-id");
          if (idToRemove && !imageIdsToRemove.includes(idToRemove)) {
            imageIdsToRemove.push(idToRemove);
            renderImagePreviews(); // Re-render to reflect removal visually
          }
        });
      }
      return previewItem; // Return the created element
    });

    // Wait for all image fetches and element creations to complete
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );

    // Append all valid fetched items at once
    existingItems.forEach((previewItem) => {
      expenseImagePreviewDiv.appendChild(previewItem);
    });

    // 2. Render previews for newly selected files (using FileReader - this part is likely correct)
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
        expenseImagePreviewDiv.appendChild(newPreviewItem);
      };
      reader.onerror = (error) => {
        console.error(error);
        const errorItem = document.createElement("div");
        errorItem.classList.add(
          "image-preview-item",
          "text-danger",
          "p-1",
          "small",
          "border",
          "border-danger",
          "d-flex",
          "align-items-center",
          "justify-content-center"
        );
        errorItem.textContent = `Lỗi ảnh`;
        errorItem.title = file.name;
        expenseImagePreviewDiv.appendChild(errorItem);
      };
      reader.readAsDataURL(file);
    });

    // Display placeholder if no images after all rendering attempts
    if (!previewGenerated && expenseImagePreviewDiv.childElementCount === 0) {
      // Check count after async operations
      expenseImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">Chưa có ảnh nào.</p>';
    }
  }

  // --- Data Fetching and Population ---

  async function fetchAndRenderUiExpenseDetails() {
    currentExpenseId = getExpenseIdFromUrl();
    if (!currentExpenseId) {
      showModalFeedback(
        "Không tìm thấy ID chi phí hợp lệ trong URL.",
        "danger"
      );
      if (editExpenseForm) editExpenseForm.style.display = "none";
      return;
    }

    // Reset state
    currentExpenseData = null;
    allOccupiedRooms = [];
    existingImageInfo = []; // Changed this name for clarity
    newImageFiles = [];
    imageIdsToRemove = [];

    if (expenseImagePreviewDiv)
      expenseImagePreviewDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải ảnh...</p>';
    hideModalFeedback();
    if (editExpenseForm) editExpenseForm.style.display = "block";

    try {
      const [expenseDetails, occupiedRooms] = await Promise.all([
        ExpenseService.getExpenseById(currentExpenseId),
        RoomService.getAllRooms({ status: "occupied" })
      ]);

      currentExpenseData = expenseDetails;
      allOccupiedRooms = occupiedRooms || [];

      if (!currentExpenseData)
        throw new Error("Không tìm thấy dữ liệu chi phí.");

      // --- CORRECTED: Store only image IDs ---
      existingImageInfo =
        currentExpenseData.receiptImages
          ?.map(
            (img) => (typeof img === "string" ? img : img._id) // Get ID whether it's a string or object
          )
          .filter((id) => id) || []; // Filter out any potential null/undefined IDs

      populateFormFields(); // Populate text fields etc.
      await renderRoomSelectionDropdown(); // Populate room dropdown
      await renderImagePreviews(); // Populate images (now async)

      if (editExpenseForm) editExpenseForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi chưa rõ"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu chi phí: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editExpenseForm) editExpenseForm.style.display = "none";
    }
  }

  // Function: Populates form fields using maps where appropriate (for display logic, less needed for setting values)
  function populateFormFields() {
    if (!currentExpenseData || !editExpenseForm) return;

    if (expenseCodeInput)
      expenseCodeInput.value = currentExpenseData.expenseCode || "N/A";
    if (expenseAmountInput)
      expenseAmountInput.value = currentExpenseData.amount ?? "";
    if (expenseCategorySelect) {
      expenseCategorySelect.value = currentExpenseData.category || "";
      // The HTML <option> already has Vietnamese text. If we needed to *display* the text elsewhere:
      // const categoryText = expenseCategoryMap[currentExpenseData.category] || currentExpenseData.category;
    }
    if (expenseDateInput)
      expenseDateInput.value = formatDateForInput(
        currentExpenseData.expenseDate
      );
    if (expenseDueDateInput)
      expenseDueDateInput.value = formatDateForInput(
        currentExpenseData.dueDate
      );
    if (expensePaymentStatusSelect) {
      expensePaymentStatusSelect.value =
        currentExpenseData.paymentStatus || "pending";
      // const statusText = paymentStatusMap[currentExpenseData.paymentStatus] || currentExpenseData.paymentStatus;
      handleStatusChange(); // Update payment date visibility
    }
    if (expensePaymentDateInput)
      expensePaymentDateInput.value = formatDateForInput(
        currentExpenseData.paymentDate
      );
    if (expensePaymentMethodSelect) {
      expensePaymentMethodSelect.value = currentExpenseData.paymentMethod || "";
      // const methodText = paymentMethodMap[paymentMethodValue] || 'Không xác định';
    }
    if (expenseDescriptionInput)
      expenseDescriptionInput.value = currentExpenseData.description || "";
    // Image population is handled by renderImagePreviews
  }

  // --- Event Handlers ---

  function handleRoomChange(event) {
    /* No action needed */
  }

  function handleStatusChange() {
    if (!expensePaymentStatusSelect) return;
    const isPaid = expensePaymentStatusSelect.value === "paid";
    if (paymentDateGroup)
      paymentDateGroup.style.display = isPaid ? "block" : "none";
    if (!isPaid) {
      expensePaymentMethodSelect?.classList.remove("is-invalid");
      expensePaymentDateInput?.classList.remove("is-invalid");
    }
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files);
    newImageFiles.push(...files);
    renderImagePreviews(); // Re-render previews
    event.target.value = null;
  }

  async function handleMarkAsPaid() {
    hideModalFeedback();
    const paymentMethod = expensePaymentMethodSelect.value;
    if (!paymentMethod || paymentMethod === "all") {
      showModalFeedback(
        "Vui lòng chọn phương thức thanh toán cụ thể (Tiền mặt hoặc Chuyển khoản) trước khi đánh dấu đã thanh toán.", // Cập nhật thông báo cho rõ ràng hơn
        "warning"
      );
      expensePaymentMethodSelect.classList.add("is-invalid");
      expensePaymentMethodSelect.focus();
      return;
    } else {
      expensePaymentMethodSelect.classList.remove("is-invalid");
    }

    if (!currentExpenseId) {
      showModalFeedback("Lỗi: Không xác định được ID chi phí.", "danger");
      return;
    }

    if (markAsPaidBtn) markAsPaidBtn.disabled = true;
    if (markAsPaidSpinner) markAsPaidSpinner.style.display = "inline-block";

    try {
      await ExpenseService.markIsPaid(currentExpenseId, paymentMethod);
      showModalFeedback("Chi phí đã được đánh dấu đã thanh toán!", "success");
      newImageFiles = [];
      imageIdsToRemove = []; // Reset image state on success
      setTimeout(() => fetchAndRenderUiExpenseDetails(), 1500);
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Lỗi không xác định"
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

  async function handleSaveChanges() {
    hideModalFeedback();
    if (!editExpenseForm || !editExpenseForm.checkValidity()) {
      if (editExpenseForm) editExpenseForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường bắt buộc.",
        "warning"
      );
      return;
    }

    // --- Validations ---
    const amount = parseFloat(expenseAmountInput?.value || 0);
    if (isNaN(amount) || amount < 0) {
      showModalFeedback("Số tiền chi phí phải hợp lệ (>= 0).", "warning");
      expenseAmountInput?.classList.add("is-invalid");
      expenseAmountInput?.focus();
      return;
    } else expenseAmountInput?.classList.remove("is-invalid");

    const expenseDate = expenseDateInput?.value;
    const dueDate = expenseDueDateInput?.value;
    if (expenseDate && dueDate && new Date(dueDate) < new Date(expenseDate)) {
      showModalFeedback(
        "Ngày hết hạn không được trước ngày phát sinh.",
        "warning"
      );
      expenseDueDateInput?.classList.add("is-invalid");
      expenseDueDateInput?.focus();
      return;
    } else expenseDueDateInput?.classList.remove("is-invalid");

    const paymentStatus = expensePaymentStatusSelect.value;
    const paymentDate = expensePaymentDateInput?.value;
    const paymentMethod = expensePaymentMethodSelect.value;

    if (paymentStatus === "paid") {
      if (!paymentDate) {
        showModalFeedback(
          "Vui lòng nhập ngày thanh toán khi 'Đã thanh toán'.",
          "warning"
        );
        expensePaymentDateInput?.classList.add("is-invalid");
        expensePaymentDateInput?.focus();
        return;
      } else if (expenseDate && new Date(paymentDate) < new Date(expenseDate)) {
        showModalFeedback(
          "Ngày thanh toán không được trước ngày phát sinh.",
          "warning"
        );
        expensePaymentDateInput?.classList.add("is-invalid");
        expensePaymentDateInput?.focus();
        return;
      } else expensePaymentDateInput?.classList.remove("is-invalid");

      if (!paymentMethod) {
        showModalFeedback(
          "Vui lòng chọn phương thức khi 'Đã thanh toán'.",
          "warning"
        );
        expensePaymentMethodSelect?.classList.add("is-invalid");
        expensePaymentMethodSelect?.focus();
        return;
      } else expensePaymentMethodSelect?.classList.remove("is-invalid");
    } else {
      expensePaymentDateInput?.classList.remove("is-invalid");
      expensePaymentMethodSelect?.classList.remove("is-invalid");
    }

    if (editExpenseForm) editExpenseForm.classList.add("was-validated");
    if (!currentExpenseId) {
      showModalFeedback("Lỗi: Không xác định ID chi phí.", "danger");
      return;
    }

    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";

    const errors = [];
    try {
      // --- Prepare Basic Data Update ---
      const updatedBasicData = {
        roomId: expenseRoomIdSelect.value,
        amount: amount,
        category: expenseCategorySelect.value,
        expenseDate: expenseDate,
        dueDate: dueDate,
        paymentStatus: paymentStatus,
        paymentDate:
          paymentStatus === "paid" && paymentDate ? paymentDate : null,
        paymentMethod: paymentMethod || null,
        description: expenseDescriptionInput.value.trim()
      };
      let basicDataChanged = Object.keys(updatedBasicData).some((key) => {
        let currentVal = currentExpenseData[key];
        let updatedVal = updatedBasicData[key];
        if (key === "paymentMethod" && currentVal === "all") currentVal = null;
        if (key === "paymentMethod" && updatedVal === "") updatedVal = null;
        if (currentVal === undefined) currentVal = null;
        if (key === "expenseDate" || key === "dueDate" || key === "paymentDate")
          return (
            formatDateForInput(currentVal) !== formatDateForInput(updatedVal)
          );
        return String(currentVal ?? "") !== String(updatedVal ?? "");
      });

      // --- Build API Calls ---
      const apiCalls = [];
      if (basicDataChanged) {
        apiCalls.push(
          ExpenseService.updateExpense(
            currentExpenseId,
            updatedBasicData
          ).catch((err) => {
            errors.push(`Lỗi cập nhật thông tin: ${err.message || err}`);
            throw err;
          })
        );
      }
      if (imageIdsToRemove.length > 0) {
        apiCalls.push(
          ExpenseService.deleteReceiptImagesForExpense(
            currentExpenseId,
            imageIdsToRemove
          ).catch((err) => {
            errors.push(`Lỗi xóa ảnh: ${err.message || err}`);
            throw err;
          })
        );
      }
      if (newImageFiles.length > 0) {
        apiCalls.push(
          ExpenseService.addReceiptImagesToExpense(
            currentExpenseId,
            newImageFiles
          ).catch((err) => {
            errors.push(`Lỗi thêm ảnh mới: ${err.message || err}`);
            throw err;
          })
        );
      }

      // --- Execute ---
      if (apiCalls.length > 0) {
        await Promise.all(apiCalls);
        showModalFeedback("Cập nhật chi phí thành công!", "success");
        newImageFiles = [];
        imageIdsToRemove = []; // Reset image state only on full success
        setTimeout(() => fetchAndRenderUiExpenseDetails(), 1500);
      } else {
        showModalFeedback("Không có thay đổi nào để lưu.", "info");
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        errors.length > 0 ? errors.join("; ") : `Lỗi không xác định khi lưu.`;
      showModalFeedback(errorMessage, "danger");
    } finally {
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---
  if (expenseRoomIdSelect)
    expenseRoomIdSelect.addEventListener("change", handleRoomChange);
  if (expensePaymentStatusSelect)
    expensePaymentStatusSelect.addEventListener("change", handleStatusChange);
  if (selectExpenseImagesBtn && expenseImagesInput)
    selectExpenseImagesBtn.addEventListener("click", () =>
      expenseImagesInput.click()
    );
  if (expenseImagesInput)
    expenseImagesInput.addEventListener("change", handleImageSelection);
  // Removal listeners added dynamically in renderImagePreviews
  if (saveChangesBtn)
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  if (markAsPaidBtn) markAsPaidBtn.addEventListener("click", handleMarkAsPaid);
  if (cancelChangesBtn)
    cancelChangesBtn.addEventListener("click", () => {
      window.history.back();
    });

  // --- Initial Load ---
  fetchAndRenderUiExpenseDetails();
});
