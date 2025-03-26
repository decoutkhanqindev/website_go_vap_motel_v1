import RoomService from "../js/services/RoomService.js";
import AmenityService from "../js/services/AmenityService.js";
import UtilityService from "../js/services/UtilityService.js";

// --- Global Scope Variables ---
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 9; // Number of rooms to display per page

// --- DOMContentLoaded Event Listener ---

document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selectors ---
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // --- Function: Show Content based on Menu Selection ---
  function showContent(targetId) {
    // Hide all content divs
    contentDivs.forEach((div) => (div.style.display = "none"));

    // Show the target div
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    }

    // Remove 'active-menu-item' class from all nav items
    navItems.forEach((item) => item.classList.remove("active-menu-item"));

    // Add 'active-menu-item' class to the selected nav item
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // --- Event Listener: Navigation Item Clicks ---
  navItems.forEach((navItem) => {
    navItem.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior
      const targetId = this.querySelector("a").dataset.target;
      showContent(targetId);
    });
  });

  // --- Function: Fetch and Render UI for the Home Tab ---
  async function fetchAndRenderUiForHomeTab() {
    try {
      // Fetch rooms (all, no filter)
      const rooms = await RoomService.getAllRooms({}); // Empty object for no filter
      // Filter rooms by address
      const roomsNVC = rooms.filter((room) =>
        room.address.includes("Nguyễn Văn Công")
      );
      const roomsDQH = rooms.filter((room) =>
        room.address.includes("Dương Quảng Hàm")
      );

      // Render UI elements for the home tab
      renderBranchUIHomeTab(roomsNVC, roomsDQH); // Branch information
      renderRoomListUIHomeTab(roomsNVC, roomsDQH); // Featured rooms
    } catch (error) {
      handleError(error, "Failed to fetch and display room data for home tab.");
      console.error("Failed to fetch and display room data:", error);
    }

    try {
      // Fetch and render amenities for the home tab
      const amenities = await AmenityService.getAllAmenities();
      renderAmenityListUIHomeTab(amenities);
    } catch (error) {
      handleError(
        error,
        "Failed to fetch and display amenity data for home tab"
      );
      console.error("Failed to fetch and display amenity data:", error);
    }
  }

  // --- Function: Fetch and Render UI for the Rooms Tab ---
  async function fetchAndRenderUiForRoomsTab() {
    try {
      // --- Get Filter Values ---
      const statusFilter = document.getElementById("statusFilter").value;
      const priceRange = document.getElementById("priceRange");
      const minPrice = priceRange.value; // Current value of the range input
      const maxPrice = priceRange.getAttribute("max"); // Maximum value (from HTML)
      const addressFilter = document.getElementById("addressFilter").value;
      const occupantNumberRange = document.getElementById(
        "occupantNumberRange"
      );
      const minOccupant = occupantNumberRange.value; // Current value
      const maxOccupant = occupantNumberRange.getAttribute("max"); // Max value

      // --- Build Filter Object ---
      const filter = {};
      if (statusFilter !== "all") filter.status = statusFilter;
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice;
      }
      if (addressFilter !== "all") filter.address = addressFilter;
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant;
      }

      // --- Fetch Rooms with Filter ---
      const rooms = await RoomService.getAllRooms(filter);
      renderRoomListUIRoomsTab(rooms); // Render the filtered rooms
    } catch (error) {
      handleError(
        error,
        "Failed to fetch and display room data for rooms tab."
      );
      console.error("Failed to fetch and display room data:", error);
    }
  }

  // --- Event Listener: Apply Filters Button (Rooms Tab) ---
  document
    .getElementById("applyFilters")
    .addEventListener("click", fetchAndRenderUiForRoomsTab);

  // --- Event Listeners: Price and Occupant Range Input Changes ---
  const priceRangeInput = document.getElementById("priceRange");
  const minPriceSpan = document.getElementById("minPrice");
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");

  priceRangeInput.addEventListener("input", () => {
    minPriceSpan.textContent = priceRangeInput.value; // Update displayed min price
  });

  occupantNumberRangeInput.addEventListener("input", () => {
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value; // Update displayed min occupants
  });

  // --- Function: Fetch and Render UI for Amenities and Utilities Tab ---

  async function fetchAndRenderUiForAmenitiesAndUtilitiesTab() {
    try {
      const amenities = await AmenityService.getAllAmenities();
      renderAmenityListUIAmenitiesAndUtilitiesTab(amenities);
    } catch (error) {
      handleError(error, "Failed to fetch and display amenities.");
    }

    try {
      const utilities = await UtilityService.getAllUtilities();
      renderUtilityListUIAmenitiesAndUtilitiesTab(utilities);
    } catch (error) {
      handleError(error, "Failed to fetch and display utilities.");
    }
  }

  // --- Initial Data Fetching and UI Rendering ---
  fetchAndRenderUiForHomeTab(); // Load data for the home tab
  fetchAndRenderUiForRoomsTab(); // Load data for the rooms tab (initially all rooms)
  fetchAndRenderUiForAmenitiesAndUtilitiesTab();

  addRoomClickListeners(); // Attach click listeners to room items
  addLoginTabClickListeners(); // Attach click listeners to login tab

  showContent("home"); // Show the home tab by default on page load
});

// --- UI Rendering Functions (Home Tab) ---

// Function: Render Branch Information (Home Tab)
function renderBranchUIHomeTab(roomsNVC, roomsDQH) {
  const branchContainer = document.querySelector(".branch .row");
  branchContainer.innerHTML = ""; // Clear previous content

  // Helper function to create a branch item element
  function createBranchItem(address, total, vacant) {
    const roomDiv = document.createElement("div");
    roomDiv.classList.add("col-md-6");

    const branchItem = document.createElement("div");
    branchItem.classList.add("branch-item");

    const addressEl = document.createElement("p");
    addressEl.classList.add("branch-address");
    addressEl.textContent = `📍${address}`;
    branchItem.appendChild(addressEl);

    const totalRoomsEl = document.createElement("p");
    totalRoomsEl.classList.add("branch-info-total");
    totalRoomsEl.textContent = `Tổng số phòng: ${total}`;
    branchItem.appendChild(totalRoomsEl);

    const vacantRoomsEl = document.createElement("p");
    vacantRoomsEl.classList.add("branch-info-vaccant");
    vacantRoomsEl.textContent = `Số phòng trống: ${vacant}`;
    branchItem.appendChild(vacantRoomsEl);

    roomDiv.appendChild(branchItem);
    return roomDiv;
  }

  const roomsDQHVacant = roomsDQH.filter((room) => room.status === "vacant");
  const totalRoomsDQH = roomsDQH.length;
  const vacantRoomsDQH = roomsDQHVacant.length;

  const roomsNVCVacant = roomsNVC.filter((room) => room.status === "vacant");
  const totalRoomsNVC = roomsNVC.length;
  const vacantRoomsNVC = roomsNVCVacant.length;

  // Create and append branch items if rooms exist
  if (roomsNVC.length > 0) {
    const nvcBranch = createBranchItem(
      "175 Nguyễn Văn Công, Phường 3, Quận Gò Vấp, TP.Hồ Chí Minh",
      totalRoomsNVC,
      vacantRoomsNVC
    );
    branchContainer.appendChild(nvcBranch);
  } else {
    const noRoomsNVC = document.createElement("div");
    noRoomsNVC.classList.add("col-md-6");
    noRoomsNVC.textContent = "Không có phòng tại Nguyễn Văn Công.";
    branchContainer.appendChild(noRoomsNVC);
  }

  if (roomsDQH.length > 0) {
    const dqhBranch = createBranchItem(
      "202 Dương Quảng Hàm, Phường 5, Quận Gò Vấp, TP.Hồ Chí Minh",
      totalRoomsDQH,
      vacantRoomsDQH
    );
    branchContainer.appendChild(dqhBranch);
  } else {
    const noRoomsDQH = document.createElement("div");
    noRoomsDQH.classList.add("col-md-6");
    noRoomsDQH.textContent = "Không có phòng tại Dương Quảng Hàm";
    branchContainer.appendChild(noRoomsDQH);
  }
}

// Function: Create a Room Item Element
async function createRoomItem(room) {
  const roomItem = document.createElement("div");
  roomItem.classList.add("room-item");
  roomItem.dataset.id = room._id; // Store the room's ID for later use

  // --- Image Handling ---
  let imageSrc = "../../assets/logo_error.png"; // Default image
  if (room.images && room.images.length > 0) {
    try {
      // Fetch the image data from the server
      const imageData = await RoomService.getRoomImageById(room.images[0]);
      // Convert the image data to a base64 string for display
      const base64Image = btoa(
        new Uint8Array(imageData.data.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
    } catch (error) {
      handleError(error, "Error fetching or processing room image.");
      console.error("Error fetching or processing image:", error);
      // Keep the default error image if there's a problem
    }
  }

  // --- Create the HTML content for the room item ---
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
        <span class="status-value ${
          room.status === "vacant"
            ? "status-vacant"
            : room.status === "occupied"
            ? "status-occupied"
            : "status-unavailable"
        }">${
    room.status === "vacant"
      ? "Trống"
      : room.status === "occupied"
      ? "Đã thuê"
      : "Không có sẵn"
  }</span>
      </p>
    </div>
  `;
  return roomItem;
}

// Function: Render Room List (Home Tab)
async function renderRoomListUIHomeTab(roomsNVC, roomsDQH) {
  const roomListContainer = document.querySelector(
    ".room-list .room-list-container"
  );
  if (!roomListContainer) {
    console.error("Could not find the room list container element.");
    return;
  }

  roomListContainer.innerHTML = ""; // Clear previous content

  // Display up to 4 rooms from Nguyễn Văn Công
  for (const room of roomsNVC.slice(0, 4)) {
    const item = await createRoomItem(room);
    roomListContainer.appendChild(item);
  }

  // Display up to 4 rooms from Dương Quảng Hàm
  for (const room of roomsDQH.slice(0, 4)) {
    const item = await createRoomItem(room);
    roomListContainer.appendChild(item);
  }

  addRoomClickListeners(); // Add click listeners to the newly created room items
}

// --- UI Rendering Functions (Amenities - Shared) ---

// Function: Create an Amenity Item Element
async function createAmenityItem(amenity) {
  const amenityItem = document.createElement("div");
  amenityItem.classList.add("amenity-item");

  let imageSrc = "../../assets/logo_error.png"; // Default image
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
      handleError(error, "Error fetching or processing amenity image.");
      console.error("Error fetching or processing amenity image:", error);
    }
  }

  const amenityName =
    amenity.name === "bed"
      ? "Giường"
      : amenity.name === "refrigerator"
      ? "Tủ lạnh"
      : amenity.name === "air_conditioner"
      ? "Máy lạnh"
      : amenity.name === "water_heater"
      ? "Vòi nước nóng"
      : amenity.name === "table_and_chairs"
      ? "Bàn ghế"
      : amenity.name === "electric_stove"
      ? "Bếp điện"
      : amenity.name === "gas_stove"
      ? "Bếp ga"
      : "Tiện nghi";

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
            <p class="amenity-note" style="font-style: italic; font-weight: bold">(Chỉ cộng vào tiền cọc khi thuê)</p>
        </div>
    `;
  return amenityItem;
}

// Function: Render Amenity List (Home Tab)
async function renderAmenityListUIHomeTab(amenities) {
  const amenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container"
  );
  if (!amenityListContainer) {
    console.error("Could not find the amenity list container element.");
    return;
  }

  amenityListContainer.innerHTML = ""; // Clear previous content

  for (const amenity of amenities) {
    const item = await createAmenityItem(amenity);
    amenityListContainer.appendChild(item);
  }
}

// --- UI Rendering Functions (Rooms Tab) ---

// Function: Render Pagination Controls
async function renderPaginationUI(rooms) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) {
    console.error("Could not find the pagination container element.");
    return;
  }
  paginationContainer.innerHTML = ""; // Clear previous pagination

  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageNumberItem = document.createElement("li");
    pageNumberItem.classList.add("page-item");
    const pageNumberLink = document.createElement("a");
    pageNumberLink.classList.add("page-link");
    pageNumberLink.href = "#";
    pageNumberLink.textContent = i;

    if (i === currentPage) {
      pageNumberItem.classList.add("active");
      pageNumberLink.style.backgroundColor = "#4da1a9";
      pageNumberLink.style.color = "white";
    }

    pageNumberLink.addEventListener("click", (event) => {
      event.preventDefault();
      currentPage = i;
      renderRoomListUIRoomsTab(rooms); // Re-render rooms for the new page
    });

    pageNumberItem.appendChild(pageNumberLink);
    paginationContainer.appendChild(pageNumberItem);
  }
}

// Function: Render Room List (Rooms Tab)
async function renderRoomListUIRoomsTab(rooms) {
  const roomListContainer = document.querySelector(
    ".rooms .room-list-container"
  );
  if (!roomListContainer) {
    console.error("Could not find the room list container element.");
    return;
  }
  roomListContainer.innerHTML = ""; // Clear previous rooms

  totalRooms = rooms.length; // Update the total number of rooms

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = Math.min(startIndex + roomsPerPage, totalRooms);

  // Create room items and add them to the container
  let currentRow = null;
  for (let i = startIndex; i < endIndex; i++) {
    // Create a new row for every 3 rooms
    if ((i - startIndex) % 3 === 0) {
      currentRow = document.createElement("div");
      currentRow.classList.add("row");
      roomListContainer.appendChild(currentRow);
    }
    const roomItem = await createRoomItem(rooms[i]);
    roomItem.classList.add("col-md-4", "col-sm-6", "col-12"); // Add Bootstrap grid classes
    currentRow.appendChild(roomItem); // Add to the current row
  }

  renderPaginationUI(rooms); // Render the pagination controls

  // Add click listeners *after* the rooms have been added to the DOM
  addRoomClickListeners();
}

// --- UI Rendering Functions (Amenities and Utilities Tab) ---

// Function: Render Amenity List (Amenities and Utilities Tab)
async function renderAmenityListUIAmenitiesAndUtilitiesTab(amenities) {
  const amenityListContainer = document.querySelector(
    ".amenities-utilities .amenities-container .amenity-list-container"
  );
  if (!amenityListContainer) {
    console.error("Could not find the amenity list container element.");
    return;
  }

  amenityListContainer.innerHTML = ""; // Clear any existing content

  for (const amenity of amenities) {
    const item = await createAmenityItem(amenity); // Use the shared function
    amenityListContainer.appendChild(item);
  }
}

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
      handleError(error, "Error fetching or processing utility image.");
      console.error("Error fetching or processing utility image:", error);
    }
  }

  const utilityName =
    utility.name === "wifi"
      ? "Wifi"
      : utility.name === "parking"
      ? "Đỗ xe"
      : utility.name === "cleaning"
      ? "Vệ sinh hàng tuần"
      : "Tiện ích";

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
                } / ${utilityName !== "Đỗ xe" ? "Phòng" : "Xe"}</span>
            </p>
            <p class="utility-note" style="font-style: italic;">(Trả phí hàng tháng)</p>
        </div>
    `;
  return utilityItem;
}

async function renderUtilityListUIAmenitiesAndUtilitiesTab(utilities) {
  const utilityListContainer = document.querySelector(
    ".amenities-utilities .utilities-container .utility-list-container"
  );
  if (!utilityListContainer) {
    console.error("Could not find the utility list container element.");
    return;
  }
  utilityListContainer.innerHTML = "";

  for (const utility of utilities) {
    const item = await createUtilityItem(utility);
    utilityListContainer.appendChild(item);
  }
}

// --- Helper Functions ---

// Function: Add Click Event Listeners to Room Items
function addRoomClickListeners() {
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach((roomItem) => {
    roomItem.addEventListener("click", () => {
      const roomId = roomItem.dataset.id;
      // Redirect to the room details page
      window.location.href = `/room/details/${roomId}`;
    });
  });
}

// Function: Add Click Event Listeners to Login Tab
function addLoginTabClickListeners() {
  const loginTab = document.querySelector(".login-tab");
  loginTab.addEventListener("click", () => {
    window.location.href = `/login`;
  });
}

// Function: Handle Errors and Display Alerts
function handleError(error, customMessage = "Đã xảy ra lỗi") {
  console.error(customMessage, error);

  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  // Customize error message based on the type of error
  if (error.response) {
    // Server responded with an error status code
    errorMessage.innerText = `${customMessage}: ${
      error.response.data.message || "Lỗi không xác định"
    }`;
  } else if (error.request) {
    // Request was made but no response was received
    errorMessage.innerText = `${customMessage}: Không thể kết nối đến máy chủ.`;
  } else {
    // Something else happened in setting up the request
    errorMessage.innerText = `${customMessage}: ${error.message}`;
  }

  errorAlert.style.display = "block"; // Show the error alert

  // Automatically hide the alert after 5 seconds
  setTimeout(() => {
    errorAlert.style.display = "none";
  }, 5000);
}
