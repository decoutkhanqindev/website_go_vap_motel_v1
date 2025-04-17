import RoomService from "../services/RoomService.js";
import ContractService from "../services/ContractService.js";
import UserService from "../services/UserService.js";
import OccupantService from "../services/OccupantService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- State for Room Tab (Client View) ---
let clientRoomCurrentImageIndex = 0;
let clientRoomImageElements = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const navItems = document.querySelectorAll(
    ".navbar-nav .nav-item:not(.logout-tab)"
  );
  const contentDivs = document.querySelectorAll(
    ".content .container > div:not(#occupant-status-message)"
  );
  const logoutLink = document.querySelector(".logout-tab a");
  const occupantStatusMessageDiv = document.getElementById(
    "occupant-status-message"
  );
  const mainNavbar = document.querySelector(".navbar .navbar-nav");

  // --- Selectors: Room Tab (Client View) UI ---
  const clientRoomInfoContainer = document.querySelector(
    "#room-tab-container .room-info-container"
  ); // Target within the tab container
  const clientAmenityListContainer = document.querySelector(
    "#room-tab-container .amenity-list-container"
  );
  const clientUtilityListContainer = document.querySelector(
    "#room-tab-container .utility-list-container"
  );
  const clientImageList = document.querySelector(
    "#room-tab-container .image-list"
  );
  const clientPrevButton = document.getElementById("prevButton");
  const clientNextButton = document.getElementById("nextButton");

  // --- Selectors: Contract Tab (Client View) UI ---
  const clientContractTabContainer = document.getElementById(
    "contract-tab-container" // Container chính của tab hợp đồng
  );
  const clientContractDetailsDiv = clientContractTabContainer?.querySelector(
    ".contract-details" // Div chứa nội dung chi tiết
  );
  const clientContractCodeInput = document.getElementById(
    "client-contractCode"
  );
  const clientContractRoomInfoInput = document.getElementById(
    "client-contractRoomInfo"
  );
  const clientContractRentPriceInput = document.getElementById(
    "client-contractRentPrice"
  );
  const clientContractDepositInput = document.getElementById(
    "client-contractDeposit"
  );
  const clientContractAmenitiesListDiv = document.getElementById(
    "client-contractAmenitiesList"
  );
  const clientContractUtilitiesListDiv = document.getElementById(
    "client-contractUtilitiesList"
  );
  const clientContractStartDateInput = document.getElementById(
    "client-contractStartDate"
  );
  const clientContractEndDateInput = document.getElementById(
    "client-contractEndDate"
  );
  const clientContractStatusInput = document.getElementById(
    "client-contractStatus"
  );

  // --- Core UI Functions ---

  // Function: Manages displaying content sections based on navigation clicks
  function showContent(targetId) {
    contentDivs.forEach((div) => (div.style.display = "none"));
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    } else {
      console.warn("Target content div not found:", targetId);
    }

    // Update active state in navbar
    document
      .querySelectorAll(".navbar-nav .nav-item")
      .forEach((item) => item.classList.remove("active-menu-item"));
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem && activeNavItem.parentElement) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // Function: Format Date to DD/MM/YYYY (Vietnamese Standard)
  function formatVietnameseDate(dateStringOrObject) {
    if (!dateStringOrObject) return "N/A";
    try {
      const date = new Date(dateStringOrObject);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
      const year = date.getFullYear();
      // const hours = date.getHours().toString().padStart(2, "0");
      // const minutes = date.getMinutes().toString().padStart(2, "0");
      // const seconds = date.getSeconds().toString().padStart(2, "0");

      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error(e);
      return "Lỗi định dạng";
    }
  }

  // Function: Format Currency to VND
  function formatVND(amount) {
    if (typeof amount !== "number") {
      amount = parseFloat(amount) || 0;
    }
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND"
    });
  }

  // --- Room Tab (Client View): Display Logic ---

  // Function: Renders the main room information (Client View - No Price Updates)
  function renderClientRoomInfoUI(room) {
    if (!clientRoomInfoContainer) return;
    clientRoomInfoContainer.innerHTML = ""; // Clear previous

    let statusText = "Không có sẵn";
    let statusClass = "status-unavailable";
    if (room.status === "vacant") {
      statusText = "Trống"; // Should ideally not happen if user is occupant
      statusClass = "status-vacant";
    } else if (room.status === "occupied") {
      statusText = "Đã thuê";
      statusClass = "status-occupied";
    }

    // Display only the base rent price, no dynamic updates
    const baseRentPrice = room.rentPrice || 0;

    clientRoomInfoContainer.innerHTML = `
        <h3 class="room-name d-flex justify-content-center align-items-center">Phòng ${
          room.roomNumber || "N/A"
        }</h3>
        <p class="room-address">
            <span class="address-label">Địa chỉ:</span>
            <span class="address-value">${room.address || "N/A"}</span>
        </p>
        <p class="room-price">
            <span class="price-label">Giá thuê cơ bản:</span>
            <span class="price-value">${baseRentPrice.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND"
            })}</span>
        </p>
        <p class="room-occupant-number">
            <span class="occupant-number-label">Số người ở tối đa:</span>
            <span class="occupant-number-value">${
              room.occupantsNumber || "N/A"
            }</span>
        </p>
        <p class="room-status">
            <span class="status-label">Trạng thái:</span>
            <span class="status-value ${statusClass}">${statusText}</span>
        </p>
        <p class="room-description">
            <span class="description-label">Mô tả:</span>
            <span class="description-value">${
              room.description
                ? room.description.charAt(0).toUpperCase() +
                  room.description.slice(1)
                : "Không có mô tả."
            }</span>
        </p>
    `;
  }

  // Function: Renders room images in the slider (Client View)
  async function renderClientRoomImagesUI(room) {
    if (!clientImageList) return;
    clientImageList.innerHTML =
      '<p class="text-muted p-3 text-center w-100">Đang tải hình ảnh...</p>';
    clientRoomImageElements = []; // Reset global image array for this view

    if (room.images && room.images.length > 0) {
      const imagePromises = room.images.map(async (imageId, index) => {
        try {
          const imageData = await RoomService.getRoomImageById(imageId);
          const base64Image = btoa(
            new Uint8Array(imageData.data.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          const imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
          const img = document.createElement("img");
          img.src = imageSrc;
          img.alt = `Hình ảnh phòng ${index + 1}`;
          img.dataset.index = index;
          return img;
        } catch (error) {
          console.error(`Lỗi tải hình ảnh ${imageId}:`, error);
          const img = document.createElement("img"); // Fallback
          img.src = "/assets/logo_error.png"; // Ensure this path is correct
          img.alt = `Lỗi tải hình ảnh ${index + 1}`;
          img.dataset.index = index;
          return img;
        }
      });

      clientImageList.innerHTML = ""; // Clear loading message before appending
      const fetchedImages = await Promise.all(imagePromises);
      fetchedImages.forEach((img) => {
        if (img) {
          clientImageList.appendChild(img);
          clientRoomImageElements.push(img);
        }
      });

      if (clientRoomImageElements.length > 0) {
        clientRoomImageElements[0].classList.add("active");
        updateClientImagePosition();
      }
    } else {
      // Display default image if none found
      clientImageList.innerHTML = ""; // Clear loading message
      const img = document.createElement("img");
      img.src = "/assets/logo_error.png"; // Ensure this path is correct
      img.alt = "Không có hình ảnh";
      img.style.width = "100%"; // Optional: ensure it fills space
      img.style.height = "auto";
      clientImageList.appendChild(img);
      clientRoomImageElements.push(img);
      if (clientPrevButton) clientPrevButton.style.display = "none";
      if (clientNextButton) clientNextButton.style.display = "none";
    }
    // Final check for button visibility
    if (clientRoomImageElements.length <= 1) {
      if (clientPrevButton) clientPrevButton.style.display = "none";
      if (clientNextButton) clientNextButton.style.display = "none";
    } else {
      if (clientPrevButton) clientPrevButton.style.display = "block"; // Use block or inline-block as needed
      if (clientNextButton) clientNextButton.style.display = "block";
    }
  }

  // Function: Creates a DOM element for a single amenity item (Client View - Display Only)
  async function createClientAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item"); // Keep class for styling
    amenityItem.dataset.amenityId = amenity._id;

    let imageSrc = "/assets/logo_error.png"; // Default/Error image path
    if (amenity.images && amenity.images.length > 0) {
      try {
        const imageData = await AmenityService.getAmenityImageById(
          amenity.images[0]
        ); // Assuming AmenityService is imported
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(`Lỗi tải hình ảnh cho tiện nghi ${amenity._id}:`, error);
      }
    }

    // Reuse mapping if available, or create locally if needed
    const amenityNameMap = {
      bed: "Giường",
      refrigerator: "Tủ lạnh",
      air_conditioner: "Máy lạnh",
      water_heater: "Vòi nước nóng",
      table_and_chairs: "Bàn ghế",
      electric_stove: "Bếp điện",
      gas_stove: "Bếp ga"
    };
    const amenityName =
      amenityNameMap[amenity.name] ||
      (amenity.name
        ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
        : "Tiện nghi");
    const amenityPrice = amenity.price || 0;

    // --- MODIFICATION: Removed buttons and deposit note ---
    amenityItem.innerHTML = `
      <img src="${imageSrc}" alt="${amenityName}" class="amenity-image">
      <div class="amenity-info">
        <h3 class="amenity-name">${amenityName}</h3>
        <p class="amenity-price">
          <span class="price-label">Giá:</span>
          <span class="price-value">${amenityPrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND"
          })}</span>
        </p>
        <p class="amenity-note" style="font-style: italic; font-weight: bold">(Cộng vào tiền cọc)</p>
      </div>
    `;

    return amenityItem;
  }

  // Function: Renders the list of amenity items (Client View)
  async function renderClientAmenityListUI(amenities) {
    if (!clientAmenityListContainer) return;
    clientAmenityListContainer.innerHTML = ""; // Clear previous

    if (!amenities || amenities.length === 0) {
      clientAmenityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>Phòng này không có tiện nghi.</p>";
      return;
    }

    const itemPromises = amenities.map((amenity) =>
      createClientAmenityItem(amenity)
    );
    const items = await Promise.all(itemPromises);
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(item));
    clientAmenityListContainer.appendChild(fragment);
  }

  // Function: Creates a DOM element for a single utility item (Client View - Display Only)
  async function createClientUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item");
    utilityItem.dataset.utilityId = utility._id;

    let imageSrc = "/assets/logo_error.png";
    if (utility.images && utility.images.length > 0) {
      try {
        const imageData = await UtilityService.getUtilityImageById(
          utility.images[0]
        ); // Assuming UtilityService is imported
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(`Lỗi tải hình ảnh tiện ích ${utility._id}:`, error);
      }
    }

    const utilityNameMap = {
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Dọn vệ sinh"
    };
    const utilityName =
      utilityNameMap[utility.name] ||
      (utility.name
        ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
        : "Tiện ích");
    const priceUnit = utility.name === "parking" ? "Xe" : "Phòng";
    const utilityPrice = utility.price || 0;

    utilityItem.innerHTML = `
      <img src="${imageSrc}" alt="${utilityName}" class="utility-image">
      <div class="utility-info">
          <h3 class="utility-name">${utilityName}</h3>
          <p class="utility-price">
              <span class="price-label">Giá:</span>
              <span class="price-value">${utilityPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND"
              })} / ${priceUnit}</span>
          </p>
          <p class="utility-note" style="font-style: italic;">(Trả phí hàng tháng)</p>
      </div>
    `;

    return utilityItem;
  }

  // Function: Renders the list of utility items (Client View)
  async function renderClientUtilityListUI(utilities) {
    if (!clientUtilityListContainer) return;
    clientUtilityListContainer.innerHTML = ""; // Clear previous

    if (!utilities || utilities.length === 0) {
      clientUtilityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>Khu trọ không có tiện ích đăng ký thêm.</p>";
      return;
    }
    const itemPromises = utilities.map((utility) =>
      createClientUtilityItem(utility)
    );
    const items = await Promise.all(itemPromises);
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (item) fragment.appendChild(item);
    });
    clientUtilityListContainer.appendChild(fragment);
  }

  // Function: Updates image slider position (Client View)
  function updateClientImagePosition() {
    if (!clientImageList || clientRoomImageElements.length === 0) return;

    // Ensure images are loaded enough to have width, might need a small delay or check
    const imageWidth = clientRoomImageElements[0].offsetWidth;
    if (imageWidth === 0) {
      // console.warn("Image width is 0, skipping position update for now.");
      // Optionally, retry after a short delay if needed:
      // setTimeout(updateClientImagePosition, 100);
      return;
    }

    const computedStyle = window.getComputedStyle(clientRoomImageElements[0]);
    const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
    const marginRight = parseFloat(computedStyle.marginRight) || 0;
    const totalMargin = marginLeft + marginRight;

    const maxTranslateX = 0;
    const minTranslateX =
      -(clientRoomImageElements.length - 1) * (imageWidth + totalMargin);
    let translateX = -clientRoomCurrentImageIndex * (imageWidth + totalMargin);
    translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));

    clientImageList.style.transform = `translateX(${translateX}px)`;

    clientRoomImageElements.forEach((img, index) =>
      img.classList.toggle("active", index === clientRoomCurrentImageIndex)
    );

    // Use visibility to avoid layout shifts if possible
    if (clientPrevButton)
      clientPrevButton.style.visibility =
        clientRoomCurrentImageIndex > 0 ? "visible" : "hidden";
    if (clientNextButton)
      clientNextButton.style.visibility =
        clientRoomCurrentImageIndex < clientRoomImageElements.length - 1
          ? "visible"
          : "hidden";
  }

  // Function: Main data fetching and rendering for the client's room tab
  async function loadClientRoomDetails(roomId) {
    console.log(`Loading details for room ID: ${roomId}`);
    try {
      // Show loading states
      if (clientRoomInfoContainer)
        clientRoomInfoContainer.innerHTML =
          "<p class='text-center p-5 text-muted'>Đang tải thông tin phòng...</p>";
      if (clientImageList) clientImageList.innerHTML = "";
      if (clientAmenityListContainer) clientAmenityListContainer.innerHTML = "";
      if (clientUtilityListContainer) clientUtilityListContainer.innerHTML = "";

      // --- Fetch Room Details ---
      const room = await RoomService.getRoomById(roomId);
      if (!room) {
        throw new Error(`Không tìm thấy phòng với ID ${roomId}.`);
      }

      // --- Render Basic Info and Images ---
      renderClientRoomInfoUI(room); // Render basic details first
      await renderClientRoomImagesUI(room); // Render images and wait

      // --- Fetch Associated Amenities and Utilities ---
      const amenityIds = room.amenities || [];
      const utilityIds = room.utilities || [];

      const amenityPromises = amenityIds.map((id) =>
        AmenityService.getAmenityById(id).catch((err) => {
          console.error(`Lỗi tải tiện nghi ID ${id}:`, err);
          return null; // Return null on error for specific item
        })
      );
      const utilityPromises = utilityIds.map((id) =>
        UtilityService.getUtilityById(id).catch((err) => {
          console.error(`Lỗi tải tiện ích ID ${id}:`, err);
          return null;
        })
      );

      // --- Wait for details and Render Lists ---
      const [detailedAmenities, detailedUtilities] = await Promise.all([
        Promise.all(amenityPromises),
        Promise.all(utilityPromises)
      ]);

      // Filter out null results from failed fetches before rendering
      await renderClientAmenityListUI(detailedAmenities.filter(Boolean));
      await renderClientUtilityListUI(detailedUtilities.filter(Boolean));
    } catch (error) {
      console.error("Lỗi khi tải hoặc hiển thị chi tiết phòng:", error);
      const errorMessage = error?.message
        ? error.message.charAt(0).toUpperCase() + error.message.slice(1)
        : "Không rõ nguyên nhân";
      if (clientRoomInfoContainer)
        clientRoomInfoContainer.innerHTML = `<p class='text-danger text-center p-5'>Lỗi tải thông tin phòng (${errorMessage}). Vui lòng thử lại.</p>`;
      // Clear other sections on error
      if (clientImageList) clientImageList.innerHTML = "";
      if (clientAmenityListContainer) clientAmenityListContainer.innerHTML = "";
      if (clientUtilityListContainer) clientUtilityListContainer.innerHTML = "";
    }
  }

  // --- Contract Tab (Client View): Display Logic ---

  // Function: Renders the included amenities list (Read-only)
  function renderClientContractAmenities(includedAmenityIds, allAmenitiesData) {
    if (!clientContractAmenitiesListDiv) return;
    clientContractAmenitiesListDiv.innerHTML = ""; // Clear previous

    // Map all amenities by ID for quick lookup
    const amenityMap = new Map(
      allAmenitiesData.map((amenity) => [amenity._id, amenity])
    );

    const includedAmenities = includedAmenityIds
      .map((id) => amenityMap.get(id))
      .filter(Boolean); // Get details and filter out any not found

    if (includedAmenities.length === 0) {
      clientContractAmenitiesListDiv.innerHTML =
        '<p class="text-muted m-0 small">Không có tiện nghi nào được bao gồm trong hợp đồng.</p>';
      return;
    }

    const listFragment = document.createDocumentFragment();
    includedAmenities.forEach((amenity) => {
      const amenityNameMap = {
        // Reuse or define map here
        bed: "Giường",
        refrigerator: "Tủ lạnh",
        air_conditioner: "Máy lạnh",
        water_heater: "Vòi nước nóng",
        table_and_chairs: "Bàn ghế",
        electric_stove: "Bếp điện",
        gas_stove: "Bếp ga"
      };
      const displayName =
        amenityNameMap[amenity.name] ||
        (amenity.name
          ? amenity.name.charAt(0).toUpperCase() + amenity.name.slice(1)
          : "Tiện nghi");
      const priceDisplay = formatVND(amenity.price);

      const p = document.createElement("p");
      p.classList.add("mb-1", "small"); // Styling for list items
      p.innerHTML = `✓ ${displayName} <span class="text-muted">(${priceDisplay})</span>`;
      listFragment.appendChild(p);
    });
    clientContractAmenitiesListDiv.appendChild(listFragment);
  }

  // Function: Renders the included utilities list (Read-only)
  function renderClientContractUtilities(includedUtilityIds, allUtilitiesData) {
    if (!clientContractUtilitiesListDiv) return;
    clientContractUtilitiesListDiv.innerHTML = ""; // Clear previous

    // Map all utilities by ID for quick lookup
    const utilityMap = new Map(
      allUtilitiesData.map((utility) => [utility._id, utility])
    );

    const includedUtilities = includedUtilityIds
      .map((id) => utilityMap.get(id))
      .filter(Boolean); // Get details and filter out any not found

    if (includedUtilities.length === 0) {
      clientContractUtilitiesListDiv.innerHTML =
        '<p class="text-muted m-0 small">Không có tiện ích nào được bao gồm trong hợp đồng.</p>';
      return;
    }

    const listFragment = document.createDocumentFragment();
    includedUtilities.forEach((utility) => {
      const utilityNameMap = {
        // Reuse or define map here
        wifi: "Wifi",
        parking: "Đỗ xe",
        cleaning: "Dọn vệ sinh"
      };
      const displayName =
        utilityNameMap[utility.name] ||
        (utility.name
          ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
          : "Tiện ích");
      const priceUnit = utility.name === "parking" ? "Xe" : "Phòng";
      const priceDisplay = `${formatVND(utility.price)} / ${priceUnit}`;

      const p = document.createElement("p");
      p.classList.add("mb-1", "small"); // Styling for list items
      p.innerHTML = `✓ ${displayName} <span class="text-muted">(${priceDisplay})</span>`;
      listFragment.appendChild(p);
    });
    clientContractUtilitiesListDiv.appendChild(listFragment);
  }

  // Function: Fetches and populates the contract details for the client view
  async function loadClientContractDetails(contractCode) {
    if (!contractCode) {
      console.warn("Không có ID hợp đồng để tải.");
      if (clientContractTabContainer)
        clientContractTabContainer.innerHTML =
          "<p class='alert alert-warning'>Không tìm thấy thông tin hợp đồng.</p>";
      return;
    }

    console.log(`Đang tải chi tiết hợp đồng ID: ${contractCode}`);
    // --- Show Loading State ---
    if (clientContractDetailsDiv)
      clientContractDetailsDiv.style.opacity = "0.5"; // Dim content while loading
    if (clientContractCodeInput) clientContractCodeInput.value = "Đang tải...";
    // Clear other fields briefly
    const fieldsToClear = [
      clientContractRoomInfoInput,
      clientContractRentPriceInput,
      clientContractDepositInput,
      clientContractStartDateInput,
      clientContractEndDateInput,
      clientContractStatusInput
    ];
    fieldsToClear.forEach((input) => {
      if (input) input.value = "";
    });
    if (clientContractAmenitiesListDiv)
      clientContractAmenitiesListDiv.innerHTML =
        '<p class="text-muted m-0 small">Đang tải tiện nghi...</p>';
    if (clientContractUtilitiesListDiv)
      clientContractUtilitiesListDiv.innerHTML =
        '<p class="text-muted m-0 small">Đang tải tiện ích...</p>';

    try {
      // Fetch all necessary data in parallel
      const [contractData, allAmenitiesData, allUtilitiesData] =
        await Promise.all([
          ContractService.getContractByContractCode(contractCode),
          AmenityService.getAllAmenities(), // Get all amenities for lookup
          UtilityService.getAllUtilities() // Get all utilities for lookup
        ]);

      if (!contractData) {
        throw new Error("Không tìm thấy dữ liệu hợp đồng.");
      }

      // Fetch room details separately (needed for room info)
      let roomData = null;
      if (contractData.roomId) {
        try {
          roomData = await RoomService.getRoomById(contractData.roomId);
        } catch (roomError) {
          console.error(
            `Lỗi tải thông tin phòng (${contractData.roomId}):`,
            roomError
          );
          // Continue without room info if it fails
        }
      }

      // --- Populate Basic Info ---
      if (clientContractCodeInput)
        clientContractCodeInput.value = contractData.contractCode || "N/A";
      if (clientContractRentPriceInput)
        clientContractRentPriceInput.value = formatVND(contractData.rentPrice);
      if (clientContractDepositInput)
        clientContractDepositInput.value = formatVND(contractData.deposit);
      if (clientContractStartDateInput)
        clientContractStartDateInput.value = formatVietnameseDate(
          contractData.startDate
        ); // Use Vietnamese format
      if (clientContractEndDateInput)
        clientContractEndDateInput.value = formatVietnameseDate(
          contractData.endDate
        ); // Use Vietnamese format
      if (clientContractStatusInput) {
        const statusMap = {
          active: "Còn hiệu lực",
          expired: "Hết hạn",
          terminated: "Đã hủy"
        };
        // Get the translated text from the map, or use the original status if not found
        clientContractStatusInput.value =
          statusMap[contractData.status] || contractData.status;
      }

      // --- Populate Room Info ---
      if (clientContractRoomInfoInput) {
        clientContractRoomInfoInput.value = roomData
          ? `Phòng ${roomData.roomNumber || "N/A"} - ${
              roomData.address || "N/A"
            }`
          : "Không tìm thấy thông tin phòng";
      }

      // --- Render Included Amenities/Utilities ---
      const includedAmenityIds = contractData.amenities || [];
      const includedUtilityIds = contractData.utilities || [];

      renderClientContractAmenities(includedAmenityIds, allAmenitiesData || []);
      renderClientContractUtilities(includedUtilityIds, allUtilitiesData || []);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết hợp đồng:", error);
      const errorMessage =
        error?.response?.data?.message || error.message || "Lỗi không xác định";
      // Display error within the contract tab container
      if (clientContractTabContainer) {
        // Clear potential loading states first
        if (clientContractCodeInput) clientContractCodeInput.value = "Lỗi";
        if (clientContractAmenitiesListDiv)
          clientContractAmenitiesListDiv.innerHTML = "";
        if (clientContractUtilitiesListDiv)
          clientContractUtilitiesListDiv.innerHTML = "";
        // Show error message
        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger";
        errorDiv.textContent = `Không thể tải thông tin hợp đồng: ${errorMessage}. Vui lòng thử làm mới trang.`;
        // Prepend error inside the main container, before the details div
        clientContractTabContainer.insertBefore(
          errorDiv,
          clientContractDetailsDiv
        );
      }
    } finally {
      // --- Restore Opacity ---
      if (clientContractDetailsDiv)
        clientContractDetailsDiv.style.opacity = "1";
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
          if (
            occupantStatusMessageDiv.style.display !== "block" ||
            occupantStatusMessageDiv.textContent === ""
          ) {
            showContent(targetId);
          }
        }
      });
    }
  });

  // --- Event Listeners: Room Tab (Client View) Image Slider ---
  if (clientPrevButton) {
    clientPrevButton.addEventListener("click", () => {
      if (clientRoomCurrentImageIndex > 0) {
        clientRoomCurrentImageIndex--;
        updateClientImagePosition();
      }
    });
  }
  if (clientNextButton) {
    clientNextButton.addEventListener("click", () => {
      if (clientRoomCurrentImageIndex < clientRoomImageElements.length - 1) {
        clientRoomCurrentImageIndex++;
        updateClientImagePosition();
      }
    });
  }

  // Event Listener for Logout Link
  if (logoutLink) {
    logoutLink.addEventListener("click", async (event) => {
      event.preventDefault();

      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn đăng xuất không?"
      );
      if (!confirmed) {
        return;
      }

      logoutLink.parentElement.style.pointerEvents = "none";
      logoutLink.innerHTML = "Đang xử lý...";

      try {
        await UserService.logoutUser();
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accessToken");
        alert(
          "Đã xảy ra lỗi khi đăng xuất khỏi máy chủ, nhưng bạn sẽ được đăng xuất khỏi trình duyệt này."
        );
      } finally {
        window.location.replace("/");
      }
    });
  }

  // --- Initial Page Load Logic ---
  async function initializePage() {
    // Display a loading message initially
    occupantStatusMessageDiv.textContent = "Đang tải dữ liệu người dùng...";
    occupantStatusMessageDiv.className = "alert alert-info";
    occupantStatusMessageDiv.style.display = "block";
    contentDivs.forEach((div) => (div.style.display = "none"));

    try {
      const currentUser = await UserService.getMe();
      if (!currentUser || !currentUser._id) {
        throw new Error("Không thể xác thực người dùng.");
      }
      const userId = currentUser._id;

      occupantStatusMessageDiv.textContent =
        "Đang kiểm tra thông tin thuê phòng...";
      const occupants = await OccupantService.getAllOccupants({
        tenantId: userId
      });

      if (occupants && occupants.length > 0) {
        // User is an occupant
        const userOccupantData = occupants[0]; // Get the first occupancy record
        const userRoomId = userOccupantData.roomId;
        const userContractCode = userOccupantData.contractCode;

        occupantStatusMessageDiv.style.display = "none";
        occupantStatusMessageDiv.textContent = "";
        occupantStatusMessageDiv.className = "alert";

        showContent("room-tab-container"); // Show default tab

        // Enable navigation
        if (mainNavbar) mainNavbar.style.pointerEvents = "auto";

        if (userRoomId) {
          loadClientRoomDetails(userRoomId);
        } else {
          console.error("Occupant data missing room ID.");
          if (clientRoomInfoContainer) {
            clientRoomInfoContainer.innerHTML =
              "<p class='text-danger text-center p-5'>Không thể xác định phòng của bạn.</p>";
          }
        }

        if (userContractCode) {
          loadClientContractDetails(userContractCode);
        } else {
          console.warn(
            "Dữ liệu người thuê không chứa ID hợp đồng. Không thể tải chi tiết hợp đồng."
          );
          if (clientContractTabContainer) {
            clientContractTabContainer.innerHTML =
              "<p class='alert alert-warning m-3'>Không tìm thấy ID hợp đồng liên kết với tài khoản của bạn.</p>";
          }
        }

        // ... load data for other client tabs if needed ...
      }
    } catch (error) {
      console.error(error);
      if (
        error.response &&
        error.response.status === 404 &&
        error.config?.url?.includes("/occupants")
      ) {
        // User is NOT an occupant (API returned 404 Not Found)
        occupantStatusMessageDiv.textContent =
          "Bạn hiện không phải là người thuê phòng trong hệ thống. Vui lòng liên hệ quản lý.";
        occupantStatusMessageDiv.className = "alert alert-warning";
        occupantStatusMessageDiv.style.display = "block";
        contentDivs.forEach((div) => (div.style.display = "none"));
        if (mainNavbar) mainNavbar.style.pointerEvents = "none";
        if (logoutLink) logoutLink.parentElement.style.pointerEvents = "auto";
      } else {
        let errorMessage =
          "Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.";
        if (
          error.response?.status === 401 ||
          error.message.includes("xác thực")
        ) {
          errorMessage =
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
          setTimeout(() => window.location.replace("/"), 3000);
        } else if (error.message) {
          errorMessage += ` (Chi tiết: ${
            error.response?.data?.message || error.message
          })`;
        }
        occupantStatusMessageDiv.textContent = errorMessage;
        occupantStatusMessageDiv.className = "alert alert-danger";
        occupantStatusMessageDiv.style.display = "block";
        contentDivs.forEach((div) => (div.style.display = "none"));
        if (mainNavbar) mainNavbar.style.pointerEvents = "none";
        if (logoutLink) logoutLink.parentElement.style.pointerEvents = "auto";
      }
    }
  }

  initializePage(); // Execute initialization
});
