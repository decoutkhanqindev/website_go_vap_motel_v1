import RoomService from "../js/services/RoomService.js";
import AmenityService from "../js/services/AmenityService.js";
import UtilityService from "../js/services/UtilityService.js";

// --- Global Scope Variables ---
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 9;
let currentRoomData = [];

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selectors ---
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // Home Tab Elements
  const branchContainer = document.querySelector(".branch .row");
  const homeRoomListContainer = document.querySelector(
    ".room-list .room-list-container"
  );
  const homeAmenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container"
  );

  // Rooms Tab Elements
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
    ".rooms .room-list-container"
  ); // Specific container for rooms tab
  const paginationContainer = document.querySelector(".pagination");

  // Amenities & Utilities Tab Elements
  const amenitiesTabAmenityListContainer = document.querySelector(
    ".amenities-utilities .amenities-container .amenity-list-container"
  );
  const utilitiesTabUtilityListContainer = document.querySelector(
    ".amenities-utilities .utilities-container .utility-list-container"
  );

  // Other Elements
  const loginTab = document.querySelector(".login-tab");

  // --- Core Functions ---

  // Function: Show Content based on Menu Selection
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

  // Function: Generate random integer number
  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min > max) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Function: Generate shuffle array
  function shuffleArray(array) {
    const shuffledArray = [...array]; // Tạo một bản sao
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i]
      ];
    }
    return shuffledArray;
  }

  // Function: Add Click Event Listeners to Room Items
  function addRoomClickListeners() {
    // Select ALL room items currently in the DOM across different containers
    const roomItems = document.querySelectorAll(".room-item");
    roomItems.forEach((roomItem) => {
      // Check if listener already exists to prevent duplicates if called multiple times
      if (!roomItem.hasAttribute("data-listener-added")) {
        roomItem.addEventListener("click", () => {
          const roomId = roomItem.dataset.id;
          window.location.href = `/room/details/${roomId}`;
        });
        roomItem.setAttribute("data-listener-added", "true"); // Mark as listener added
      }
    });
  }

  // --- UI Creation Functions (Shared by multiple tabs) ---

  // Function: Create a Room Item Element (Card View)
  async function createRoomItem(room) {
    const roomItem = document.createElement("div");
    roomItem.classList.add("room-item"); // Base class
    roomItem.dataset.id = room._id;

    let imageSrc = "../../assets/logo_error.png";
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
        console.error(error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    // Status mapping
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
      room.name || "Room Image"
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

  // Function: Create an Amenity Item Element
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
        console.error(error);
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
    const amenityName = amenityNameMap[amenity.name] || "Tiện nghi";

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
                    } / Phòng</span>
                </p>
                <p class="amenity-note" style="font-style: italic; font-weight: bold">(Cộng vào tiền cọc)</p>
            </div>
        `;
    return amenityItem;
  }

  // Function: Create a Utility Item Element
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
        console.error(error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    const utilityNameMap = {
      wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };
    const utilityName = utilityNameMap[utility.name] || "Tiện ích";
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

  // --- Home Tab: Fetch and Render ---
  async function fetchAndRenderUiForHomeTab() {
    // Fetch Rooms for Home Tab
    try {
      const rooms = await RoomService.getAllRooms({}); // Fetch all
      renderBranchUIHomeTab(rooms);
      await renderRoomListUIHomeTab(rooms, 10); // Wait for rooms to render before adding listeners
    } catch (error) {
      console.error(error);
    }

    // Fetch Amenities for Home Tab
    try {
      const amenities = await AmenityService.getAllAmenities();
      await renderAmenityListUIHomeTab(amenities);
    } catch (error) {
      console.error(error);
    }
  }

  // --- Home Tab: UI Rendering Functions ---
  function renderBranchUIHomeTab(rooms) {
    if (!branchContainer) return;
    branchContainer.innerHTML = "";

    function createBranchItem(address, total, vacant) {
      const roomDiv = document.createElement("div");
      roomDiv.classList.add("col-md-6"); // Bootstrap column
      roomDiv.innerHTML = `
        <div class="branch-item">
          <p class="branch-address">📍${address}</p>
          <p class="branch-info-total">Tổng số phòng: ${total}</p>
          <p class="branch-info-vaccant">Số phòng trống: ${vacant}</p>
        </div>
      `;
      return roomDiv;
    }

    const allAddresses = rooms.map((room) => room.address).filter(Boolean);
    const uniqueAddresses = [...new Set(allAddresses)];

    uniqueAddresses.forEach((address) => {
      const roomFilterd = rooms.filter((room) =>
        room.address.includes(address)
      );
      const vacantNVC = roomFilterd.filter((r) => r.status === "vacant").length;
      branchContainer.appendChild(
        createBranchItem(address, roomFilterd.length, vacantNVC)
      );
    });
  }

  async function renderRoomListUIHomeTab(rooms, numberOfRandomRooms = 0) {
    if (!homeRoomListContainer) return;
    homeRoomListContainer.innerHTML = ""; // Clear previous

    const shuffledRooms = shuffleArray(rooms);
    const actualNumberOfRandom = Math.min(
      numberOfRandomRooms,
      shuffledRooms.length
    );
    const randomRoomsToShow = shuffledRooms.slice(0, actualNumberOfRandom);
    const itemsPromises = randomRoomsToShow.map((room) => createRoomItem(room));

    try {
      const createdItems = await Promise.all(itemsPromises);

      const fragment = document.createDocumentFragment();
      createdItems.forEach((item) => {
        fragment.appendChild(item);
      });
      homeRoomListContainer.appendChild(fragment);

      addRoomClickListeners();
    } catch (error) {
      console.error(error);
      homeRoomListContainer.innerHTML =
        "<p>Đã xảy ra lỗi khi tải danh sách phòng.</p>";
    }
  }

  async function renderAmenityListUIHomeTab(amenities) {
    if (!homeAmenityListContainer) return;
    homeAmenityListContainer.innerHTML = "";

    try {
      const itemPromises = amenities.map((amenity) =>
        createAmenityItem(amenity)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      homeAmenityListContainer.appendChild(fragment);
    } catch (error) {
      console.error(error);
      homeAmenityListContainer.innerHTML = `
      <p class="error-message" style="color: red; text-align: center;">
        Lỗi tải tiện nghi
      </p>
    `;
    }
  }

  // --- Rooms Tab: Fetch and Render ---

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
      console.error(error);
    }
  }

  async function fetchAndRenderUiForRoomsTab() {
    if (roomsTabRoomListContainer)
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100">Đang tải dữ liệu phòng...</div>';
    if (paginationContainer) paginationContainer.innerHTML = ""; // Clear pagination

    try {
      // --- Get Filter Values ---
      const status = statusFilter.value;
      const minPrice = priceRangeInput.value;
      const maxPrice = priceRangeInput.getAttribute("max");
      const address = addressFilter.value;
      const minOccupant = occupantNumberRangeInput.value;
      const maxOccupant = occupantNumberRangeInput.getAttribute("max");

      // --- Build Filter Object ---
      const filter = {};
      if (status !== "all") filter.status = status;
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice; // Include max for range
      }
      if (address !== "all") filter.address = address;
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant; // Include max for range
      }

      // --- Fetch Rooms ---
      const rooms = await RoomService.getAllRooms(filter);
      currentRoomData = rooms; // Store globally for pagination
      totalRooms = rooms.length;

      // Render the first page
      renderRoomListUIRoomsTab(); // Uses global currentRoomData
    } catch (error) {
      console.error(error);
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 text-danger">Lỗi khi tải dữ liệu.</div>';
    }
  }

  // --- Rooms Tab: UI Rendering Functions ---
  async function renderRoomListUIRoomsTab() {
    if (!roomsTabRoomListContainer) return;
    roomsTabRoomListContainer.innerHTML = "";

    if (!Array.isArray(currentRoomData)) {
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 error-message">Lỗi: Dữ liệu phòng không hợp lệ.</div>';
      renderPaginationUI();
      return;
    }

    if (currentRoomData.length === 0) {
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100">Không tìm thấy phòng nào phù hợp.</div>';
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
        roomsTabRoomListContainer.innerHTML = `<div class="text-center w-100">Không có phòng nào trên trang ${currentPage}.</div>`;
        renderPaginationUI();
        return;
      }

      const itemPromises = roomsToDisplay.map((room) => createRoomItem(room));
      const items = await Promise.all(itemPromises);

      let currentRow = null;
      const fragment = document.createDocumentFragment(); // Use fragment for performance

      items.forEach((roomItem, index) => {
        roomsToDisplay[index];

        // Create a new row every 3 items
        if (index % 3 === 0) {
          currentRow = document.createElement("div");
          currentRow.classList.add("row", "mb-3");
          fragment.appendChild(currentRow); // Add row to fragment
        }

        // Create column wrapper
        const colDiv = document.createElement("div");
        colDiv.classList.add(
          "col-md-4",
          "col-sm-6",
          "col-12",
          "d-flex",
          "justify-content-center"
        );
        colDiv.appendChild(roomItem);

        if (currentRow) {
          currentRow.appendChild(colDiv);
        } else {
          fragment.appendChild(colDiv);
        }
      });

      roomsTabRoomListContainer.appendChild(fragment);

      renderPaginationUI();
      addRoomClickListeners();
    } catch (error) {
      console.error(error);
      roomsTabRoomListContainer.innerHTML = `
        <div class="text-center w-100 error-message" style="color: red;">
            Đã xảy ra lỗi khi hiển thị danh sách phòng. 
        </div>
    `;
      renderPaginationUI();
    }
  }

  function renderPaginationUI() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    if (totalPages <= 1) return; // No pagination needed

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
          renderRoomListUIRoomsTab(); // Re-render rooms for the new page
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Amenities & Utilities Tab: Fetch and Render ---
  async function fetchAndRenderUiForAmenitiesAndUtilitiesTab() {
    // Fetch Amenities
    try {
      const amenities = await AmenityService.getAllAmenities();
      await renderAmenityListUIAmenitiesAndUtilitiesTab(amenities);
    } catch (error) {
      console.error(error);
    }

    // Fetch Utilities
    try {
      const utilities = await UtilityService.getAllUtilities();
      await renderUtilityListUIAmenitiesAndUtilitiesTab(utilities);
    } catch (error) {
      console.error(error);
    }
  }

  // --- Amenities & Utilities Tab: UI Rendering Functions ---
  async function renderAmenityListUIAmenitiesAndUtilitiesTab(amenities) {
    if (!amenitiesTabAmenityListContainer) return;
    amenitiesTabAmenityListContainer.innerHTML = ""; // Clear

    try {
      const itemPromises = amenities.map((amenity) =>
        createAmenityItem(amenity)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      amenitiesTabAmenityListContainer.appendChild(fragment);
    } catch (error) {
      console.error(error);
      amenitiesTabAmenityListContainer.innerHTML = `
      <p class="error-message" style="color: red; text-align: center;">
        Lỗi tải tiện nghi
      </p>
    `;
    }
  }

  async function renderUtilityListUIAmenitiesAndUtilitiesTab(utilities) {
    if (!utilitiesTabUtilityListContainer) return;
    utilitiesTabUtilityListContainer.innerHTML = ""; // Clear

    try {
      const itemPromises = utilities.map((utility) =>
        createUtilityItem(utility)
      );
      const items = await Promise.all(itemPromises);
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      utilitiesTabUtilityListContainer.appendChild(fragment);
    } catch (error) {
      console.error(error);
      utilitiesTabUtilityListContainer.innerHTML = `
      <p class="error-message" style="color: red; text-align: center;">
        Lỗi tải tiện ích
      </p>
    `;
    }
  }

  // --- Event Listeners Setup ---

  // Navigation Item Clicks
  navItems.forEach((navItem) => {
    navItem.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.querySelector("a").dataset.target;
      showContent(targetId);
    });
  });

  // Rooms Tab: Apply Filters Button
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      currentPage = 1; // Reset to first page on filter change
      fetchAndRenderUiForRoomsTab();
    });
  }

  // Rooms Tab: Price Range Input
  if (priceRangeInput && minPriceSpan) {
    priceRangeInput.addEventListener("input", () => {
      minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
        "vi-VN"
      );
    });
    // Initialize display
    minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
      "vi-VN"
    );
  }

  // Rooms Tab: Occupant Range Input
  if (occupantNumberRangeInput && minOccupantNumberSpan) {
    occupantNumberRangeInput.addEventListener("input", () => {
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    // Initialize display
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  }

  // Login Tab Click
  if (loginTab) {
    loginTab.addEventListener("click", () => {
      window.location.href = `/login`;
    });
  }
  
  // --- Initial Load ---
  fetchAndRenderUiForHomeTab();
  populateAddressFilter();
  fetchAndRenderUiForRoomsTab();
  fetchAndRenderUiForAmenitiesAndUtilitiesTab();

  showContent("home"); // Show the home tab by default
});
