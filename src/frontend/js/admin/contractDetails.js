import ContractService from "../services/ContractService.js";
import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Contract Editing ---
let currentContractId = null;
let currentContractData = null;
let allAmenities = [];
let allUtilities = [];
let allVacantRooms = [];
let originalRoomData = null;
let baseContractDeposit = 0;

// --- Store mapping for Amenity name ---
const amenityNameMap = {
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
  wifi: "Wifi",
  parking: "Đỗ xe",
  cleaning: "Vệ sinh hàng tuần"
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: Edit Contract Form Elements ---
  const editContractForm = document.getElementById("editContractForm");
  const contractCodeInput = document.getElementById("contractCode");
  const contractRoomIdSelect = document.getElementById("contractRoomId");
  const roomSelectLoadingDiv = document.getElementById("roomSelectLoading");
  const contractRentPriceInput = document.getElementById("contractRentPrice");
  const contractDepositInput = document.getElementById("contractDeposit");
  const contractAmenitiesListDiv = document.getElementById(
    "contractAmenitiesList"
  );
  const contractUtilitiesListDiv = document.getElementById(
    "contractUtilitiesList"
  );
  const contractStartDateInput = document.getElementById("contractStartDate");
  const contractEndDateInput = document.getElementById("contractEndDate");
  const contractStatusSelect = document.getElementById("contractStatus");
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  const editContractFeedbackDiv = document.getElementById(
    "editContractModalFeedback"
  );
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- Core Utility Functions ---

  // Function: Extracts the Contract ID from the current URL path.
  function getContractIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  }

  // Function: Displays feedback messages (success/error) on the page.
  function showModalFeedback(message, type = "danger") {
    if (editContractFeedbackDiv) {
      editContractFeedbackDiv.textContent =
        message.charAt(0).toUpperCase() + message.slice(1);
      editContractFeedbackDiv.className = `alert alert-${type} mt-3`;
      editContractFeedbackDiv.style.display = "block";
      editContractFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // Function: Hides the feedback message area.
  function hideModalFeedback() {
    if (editContractFeedbackDiv) {
      editContractFeedbackDiv.style.display = "none";
      editContractFeedbackDiv.textContent = "";
      editContractFeedbackDiv.className = "alert";
    }
  }

  // Function: Formats date object or string to YYYY-MM-DD for input[type=date]
  function formatDateForInput(dateStringOrObject) {
    if (!dateStringOrObject) return "";
    try {
      const date = new Date(dateStringOrObject);
      // Check if date is valid after parsing
      if (isNaN(date.getTime())) {
        console.error(
          "Invalid date provided to formatDateForInput:",
          dateStringOrObject
        );
        return ""; // Return empty string for invalid dates
      }
      const year = date.getFullYear();
      // getMonth() is 0-indexed, so add 1
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", dateStringOrObject, e);
      return "";
    }
  }

  // --- UI Rendering Functions ---

  // Function: Renders the amenity checklist, marking items present in the current Contract.
  function renderAmenitiesChecklist() {
    if (!contractAmenitiesListDiv || !allAmenities.length) {
      if (contractAmenitiesListDiv)
        contractAmenitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Không có tiện nghi nào.</p>';
      return;
    }
    contractAmenitiesListDiv.innerHTML = ""; // Clear previous

    const contractAmenityIds = new Set(
      currentContractData?.amenities?.map((a) =>
        typeof a === "string" ? a : a._id
      ) || []
    );

    allAmenities.forEach((amenity) => {
      const isChecked = contractAmenityIds.has(amenity._id);
      const div = document.createElement("div");
      div.classList.add("form-check", "form-check-sm");
      const amenityDisplayName =
        amenityNameMap[amenity.name] ||
        (amenity.name
          ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
          : "Tiện nghi");
      const priceDisplay = (amenity.price || 0).toLocaleString("vi-VN");

      div.innerHTML = `
          <input class="form-check-input contract-amenity-checkbox" type="checkbox" value="${
            amenity._id
          }" id="edit-amenity-${amenity._id}" data-price="${
        amenity.price || 0
      }" ${isChecked ? "checked" : ""}>
          <label class="form-check-label" for="edit-amenity-${
            amenity._id
          }">${amenityDisplayName} (+${priceDisplay} VNĐ)</label>
      `;
      contractAmenitiesListDiv.appendChild(div);
    });
  }

  // Function: Renders the utility checklist, marking items present in the current Contract.
  function renderUtilitiesChecklist() {
    if (!contractUtilitiesListDiv || !allUtilities.length) {
      if (contractUtilitiesListDiv)
        contractUtilitiesListDiv.innerHTML =
          '<p class="text-muted small m-0">Không có tiện ích nào.</p>';
      return;
    }
    contractUtilitiesListDiv.innerHTML = ""; // Clear previous

    const contractUtilityIds = new Set(
      currentContractData?.utilities?.map(
        (u) => (typeof u === "string" ? u : u._id) 
      ) || []
    );

    allUtilities.forEach((utility) => {
      const isChecked = contractUtilityIds.has(utility._id);
      const div = document.createElement("div");
      div.classList.add("form-check", "form-check-sm");
      const utilityDisplayName =
        utilityNameMap[utility.name] ||
        (utility.name
          ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
          : "Tiện ích");
      const priceDisplay = (utility.price || 0).toLocaleString("vi-VN");

      div.innerHTML = `
          <input class="form-check-input contract-utility-checkbox" type="checkbox" value="${
            utility._id
          }" id="edit-utility-${utility._id}" data-price="${
        utility.price || 0
      }" ${isChecked ? "checked" : ""}>
          <label class="form-check-label" for="edit-utility-${
            utility._id
          }">${utilityDisplayName} (+${priceDisplay} VNĐ)</label>
      `;
      contractUtilitiesListDiv.appendChild(div);
    });
  }

  // Function: Renders the room selection dropdown (Vacant rooms + original room).
  async function renderRoomSelectionDropdown() {
    if (!contractRoomIdSelect || !roomSelectLoadingDiv) return;

    contractRoomIdSelect.innerHTML =
      '<option value="" selected disabled>Đang tải...</option>';
    contractRoomIdSelect.disabled = true;
    roomSelectLoadingDiv.style.display = "block";

    try {
      // Fetch only vacant rooms
      const vacantRooms = await RoomService.getAllRooms({ status: "vacant" });
      allVacantRooms = vacantRooms || [];

      // Ensure the original room is in the list, even if not vacant anymore
      if (
        originalRoomData &&
        !allVacantRooms.some((room) => room._id === originalRoomData._id)
      ) {
        allVacantRooms.push(originalRoomData); // Add original room if not already listed
      }

      contractRoomIdSelect.innerHTML =
        '<option value="" selected disabled>Chọn phòng...</option>'; // Reset

      if (allVacantRooms.length > 0) {
        allVacantRooms.forEach((room) => {
          const option = document.createElement("option");
          option.value = room._id;
          option.textContent =
            originalRoomData._id === room._id
              ? `P. ${room.roomNumber || "N/A"} - ĐC. ${
                  room.address || "N/A"
                } (Phòng hiện tại)`
              : `P. ${room.roomNumber || "N/A"} - ĐC. ${room.address || "N/A"}`;
          option.dataset.rentPrice = room.rentPrice || 0;
          // Mark the contract's current room as selected
          if (room._id === currentContractData?.roomId) {
            option.selected = true;
          }
          contractRoomIdSelect.appendChild(option);
        });
        contractRoomIdSelect.disabled = false;
      } else {
        contractRoomIdSelect.innerHTML =
          '<option value="" disabled>Không còn phòng trống</option>';
      }
    } catch (error) {
      console.error("Error loading rooms for dropdown:", error);
      contractRoomIdSelect.innerHTML =
        '<option value="" disabled>Lỗi tải phòng</option>';
    } finally {
      roomSelectLoadingDiv.style.display = "none";
    }
  }

  // Function: Updates the deposit amount based on selected room and checked amenities.
  function updateContractDeposit() {
    if (!contractDepositInput) return;

    let totalDeposit = baseContractDeposit; // Start with the base deposit from the selected room's rent

    // Add price of checked amenities
    const checkedAmenities =
      contractAmenitiesListDiv?.querySelectorAll(
        ".contract-amenity-checkbox:checked"
      ) || [];
    checkedAmenities.forEach((checkbox) => {
      totalDeposit += parseFloat(checkbox.dataset.price || 0);
    });

    contractDepositInput.value = totalDeposit;
  }

  // --- Data Fetching and Population ---

  // Function: Fetches all necessary data (contract, amenities, utilities, rooms) and populates the form UI.
  async function fetchAndRenderUiContractDetails() {
    currentContractId = getContractIdFromUrl();
    if (!currentContractId) {
      showModalFeedback(
        "Không tìm thấy ID hợp đồng hợp lệ trong URL.",
        "danger"
      );
      if (editContractForm) editContractForm.style.display = "none";
      return;
    }

    // Reset state
    currentContractData = null;
    originalRoomData = null;
    allAmenities = [];
    allUtilities = [];
    allVacantRooms = [];
    baseContractDeposit = 0;

    hideModalFeedback();
    if (editContractForm) editContractForm.style.display = "block";
    if (contractAmenitiesListDiv)
      contractAmenitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải tiện nghi...</p>';
    if (contractUtilitiesListDiv)
      contractUtilitiesListDiv.innerHTML =
        '<p class="text-muted small m-0">Đang tải tiện ích...</p>';

    try {
      const [contractDetails, amenities, utilities] = await Promise.all([
        ContractService.getContractById(currentContractId),
        AmenityService.getAllAmenities(),
        UtilityService.getAllUtilities()
      ]);

      currentContractData = contractDetails;
      allAmenities = amenities || [];
      allUtilities = utilities || [];

      if (currentContractData.roomId) {
        originalRoomData = await RoomService.getRoomById(
          currentContractData.roomId
        );
        baseContractDeposit = originalRoomData.rentPrice || 0;
      } else {
        console.warn("Contract loaded has no associated room ID.");
        baseContractDeposit = 0;
      }

      // Populate UI elements
      populateFormFieldsBasicInfo();
      renderAmenitiesChecklist();
      renderUtilitiesChecklist();
      await renderRoomSelectionDropdown();
      updateContractDeposit();

      if (editContractForm) editContractForm.classList.remove("was-validated");
    } catch (error) {
      console.error(error);
      const errorMessage = (
        error?.response?.data?.message ||
        error.message ||
        "Unknown error"
      ).toString();
      showModalFeedback(
        `Lỗi khi tải dữ liệu hợp đồng: ${
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
        }`,
        "danger"
      );
      if (editContractForm) editContractForm.style.display = "none";
    }
  }

  // Function: Populates basic form fields with current contract data.
  function populateFormFieldsBasicInfo() {
    if (!currentContractData || !editContractForm) return;

    if (contractCodeInput) {
      contractCodeInput.value = currentContractData.contractCode || "N/A";
      contractCodeInput.readOnly = true;
    }

    if (contractRentPriceInput) {
      contractRentPriceInput.value = currentContractData.rentPrice || 0;
    }

    if (contractDepositInput) {
      contractDepositInput.value = currentContractData.deposit || 0;
    }

    if (contractStartDateInput) {
      contractStartDateInput.value = formatDateForInput(
        currentContractData.startDate
      );
    }

    if (contractEndDateInput) {
      contractEndDateInput.value = formatDateForInput(
        currentContractData.endDate
      );
    }

    if (contractStatusSelect) {
      contractStatusSelect.value = currentContractData.status || "active";
    }
  }

  // --- Event Handlers ---

  // Function: Handles the form submission for saving changes.
  async function handleSaveChanges() {
    hideModalFeedback();

    if (!editContractForm || !editContractForm.checkValidity()) {
      if (editContractForm) editContractForm.classList.add("was-validated");
      showModalFeedback(
        "Vui lòng kiểm tra lại các trường thông tin bắt buộc.",
        "warning"
      );
      return;
    }
    if (editContractForm) editContractForm.classList.add("was-validated");

    const startDate = contractStartDateInput?.value;
    const endDate = contractEndDateInput?.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      showModalFeedback(
        "Ngày kết thúc không được trước ngày bắt đầu.",
        "warning"
      );
      return;
    }

    if (!currentContractId || !currentContractData) {
      showModalFeedback(
        "Lỗi: Không thể xác định dữ liệu hợp đồng hiện tại.",
        "danger"
      );
      return;
    }

    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    const errors = []; // To collect errors from multiple API calls

    try {
      // Collect current data from form
      const updatedAmenityIds = Array.from(
        contractAmenitiesListDiv?.querySelectorAll(
          ".contract-amenity-checkbox:checked"
        ) || []
      ).map((cb) => cb.value);
      const updatedUtilityIds = Array.from(
        contractUtilitiesListDiv?.querySelectorAll(
          ".contract-utility-checkbox:checked"
        ) || []
      ).map((cb) => cb.value);

      const updatedContractData = {
        roomId: contractRoomIdSelect.value,
        rentPrice: parseInt(contractRentPriceInput.value, 10) || 0,
        deposit: parseInt(contractDepositInput.value, 10) || 0,
        startDate: contractStartDateInput.value,
        endDate: contractEndDateInput.value,
        status: contractStatusSelect.value,
        amenities: updatedAmenityIds,
        utilities: updatedUtilityIds
      };

      // Compare with initial data
      let hasChanges = false;
      const initialAmenities = new Set(
        currentContractData.amenities?.map((a) =>
          typeof a === "string" ? a : a._id
        ) || []
      );
      const initialUtilities = new Set(
        currentContractData.utilities?.map((u) =>
          typeof u === "string" ? u : u._id
        ) || []
      );
      const currentAmenities = new Set(updatedContractData.amenities);
      const currentUtilities = new Set(updatedContractData.utilities);

      const initialStartDate = currentContractData.startDate
        ? currentContractData.startDate.substring(0, 10)
        : "";
      const initialEndDate = currentContractData.endDate
        ? currentContractData.endDate.substring(0, 10)
        : "";

      if (
        updatedContractData.roomId !== currentContractData.roomId ||
        updatedContractData.rentPrice !== currentContractData.rentPrice ||
        updatedContractData.deposit !== currentContractData.deposit ||
        updatedContractData.startDate !== initialStartDate ||
        updatedContractData.endDate !== initialEndDate ||
        updatedContractData.status !== currentContractData.status ||
        initialAmenities.size !== currentAmenities.size ||
        ![...initialAmenities].every((id) => currentAmenities.has(id)) ||
        initialUtilities.size !== currentUtilities.size ||
        ![...initialUtilities].every((id) => currentUtilities.has(id))
      ) {
        hasChanges = true;
      }

      if (hasChanges) {
        await ContractService.updateContract(
          currentContractId,
          updatedContractData
        );
        showModalFeedback("Cập nhật hợp đồng thành công!", "success");

        setTimeout(async () => {
          try {
            await fetchAndRenderUiContractDetails();
          } catch (fetchError) {
            console.error(fetchError);
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
      console.error(error);
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
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
    }
  }

  // --- Event Listener Setup ---

  // Event Listener: Room Selection Change
  if (contractRoomIdSelect) {
    contractRoomIdSelect.addEventListener("change", (event) => {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const rentPrice = parseFloat(selectedOption.dataset.rentPrice || 0);

      if (contractRentPriceInput) {
        contractRentPriceInput.value = rentPrice;
      }

      baseContractDeposit = rentPrice;
      updateContractDeposit();
    });
  }

  // Event Listener: Amenity Checkbox Change (using event delegation)
  if (contractAmenitiesListDiv) {
    contractAmenitiesListDiv.addEventListener("change", (event) => {
      if (event.target.classList.contains("contract-amenity-checkbox")) {
        updateContractDeposit();
      }
    });
  }

  // Event Listener: Save Changes Button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // Event Listener: Cancel Button
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // --- Initial Load ---
  fetchAndRenderUiContractDetails();
});
