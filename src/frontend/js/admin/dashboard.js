import RoomService from "../services/RoomService.js";

// --- Global Scope Variables ---
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 10;
let currentRoomData = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selectors ---
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // Rooms Tab Elements
  const roomTableBody = document.getElementById("roomTableBody");
  const paginationContainer = document.querySelector(".pagination");
  const statusFilterSelect = document.getElementById("statusFilter");
  const priceRangeInput = document.getElementById("priceRange");
  const minPriceSpan = document.getElementById("minPrice");
  const maxPriceSpan = document.getElementById("maxPrice"); // Only needed if dynamically changing max display
  const addressFilterSelect = document.getElementById("addressFilter");
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");
  const maxOccupantNumberSpan = document.getElementById("maxOccupantNumber"); // Only needed if dynamically changing max display
  const applyFiltersButton = document.getElementById("applyFilters");
  const addNewRoomButton = document.getElementById("addNewRoomBtn"); // Added selector

  // Error Alert Elements
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  // --- Core Functions ---

  // Function: Show Content based on Menu Selection
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

  // Function: Handle Errors and Display Alerts
  function handleError(error, customMessage = "Đã xảy ra lỗi") {
    console.error(customMessage, error);

    if (errorAlert && errorMessage) {
      let msg = customMessage;
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        msg += `: ${error.response.data.message}`;
      } else if (error.request) {
        msg += ": Không thể kết nối đến máy chủ.";
      } else {
        msg += `: ${error.message}`;
      }
      errorMessage.innerText = msg;
      errorAlert.style.display = "block";
      setTimeout(() => {
        if (errorAlert) errorAlert.style.display = "none"; // Add check in case element removed
      }, 5000);
    } else {
      // Fallback if alert elements don't exist
      alert(
        `${customMessage}\n${
          error.message || "Kiểm tra console để biết chi tiết."
        }`
      );
    }
  }

  // --- Rooms Tab: Fetch and Render ---
  async function fetchAndRenderUiForRoomsTab() {
    // Display loading state
    if (roomTableBody) {
      roomTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>`;
    }
    if (paginationContainer) {
      paginationContainer.innerHTML = ""; // Clear pagination while loading
    }

    try {
      // --- Get Filter Values ---
      // Use the selector variables defined at the top
      const status = statusFilterSelect ? statusFilterSelect.value : "all";
      const minPrice = priceRangeInput ? priceRangeInput.value : "0";
      const maxPrice = priceRangeInput
        ? priceRangeInput.getAttribute("max")
        : "5000000"; // Get max from attribute
      const address = addressFilterSelect ? addressFilterSelect.value : "all";
      const minOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.value
        : "0";
      const maxOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.getAttribute("max")
        : "5"; // Get max from attribute

      // --- Build Filter Object ---
      const filter = {};
      if (status !== "all") filter.status = status;
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice; // Include max price in filter
      }
      if (address !== "all") filter.address = address;
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant; // Include max occupants in filter
      }

      // --- Fetch Rooms with Filter ---
      const rooms = await RoomService.getAllRooms(filter);
      currentRoomData = rooms; // Store the fetched data globally
      totalRooms = rooms.length; // Update total room count

      // Render the first page of the table
      renderRoomTableUIRoomsTab(); // Uses global currentRoomData
    } catch (error) {
      handleError(error, "Lỗi khi tải và hiển thị dữ liệu phòng.");
      if (roomTableBody) {
        roomTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu. Vui lòng thử lại.</td></tr>`;
      }
      console.error("Failed to fetch and display room data:", error);
    }
  }

  // --- Rooms Tab: UI Rendering Functions ---

  // Function: Render Room Table (Rooms Tab)
  function renderRoomTableUIRoomsTab() {
    if (!roomTableBody) {
      console.error("Table body element (#roomTableBody) not found!");
      return;
    }
    roomTableBody.innerHTML = ""; // Clear previous table rows

    if (currentRoomData.length === 0) {
      roomTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Không tìm thấy phòng nào phù hợp.</td></tr>`;
      renderPaginationUI(); // Still render (empty) pagination controls
      return;
    }

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = Math.min(startIndex + roomsPerPage, totalRooms);
    const roomsToDisplay = currentRoomData.slice(startIndex, endIndex);

    // Create table rows for the current page
    roomsToDisplay.forEach((room, index) => {
      const row = document.createElement("tr");
      row.dataset.id = room._id; // Add data-id for potential click events

      // --- Status ---
      let statusText = "Không xác định";
      let statusClass = "status-unavailable"; // Default
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
          room.rentPrice
            ? room.rentPrice.toLocaleString("vi-VN") // Format price
            : "N/A"
        }</td>
        <td class="text-center">${room.occupantsNumber || "N/A"}</td>
        <td class="text-center">
            <span class="${statusClass}">${statusText}</span>
        </td>
      `;

      // Add click listener to row for navigation/details
      row.addEventListener("click", () => {
        window.location.href = `/room/details/${room._id}`;
      });

      roomTableBody.appendChild(row);
    });

    // Render pagination controls after table rows are added
    renderPaginationUI();
  }

  // Function: Render Pagination Controls
  function renderPaginationUI() {
    if (!paginationContainer) {
      console.error("Pagination container element (.pagination) not found!");
      return;
    }
    paginationContainer.innerHTML = ""; // Clear previous pagination

    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    if (totalPages <= 1) {
      return; // No pagination needed for 0 or 1 page
    }

    // Create page number links
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      if (i === currentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#"; // Prevent page reload
      pageNumberLink.textContent = i;

      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (i !== currentPage) {
          currentPage = i;
          renderRoomTableUIRoomsTab(); // Re-render table for the new page
        }
      });

      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- Event Listeners Setup ---

  // Navigation Item Clicks
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a");
    if (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        const targetId = link.dataset.target;
        if (targetId) {
          showContent(targetId);
        }
      });
    }
  });

  // Rooms Tab: Apply Filters Button
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      currentPage = 1; // Reset to first page when applying new filters
      fetchAndRenderUiForRoomsTab();
    });
  }

  // Rooms Tab: Price Range Input
  if (priceRangeInput && minPriceSpan) {
    priceRangeInput.addEventListener("input", () => {
      // Update displayed min price with formatting
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
      // Update displayed min occupants
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    // Initialize display
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  }

  // Rooms Tab: Add New Room Button (Example Listener)
  if (addNewRoomButton) {
    addNewRoomButton.addEventListener("click", () => {
      console.log("Add New Room button clicked");
      // Example: window.location.href = '/admin/rooms/new';
      alert('Chức năng "Thêm phòng mới" chưa được triển khai.');
    });
  }

  // --- Initial Load ---
  fetchAndRenderUiForRoomsTab();

  showContent("rooms-tab-container"); // Show the rooms tab by default
});
