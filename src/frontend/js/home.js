import RoomService from "../js/services/RoomService.js";
import AmenityService from "../js/services/AmenityService.js";
import UtilityService from "../js/services/UtilityService.js";

// local variable
let currentPage = 1;
let totalRooms = 0;
const roomsPerPage = 9;

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  const contentDivs = document.querySelectorAll(".content .container > div");

  // handle show content with active menu
  function showContent(targetId) {
    contentDivs.forEach((div) => {
      div.style.display = "none";
    });

    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    }

    navItems.forEach((item) => {
      item.classList.remove("active-menu-item");
    });

    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // handle click on each menu item
  navItems.forEach((navItem) => {
    navItem.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.querySelector("a").dataset.target;
      showContent(targetId);
    });
  });

  async function fetchAndRenderUiForHomeTab() {
    try {
      // call api to fetch rooms and render ui for home tab
      const rooms = await RoomService.getAllRooms();
      const roomsNVC = rooms.filter((room) =>
        room.address.includes("Nguyễn Văn Công")
      );
      const roomsDQH = rooms.filter((room) =>
        room.address.includes("Dương Quảng Hàm")
      );
      renderBranchUIHomeTab(roomsNVC, roomsDQH);
      renderRoomListUIHomeTab(roomsNVC, roomsDQH);
    } catch (error) {
      handleError(error, error.message);
      console.error("Failed to fetch and display room data:", error);
    }

    // call api to fetch amenities and render ui for home tab
    try {
      const amenities = await AmenityService.getAllAmenities();
      renderAmenityListUIHomeTab(amenities);
    } catch (error) {
      handleError(error, error.message);
      console.error("Failed to fetch and display amenity data:", error);
    }
  }

  // call api to fetch rooms (with filter) and render ui for rooms tab
  async function fetchAndRenderUiForRoomsTab() {
    try {
      const statusFilter = document.getElementById("statusFilter").value;
      const priceRange = document.getElementById("priceRange");
      const minPrice = priceRange.value;
      const maxPrice = priceRange.getAttribute("max");
      const addressFilter = document.getElementById("addressFilter").value;
      const occupantNumberRange = document.getElementById(
        "occupantNumberRange"
      );
      const minOccupant = occupantNumberRange.value;
      const maxOccupant = occupantNumberRange.getAttribute("max");

      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (Number(minPrice) > 0) {
        queryParams.append("minRentPrice", minPrice);
        queryParams.append("maxRentPrice", maxPrice);
      }
      if (addressFilter !== "all") queryParams.append("address", addressFilter);
      if (Number(minOccupant) > 0) {
        queryParams.append("minOccupantsNumber", minOccupant);
        queryParams.append("maxOccupantsNumber", maxOccupant);
      }

      const rooms = await RoomService.getAllRooms(queryParams);
      renderRoomListUIRoomsTab(rooms);
    } catch (error) {
      handleError(error, error.message);
      console.error("Failed to fetch and display room data:", error);
    }
  }

  // hanle apply filters for rooms tab
  document
    .getElementById("applyFilters")
    .addEventListener("click", fetchAndRenderUiForRoomsTab);

  const priceRangeInput = document.getElementById("priceRange");
  const minPriceSpan = document.getElementById("minPrice");
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");

  priceRangeInput.addEventListener("input", () => {
    minPriceSpan.textContent = priceRangeInput.value;
  });
  occupantNumberRangeInput.addEventListener("input", () => {
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  });

  async function fetchAndRenderUiForAmenitiesAndUtilitiesTab() {
    // call api to fetch amenities and render ui for amenities tab
    try {
      const amenities = await AmenityService.getAllAmenities();
      renderAmenityListUIAmenitiesAndUtilitiesTab(amenities);
    } catch (error) {
      handleError(error, error.message);
      console.error("Failed to fetch and display amenity data:", error);
    }

    // call api to fetch utilities and render ui for utilities tab
    try {
      const utilities = await UtilityService.getAllUtilities();
      renderUtilityListUIAmenitiesAndUtilitiesTab(utilities);
    } catch (error) {
      handleError(error, error.message);
      console.error("Failed to fetch and display utility data:", error);
    }
  }

  fetchAndRenderUiForHomeTab();
  fetchAndRenderUiForRoomsTab();
  fetchAndRenderUiForAmenitiesAndUtilitiesTab();

  // begin content is home tab
  showContent("home");
});

// home tab functions
function renderBranchUIHomeTab(roomsNVC, roomsDQH) {
  const branchContainer = document.querySelector(".branch .row");
  branchContainer.innerHTML = "";

  const roomsDQHVacant = roomsDQH.filter((room) => room.status === "vacant");
  const totalRoomsDQH = roomsDQH.length;
  const vacantRoomsDQH = roomsDQHVacant.length;

  const roomsNVCVacant = roomsNVC.filter((room) => room.status === "vacant");
  const totalRoomsNVC = roomsNVC.length;
  const vacantRoomsNVC = roomsNVCVacant.length;

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

async function createRoomItem(room) {
  const roomItem = document.createElement("div");
  roomItem.classList.add("room-item");

  let imageSrc = "../../assets/logo_no_text.png";
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
      console.error("Error fetching or processing image:", error);
    }
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

async function renderRoomListUIHomeTab(roomsNVC, roomsDQH) {
  const roomListContainer = document.querySelector(
    ".room-list .room-list-container"
  );
  if (!roomListContainer) {
    console.error("Could not find the room list container element.");
    return;
  }

  roomListContainer.innerHTML = "";

  for (const room of roomsNVC.slice(0, 4)) {
    const item = await createRoomItem(room);
    roomListContainer.appendChild(item);
  }

  for (const room of roomsDQH.slice(0, 4)) {
    const item = await createRoomItem(room);
    roomListContainer.appendChild(item);
  }
}

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
      <p class="amenity-note" style="font-style: italic; font-weight: bold">
        (Chỉ cộng vào tiền cọc khi thuê)
      </p>
    </div>
  `;
  return amenityItem;
}

async function renderAmenityListUIHomeTab(amenities) {
  const amenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container"
  );
  if (!amenityListContainer) {
    console.error("Could not find the amenity list container element.");
    return;
  }

  amenityListContainer.innerHTML = "";

  for (const amenity of amenities) {
    const item = await createAmenityItem(amenity);
    amenityListContainer.appendChild(item);
  }
}

// rooms tab functions
async function renderPaginationUI(rooms) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) {
    console.error("Could not find the pagination container element.");
    return;
  }
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  // // Nút Previous
  // const prevButton = document.createElement("li");
  // prevButton.classList.add("page-item");
  // prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><img src="../../assets/pre_btn.png" alt="Previous"></a>`; // Thay đổi đường dẫn ảnh
  // if (currentPage === 1) {
  //   prevButton.classList.add("disabled");
  // } else {
  //   prevButton.addEventListener("click", () => {
  //     currentPage--;
  //     renderRoomListUIRoomsTab(rooms);
  //   });
  // }
  // paginationContainer.appendChild(prevButton);

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
      renderRoomListUIRoomsTab(rooms);
    });

    pageNumberItem.appendChild(pageNumberLink);
    paginationContainer.appendChild(pageNumberItem);
  }

  // // Nút Next
  // const nextButton = document.createElement("li");
  // nextButton.classList.add("page-item");
  // nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next"><img src="../../assets/next_btn.png" alt="Next"></a>`; // Thay đổi đường dẫn ảnh
  // if (currentPage === totalPages) {
  //   nextButton.classList.add("disabled");
  // } else {
  //   nextButton.addEventListener("click", () => {
  //     currentPage++;
  //     renderRoomListUIRoomsTab(rooms);
  //   });
  // }
  // paginationContainer.appendChild(nextButton);
}

async function renderRoomListUIRoomsTab(rooms) {
  const roomListContainer = document.querySelector(
    ".rooms .room-list-container"
  );
  if (!roomListContainer) {
    console.error("Could not find the room list container element.");
    return;
  }
  roomListContainer.innerHTML = "";

  totalRooms = rooms.length;
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = Math.min(startIndex + roomsPerPage, totalRooms);

  let currentRow = null;
  for (let i = startIndex; i < endIndex; i++) {
    if ((i - startIndex) % 3 === 0) {
      currentRow = document.createElement("div");
      currentRow.classList.add("row");
      roomListContainer.appendChild(currentRow);
    }
    const roomItem = await createRoomItem(rooms[i]);
    roomItem.classList.add("col-md-4", "col-sm-6", "col-12");
    currentRow.appendChild(roomItem);
  }
  renderPaginationUI(rooms);
}

// amenities and utilities tab functions
async function renderAmenityListUIAmenitiesAndUtilitiesTab(amenities) {
  const amenityListContainer = document.querySelector(
    ".amenities-utilities .amenities-container .amenity-list-container"
  );
  if (!amenityListContainer) {
    console.error("Could not find the amenity list container element.");
    return;
  }

  amenityListContainer.innerHTML = "";

  for (const amenity of amenities) {
    const item = await createAmenityItem(amenity);
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
      console.error("Error fetching or processing amenity image:", error);
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
  const utiltyListContainer = document.querySelector(
    ".amenities-utilities .utilities-container .utility-list-container"
  );
  if (!utiltyListContainer) {
    console.error("Could not find the amenity list container element.");
    return;
  }

  utiltyListContainer.innerHTML = "";

  for (const utility of utilities) {
    const item = await createUtilityItem(utility);
    utiltyListContainer.appendChild(item);
  }
}

// handle error alert
function handleError(error, customMessage = "Đã xảy ra lỗi") {
  console.error(customMessage, error);

  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  if (error.response) {
    errorMessage.innerText = `${customMessage}: ${
      error.response.data.message || "Lỗi không xác định"
    }`;
  } else if (error.request) {
    errorMessage.innerText = `${customMessage}: Không thể kết nối đến máy chủ.`;
  } else {
    errorMessage.innerText = `${customMessage}: ${error.message}`;
  }

  errorAlert.style.display = "block";

  setTimeout(() => {
    errorAlert.style.display = "none";
  }, 5000);
}
