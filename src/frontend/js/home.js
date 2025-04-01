import RoomService from "../js/services/RoomService.js";
import AmenityService from "../js/services/AmenityService.js";
import UtilityService from "../js/services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Rooms Tab Pagination & Data ---
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 9;
let currentRoomData = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors: General Navigation & Content Areas ---
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // --- Selectors: Home Tab Specific UI Elements ---
  const branchContainer = document.querySelector(".branch .row");
  const homeRoomListContainer = document.querySelector(
    ".room-list .room-list-container" // Specific to home tab's room list
  );
  const homeAmenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container" // Specific to home tab's amenity list
  );

  // --- Selectors: Rooms Tab Filter Controls & List ---
  const statusFilter = document.getElementById("statusFilter");
  const priceRangeInput = document.getElementById("priceRange");
  const minPriceSpan = document.getElementById("minPrice");
  const addressFilter = document.getElementById("addressFilter");
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");
  const applyFiltersButton = document.getElementById("applyFilters");
  const roomsTabRoomListContainer = document.querySelector(
    ".rooms .room-list-container" // Specific container for rooms tab
  );
  const paginationContainer = document.querySelector(".pagination");

  // --- Selectors: Amenities & Utilities Tab Specific Lists ---
  const amenitiesTabAmenityListContainer = document.querySelector(
    ".amenities-utilities .amenities-container .amenity-list-container"
  );
  const utilitiesTabUtilityListContainer = document.querySelector(
    ".amenities-utilities .utilities-container .utility-list-container"
  );

  // --- Selectors: Other Navigation Elements ---
  const loginTab = document.querySelector(".login-tab");

  // --- Core Utility Functions ---

  // Function: Manages displaying content sections based on navigation clicks and updates nav style.
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

  // Function: Shuffles array elements randomly (Fisher-Yates Algorithm).
  function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i]
      ];
    }
    return shuffledArray;
  }

  // Function: Attaches click listeners to room items for navigating to details page.
  function addRoomClickListeners() {
    const roomItems = document.querySelectorAll(".room-item");
    roomItems.forEach((roomItem) => {
      if (!roomItem.hasAttribute("data-listener-added")) {
        roomItem.addEventListener("click", () => {
          const roomId = roomItem.dataset.id;
          if (roomId) {
            window.location.href = `/client/room/details/${roomId}`;
          } else {
            console.error("Room ID not found on clicked item:", roomItem);
          }
        });
        roomItem.setAttribute("data-listener-added", "true");
      }
    });
  }

  // --- Shared UI Creation Functions (Used across multiple tabs) ---

  // Function: Creates a DOM element for a single room item (card) with async image loading.
  async function createRoomItem(room) {
    const roomItem = document.createElement("div");
    roomItem.classList.add("room-item");
    roomItem.dataset.id = room._id;

    let imageSrc = "../../assets/logo_error.png"; // Default/fallback image
    if (room.images && room.images.length > 0) {
      try {
        const imageData = await RoomService.getRoomImageById(room.images[0]);
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(`Error loading image for room ${room._id}:`, error);
        imageSrc = "../../assets/logo_error.png"; // Use fallback on error
      }
    }

    let statusText = "Không có sẵn";
    let statusClass = "status-unavailable";
    if (room.status === "vacant") {
      statusText = "Trống";
      statusClass = "status-vacant";
    } else if (room.status === "occupied") {
      statusText = "Đã thuê";
      statusClass = "status-occupied";
    }

    roomItem.innerHTML = `
      <img src="${imageSrc}" alt="${
      room.name || "Room image"
    }" class="room-image">
      <div class="room-info">
        <h3 class="room-name">Phòng ${room.roomNumber || "N/A"}</h3>
        <p class="room-address">
          <span class="address-label">Địa chỉ:</span>
          <span class="address-value">${room.address || "N/A"}</span>
        </p>
        <p class="room-price">
          <span class="price-label">Giá:</span>
          <span class="price-value">${
            room.rentPrice
              ? room.rentPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND"
                })
              : "N/A"
          }</span>
        </p>
        <p class="room-occupant-number">
          <span class="occupant-number-label">Số người ở:</span>
          <span class="occupant-number-value">${
            room.occupantsNumber || "N/A"
          }</span>
        </p>
        <p class="room-status">
          <span class="status-label">Trạng thái:</span>
          <span class="status-value ${statusClass}">${statusText}</span>
        </p>
      </div>
    `;
    return roomItem;
  }

  // Function: Creates a DOM element for a single amenity item with async image loading.
  async function createAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item");

    let imageSrc = "../../assets/logo_error.png";
    if (amenity.images && amenity.images.length > 0) {
      try {
        const imageData = await AmenityService.getAmenityImageById(
          amenity.images[0]
        );
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(`Error loading image for amenity ${amenity._id}:`, error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

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

    amenityItem.innerHTML = `
      <img src="${imageSrc}" alt="${amenityName}" class="amenity-image">
      <div class="amenity-info">
        <h3 class="amenity-name">${amenityName}</h3>
        <p class="amenity-price">
          <span class="price-label">Giá:</span>
          <span class="price-value">${
            amenity.price
              ? amenity.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND"
                })
              : "N/A"
          } / phòng</span>
        </p>
        <p class="amenity-note" style="font-style: italic; font-weight: bold">(Cộng vào tiền cọc)</p>
      </div>
    `;
    return amenityItem;
  }

  // Function: Creates a DOM element for a single utility item with async image loading.
  async function createUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item");

    let imageSrc = "../../assets/logo_error.png";
    if (utility.images && utility.images.length > 0) {
      try {
        const imageData = await UtilityService.getUtilityImageById(
          utility.images[0]
        );
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        console.error(`Error loading image for utility ${utility._id}:`, error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    const utilityNameMap = {
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };
    const utilityName =
      utilityNameMap[utility.name] ||
      (utility.name
        ? utility.name.charAt(0).toUpperCase() + utility.name.slice(1)
        : "Tiện ích");

    const priceUnit = utility.name === "parking" ? "Xe" : "Phòng";

    utilityItem.innerHTML = `
      <img src="${imageSrc}" alt="${utilityName}" class="utility-image">
      <div class="utility-info">
        <h3 class="utility-name">${utilityName}</h3>
        <p class="utility-price">
          <span class="price-label">Giá:</span>
          <span class="price-value">${
            utility.price
              ? utility.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND"
                })
              : "N/A"
          } / ${priceUnit}</span>
        </p>
        <p class="utility-note" style="font-style: italic;">(Trả phí hàng tháng)</p>
      </div>
    `;
    return utilityItem;
  }

  // --- Home Tab: Data Fetching & Rendering Logic ---

  // Function: Fetches and renders all necessary UI elements for the Home tab.
  async function fetchAndRenderUiForHomeTab() {
    try {
      const rooms = await RoomService.getAllRooms({});
      renderBranchUIHomeTab(rooms);
      await renderRoomListUIHomeTab(rooms, 10); // Limit random rooms
    } catch (error) {
      console.error("Error fetching/rendering rooms for home tab:", error);
      if (branchContainer)
        branchContainer.innerHTML =
          "<p class='text-danger text-center'>Lỗi tải thông tin chi nhánh.</p>";
      if (homeRoomListContainer)
        homeRoomListContainer.innerHTML =
          "<p class='text-danger text-center'>Lỗi tải danh sách phòng.</p>";
    }

    try {
      const amenities = await AmenityService.getAllAmenities();
      await renderAmenityListUIHomeTab(amenities);
    } catch (error) {
      console.error("Error fetching/rendering amenities for home tab:", error);
      if (homeAmenityListContainer)
        homeAmenityListContainer.innerHTML =
          "<p class='text-danger text-center'>Lỗi tải danh sách tiện nghi.</p>";
    }
  }

  // --- Home Tab: UI Rendering Functions ---

  // Function: Renders the branch summary section based on room data.
  function renderBranchUIHomeTab(rooms) {
    if (!branchContainer) return;
    branchContainer.innerHTML = "";

    function createBranchItem(address, total, vacant) {
      const roomDiv = document.createElement("div");
      roomDiv.classList.add("col-md-6");
      roomDiv.innerHTML = `
        <div class="branch-item">
          <p class="branch-address">📍 ${address}</p>
          <p class="branch-info-total">Tổng số phòng: ${total}</p>
          <p class="branch-info-vaccant">Số phòng trống: ${vacant}</p>
        </div>
      `;
      return roomDiv;
    }

    const allAddresses = rooms.map((room) => room.address).filter(Boolean);
    const uniqueAddresses = [...new Set(allAddresses)];

    uniqueAddresses.forEach((address) => {
      const roomsFilteredByAddress = rooms.filter((room) =>
        room.address?.includes(address)
      );
      const totalRoomsAtAddress = roomsFilteredByAddress.length;
      const vacantRoomsAtAddress = roomsFilteredByAddress.filter(
        (r) => r.status === "vacant"
      ).length;
      branchContainer.appendChild(
        createBranchItem(address, totalRoomsAtAddress, vacantRoomsAtAddress)
      );
    });
  }

  // Function: Renders a list of room items (random subset) in the Home tab.
  async function renderRoomListUIHomeTab(rooms, numberOfRandomRooms = 0) {
    if (!homeRoomListContainer) return;
    homeRoomListContainer.innerHTML = "";

    let roomsToShow = rooms;
    if (numberOfRandomRooms > 0) {
      const shuffledRooms = shuffleArray(rooms);
      const actualNumberOfRandom = Math.min(
        numberOfRandomRooms,
        shuffledRooms.length
      );
      roomsToShow = shuffledRooms.slice(0, actualNumberOfRandom);
    }

    const itemsPromises = roomsToShow.map((room) => createRoomItem(room));

    try {
      const createdItems = await Promise.all(itemsPromises);
      const fragment = document.createDocumentFragment();
      createdItems.forEach((item) => fragment.appendChild(item));
      homeRoomListContainer.appendChild(fragment);
      addRoomClickListeners(); // Add listeners after appending
    } catch (error) {
      console.error("Error rendering room list for home tab:", error);
      homeRoomListContainer.innerHTML =
        "<p class='text-danger text-center'>Đã xảy ra lỗi khi tải danh sách phòng.</p>";
    }
  }

  // Function: Renders the list of amenity items in the Home tab.
  async function renderAmenityListUIHomeTab(amenities) {
    if (!homeAmenityListContainer) return;
    homeAmenityListContainer.innerHTML = "";

    if (!amenities || amenities.length === 0) {
      homeAmenityListContainer.innerHTML =
        "<p class='text-muted text-center'>Không có tiện nghi nào được liệt kê.</p>";
      return;
    }

    try {
      const itemPromises = amenities.map((amenity) =>
        createAmenityItem(amenity)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(item));
      homeAmenityListContainer.appendChild(fragment);
    } catch (error) {
      console.error("Error rendering amenity list for home tab:", error);
      homeAmenityListContainer.innerHTML =
        '<p class="error-message text-danger text-center">Lỗi tải tiện nghi</p>';
    }
  }

  // --- Rooms Tab: Data Fetching & Filtering Logic ---

  // Function: Populates the address filter dropdown for the Rooms tab.
  async function populateAddressFilter() {
    if (!addressFilter) return;
    while (addressFilter.options.length > 1) {
      addressFilter.remove(1);
    }
    try {
      const allRooms = await RoomService.getAllRooms({});
      const allAddresses = allRooms.map((room) => room.address).filter(Boolean);
      const uniqueAddresses = [...new Set(allAddresses)];
      uniqueAddresses.forEach((addr) => {
        const option = document.createElement("option");
        option.value = addr;
        option.textContent = addr;
        addressFilter.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating address filter:", error);
      const errorOption = document.createElement("option");
      errorOption.textContent = "Lỗi tải địa chỉ";
      errorOption.disabled = true;
      addressFilter.appendChild(errorOption);
    }
  }

  // Function: Fetches room data based on filters and triggers UI rendering for the Rooms tab.
  async function fetchAndRenderUiForRoomsTab() {
    if (roomsTabRoomListContainer)
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 p-5"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang tải dữ liệu phòng...</div>';
    if (paginationContainer) paginationContainer.innerHTML = "";

    try {
      // Get filter values
      const status = statusFilter?.value || "all";
      const minPrice = priceRangeInput?.value || "0";
      const maxPrice = priceRangeInput?.getAttribute("max") || "5000000";
      const address = addressFilter?.value || "all";
      const minOccupant = occupantNumberRangeInput?.value || "0";
      const maxOccupant = occupantNumberRangeInput?.getAttribute("max") || "5";

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
      await renderRoomListUIRoomsTab(); // Await the async render
    } catch (error) {
      console.error("Error fetching rooms for rooms tab:", error);
      if (roomsTabRoomListContainer)
        roomsTabRoomListContainer.innerHTML =
          '<div class="text-center w-100 text-danger p-3">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>';
    }
  }

  // --- Rooms Tab: UI Rendering Functions ---

  // Function: Renders the paginated list of room items for the Rooms tab.
  async function renderRoomListUIRoomsTab() {
    if (!roomsTabRoomListContainer) return;
    roomsTabRoomListContainer.innerHTML = ""; // Clear previous items

    if (!Array.isArray(currentRoomData)) {
      console.error(
        "renderRoomListUIRoomsTab error: currentRoomData is not an array",
        currentRoomData
      );
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 error-message text-danger">Lỗi: Dữ liệu phòng không hợp lệ.</div>';
      renderPaginationUI();
      return;
    }

    if (currentRoomData.length === 0) {
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 p-3">Không tìm thấy phòng nào phù hợp với bộ lọc của bạn.</div>';
      renderPaginationUI();
      return;
    }

    try {
      const startIndex = (currentPage - 1) * roomsPerPage;
      const endIndex = Math.min(
        startIndex + roomsPerPage,
        currentRoomData.length
      );
      const roomsToDisplay = currentRoomData.slice(startIndex, endIndex);

      if (roomsToDisplay.length === 0 && currentPage > 1) {
        console.warn(
          `No rooms found on page ${currentPage}, total rooms: ${totalRooms}`
        );
        roomsTabRoomListContainer.innerHTML = `<div class="text-center w-100 p-3">Không có phòng nào trên trang ${currentPage}.</div>`;
        renderPaginationUI();
        return;
      }

      const itemPromises = roomsToDisplay.map((room) => createRoomItem(room));
      const items = await Promise.all(itemPromises);

      // Render items using Bootstrap grid layout
      const fragment = document.createDocumentFragment();
      let currentRow = null;
      items.forEach((roomItem, index) => {
        if (index % 3 === 0) {
          // Start new row every 3 items
          currentRow = document.createElement("div");
          currentRow.classList.add("row", "mb-4");
          fragment.appendChild(currentRow);
        }
        const colDiv = document.createElement("div");
        colDiv.classList.add(
          "col-lg-4",
          "col-md-6",
          "col-12",
          "d-flex",
          "justify-content-center",
          "mb-3"
        );
        colDiv.appendChild(roomItem);
        if (currentRow) {
          currentRow.appendChild(colDiv);
        } else {
          console.error("CurrentRow not defined when creating room grid");
          fragment.appendChild(colDiv); // Fallback
        }
      });

      roomsTabRoomListContainer.appendChild(fragment);
      renderPaginationUI(); // Render pagination after items
      addRoomClickListeners(); // Add listeners after items are in DOM
    } catch (error) {
      console.error("Error rendering room list for rooms tab:", error);
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 error-message text-danger p-3">Đã xảy ra lỗi khi hiển thị danh sách phòng.</div>';
      renderPaginationUI();
    }
  }

  // Function: Renders pagination controls for the Rooms tab.
  function renderPaginationUI() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    if (totalPages <= 1) return;

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
          renderRoomListUIRoomsTab(); // Re-render list for the new page
          roomsTabRoomListContainer?.scrollIntoView({ behavior: "smooth" }); // Scroll to top
        }
      });
      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Amenities & Utilities Tab: Data Fetching & Rendering Logic ---

  // Function: Fetches and renders the lists for the dedicated Amenities and Utilities tab.
  async function fetchAndRenderUiForAmenitiesAndUtilitiesTab() {
    try {
      const amenities = await AmenityService.getAllAmenities();
      await renderAmenityListUIAmenitiesAndUtilitiesTab(amenities);
    } catch (error) {
      console.error("Error fetching/rendering amenities tab:", error);
      if (amenitiesTabAmenityListContainer)
        amenitiesTabAmenityListContainer.innerHTML =
          "<p class='text-danger text-center p-3'>Lỗi tải tiện nghi.</p>";
    }

    try {
      const utilities = await UtilityService.getAllUtilities();
      await renderUtilityListUIAmenitiesAndUtilitiesTab(utilities);
    } catch (error) {
      console.error("Error fetching/rendering utilities tab:", error);
      if (utilitiesTabUtilityListContainer)
        utilitiesTabUtilityListContainer.innerHTML =
          "<p class='text-danger text-center p-3'>Lỗi tải tiện ích.</p>";
    }
  }

  // --- Amenities & Utilities Tab: UI Rendering Functions ---

  // Function: Renders the list of amenity items for the Amenities & Utilities tab.
  async function renderAmenityListUIAmenitiesAndUtilitiesTab(amenities) {
    if (!amenitiesTabAmenityListContainer) return;
    amenitiesTabAmenityListContainer.innerHTML = "";

    if (!amenities || amenities.length === 0) {
      amenitiesTabAmenityListContainer.innerHTML =
        "<p class='text-muted text-center p-3'>Không có tiện nghi nào được liệt kê.</p>";
      return;
    }

    try {
      const itemPromises = amenities.map((amenity) =>
        createAmenityItem(amenity)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(item));
      amenitiesTabAmenityListContainer.appendChild(fragment);
    } catch (error) {
      console.error("Error rendering amenity list for amenities tab:", error);
      amenitiesTabAmenityListContainer.innerHTML =
        '<p class="error-message text-danger text-center p-3">Lỗi tải tiện nghi</p>';
    }
  }

  // Function: Renders the list of utility items for the Amenities & Utilities tab.
  async function renderUtilityListUIAmenitiesAndUtilitiesTab(utilities) {
    if (!utilitiesTabUtilityListContainer) return;
    utilitiesTabUtilityListContainer.innerHTML = "";

    if (!utilities || utilities.length === 0) {
      utilitiesTabUtilityListContainer.innerHTML =
        "<p class='text-muted text-center p-3'>Không có tiện ích nào được liệt kê.</p>";
      return;
    }

    try {
      const itemPromises = utilities.map((utility) =>
        createUtilityItem(utility)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(item));
      utilitiesTabUtilityListContainer.appendChild(fragment);
    } catch (error) {
      console.error("Error rendering utility list for utilities tab:", error);
      utilitiesTabUtilityListContainer.innerHTML =
        '<p class="error-message text-danger text-center p-3">Lỗi tải tiện ích</p>';
    }
  }

  // --- Event Listener Setup ---

  // Event Listeners: Main Navigation
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

  // Event Listeners: Rooms Tab Filters
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
    ); // Initial display
  }
  if (occupantNumberRangeInput && minOccupantNumberSpan) {
    occupantNumberRangeInput.addEventListener("input", () => {
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value; // Initial display
  }

  // Event Listener: Login Navigation
  if (loginTab) {
    loginTab.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = `/login`;
    });
  }

  // --- Initial Page Load Logic ---
  async function initializePage() {
    showContent("home"); // Show home tab by default

    // Fetch and render content for all tabs sequentially
    // (Could be parallelized if independent)
    await fetchAndRenderUiForHomeTab();
    await populateAddressFilter(); // Needs to run before initial room tab render if filter depends on it
    await fetchAndRenderUiForRoomsTab();
    await fetchAndRenderUiForAmenitiesAndUtilitiesTab();
  }

  initializePage(); // Execute initialization on DOM ready
});
