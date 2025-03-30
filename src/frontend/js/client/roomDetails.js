import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope Variables ---
let currentImageIndex = 0;
let imageElements = []; // Array to store fetched <img> elements for navigation
let selectedAmenitiesTotalPrice = 0;
let selectedUtilitiesTotalPrice = 0; // Still track this, might be useful elsewhere later
let selectedAmenities = []; // Array to store IDs of selected amenities
let selectedUtilities = []; // Array to store IDs of selected utilities

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selectors ---
  const roomInfoContainer = document.querySelector(".room-info-container");
  const amenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container"
  );
  const utilityListContainer = document.querySelector(
    ".utility-list .utility-list-container"
  );
  const imageList = document.querySelector(".image-list");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  // Note: Price elements are selected dynamically after rendering

  // --- Core Functions ---

  // Function: Extract Room ID from URL
  function getRoomIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    const potentialId = pathSegments[pathSegments.length - 1];
    // Basic check for non-empty string
    return potentialId || null;
  }

  // --- UI Rendering Functions ---

  // Function: Render Room Information
  function renderRoomInfoUI(room) {
    if (!roomInfoContainer) return;
    roomInfoContainer.innerHTML = ""; // Clear previous content

    let statusText = "Không có sẵn";
    let statusClass = "status-unavailable";
    if (room.status === "vacant") {
      statusText = "Trống";
      statusClass = "status-vacant";
    } else if (room.status === "occupied") {
      statusText = "Đã thuê";
      statusClass = "status-occupied";
    }

    const initialRentPrice = room.rentPrice || 0;

    // Use more descriptive labels
    roomInfoContainer.innerHTML = `
        <h3 class="room-name d-flex justify-content-center align-items-center">Phòng ${
          room.roomNumber || "N/A"
        }</h3>
        <p class="room-address">
            <span class="address-label">Địa chỉ:</span>
            <span class="address-value">${room.address || "N/A"}</span>
        </p>
        <p class="room-price">
            <span class="price-label">Giá thuê cơ bản:</span>
            <span class="price-value" data-initial-price="${initialRentPrice}">${initialRentPrice.toLocaleString(
      "vi-VN",
      { style: "currency", currency: "VND" }
    )}</span>
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
              room.description || "Không có mô tả."
            }</span>
        </p>
    `;
    // Update display once elements are created
    updateRoomDepositPriceDisplay();
  }

  // Function: Render Room Images
  async function renderRoomImagesUI(room) {
    if (!imageList) return;
    imageList.innerHTML = "";
    imageElements = [];

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
          img.alt = `Room Image ${index + 1}`;
          img.dataset.index = index;
          return img;
        } catch (error) {
          console.error(error);
          const img = document.createElement("img");
          img.src = "/assets/logo_error.png";
          img.alt = `Error loading image ${index + 1}`;
          img.dataset.index = index;
          return img;
        }
      });

      const fetchedImages = await Promise.all(imagePromises);
      fetchedImages.forEach((img) => {
        if (img) {
          imageList.appendChild(img);
          imageElements.push(img);
        }
      });

      if (imageElements.length > 0) {
        imageElements[0].classList.add("active");
        updateImagePosition();
      }
    } else {
      const img = document.createElement("img");
      img.src = "../../assets/logo_error.png";
      img.alt = "Default Image";
      imageList.appendChild(img);
      imageElements.push(img);
    }
  }

  // Function: Create an Amenity Item Element
  async function createAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item");
    amenityItem.dataset.amenityId = amenity._id;

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
      }
    }

    const amenityNameMap = {
      /* ... mappings ... */ bed: "Giường",
      refrigerator: "Tủ lạnh",
      air_conditioner: "Máy lạnh",
      water_heater: "Vòi nước nóng",
      table_and_chairs: "Bàn ghế",
      electric_stove: "Bếp điện",
      gas_stove: "Bếp ga"
    };
    const amenityName = amenityNameMap[amenity.name] || "Tiện nghi";
    const amenityPrice = amenity.price || 0;

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
        <button class="add-amenity btn btn-sm btn-success">Thêm</button>
        <button class="remove-amenity btn btn-sm btn-danger" style="display: none;">Xóa</button>
      </div>
    `;

    const addButton = amenityItem.querySelector(".add-amenity");
    const removeButton = amenityItem.querySelector(".remove-amenity");

    if (selectedAmenities.includes(amenity._id)) {
      addButton.style.display = "none";
      removeButton.style.display = "inline-block";
    }

    addButton?.addEventListener("click", () => {
      addAmenity(amenity); // Pass the full amenity object
      addButton.style.display = "none";
      removeButton.style.display = "inline-block";
    });
    removeButton?.addEventListener("click", () => {
      removeAmenity(amenity); // Pass the full amenity object
      addButton.style.display = "inline-block";
      removeButton.style.display = "none";
    });

    return amenityItem;
  }

  // Function: Render Amenity List
  async function renderAmenityListUI(amenities) {
    if (!amenityListContainer) return;
    amenityListContainer.innerHTML = "";

    if (!amenities || amenities.length === 0) {
      amenityListContainer.innerHTML =
        "<p>Không có tiện nghi chọn thêm nào.</p>"; // Changed message slightly
      return;
    }

    const itemPromises = amenities.map((amenity) => createAmenityItem(amenity));
    const items = await Promise.all(itemPromises);
    items.forEach((item) => amenityListContainer.appendChild(item));
  }

  // Function: Create a Utility Item Element
  async function createUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item");
    utilityItem.dataset.utilityId = utility._id;

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
      }
    }

    const utilityNameMap = {
      /* ... mappings ... */ wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
    };
    const utilityName = utilityNameMap[utility.name] || "Tiện ích";
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
          <button class="add-utility btn btn-sm btn-success">Thêm</button>
          <button class="remove-utility btn btn-sm btn-danger" style="display: none;">Xóa</button>
      </div>
    `;

    const addButton = utilityItem.querySelector(".add-utility");
    const removeButton = utilityItem.querySelector(".remove-utility");

    if (selectedUtilities.includes(utility._id)) {
      addButton.style.display = "none";
      removeButton.style.display = "inline-block";
    }

    addButton?.addEventListener("click", () => {
      addUtility(utility); // Pass full object
      addButton.style.display = "none";
      removeButton.style.display = "inline-block";
    });
    removeButton?.addEventListener("click", () => {
      removeUtility(utility); // Pass full object
      addButton.style.display = "inline-block";
      removeButton.style.display = "none";
    });

    return utilityItem;
  }

  // Function: Render Utility List
  async function renderUtilityListUI(utilities) {
    if (!utilityListContainer) return;
    utilityListContainer.innerHTML = "";

    if (!utilities || utilities.length === 0) {
      utilityListContainer.innerHTML =
        "<p>Không có tiện ích chọn thêm nào.</p>"; // Changed message slightly
      return;
    }
    const itemPromises = utilities.map((utility) => createUtilityItem(utility));
    const items = await Promise.all(itemPromises);
    items.forEach((item) => utilityListContainer.appendChild(item));
  }

  // --- Amenity and Utility Selection Logic ---

  // Function: Add Amenity
  function addAmenity(amenity) {
    // Ensure amenity exists and has a valid price
    const price = amenity?.price || 0;
    if (!selectedAmenities.includes(amenity._id)) {
      selectedAmenitiesTotalPrice += price;
      selectedAmenities.push(amenity._id);
      updateRoomDepositPriceDisplay(); // Update the specific deposit display
    }
  }

  // Function: Remove Amenity
  function removeAmenity(amenity) {
    const price = amenity?.price || 0;
    const index = selectedAmenities.indexOf(amenity._id);
    if (index > -1) {
      selectedAmenitiesTotalPrice -= price;
      // Prevent total going below zero due to potential floating point issues or bad data
      if (selectedAmenitiesTotalPrice < 0) selectedAmenitiesTotalPrice = 0;
      selectedAmenities.splice(index, 1);
      updateRoomDepositPriceDisplay(); // Update the specific deposit display
    }
  }

  // Function: Add Utility
  function addUtility(utility) {
    const price = utility?.price || 0;
    if (!selectedUtilities.includes(utility._id)) {
      selectedUtilitiesTotalPrice += price;
      selectedUtilities.push(utility._id);
      updateRoomDepositPriceDisplay(); // Update the specific deposit display
    }
  }

  // Function: Remove Utility
  function removeUtility(utility) {
    const price = utility?.price || 0;
    const index = selectedUtilities.indexOf(utility._id);
    if (index > -1) {
      selectedUtilitiesTotalPrice -= price;
      if (selectedUtilitiesTotalPrice < 0) selectedUtilitiesTotalPrice = 0;
      selectedUtilities.splice(index, 1);
      updateRoomDepositPriceDisplay(); // Update the specific deposit display
    }
  }

  // Function: Update Displayed Room *Deposit* Price
  function updateRoomDepositPriceDisplay() {
    // Select elements *after* they are rendered by renderRoomInfoUI
    const initialPriceElement = roomInfoContainer?.querySelector(
      ".room-price .price-value" // Get the base rent price element
    );

    // Get the base rent price from its data attribute
    const initialRoomPrice =
      parseFloat(initialPriceElement.dataset.initialPrice) || 0;

    // Calculate the total deposit price: base rent + selected amenities
    const newTotalDepositPrice =
      initialRoomPrice +
      selectedAmenitiesTotalPrice +
      selectedUtilitiesTotalPrice;

    // Update the text content of the specific deposit total element
    initialPriceElement.textContent = newTotalDepositPrice.toLocaleString(
      "vi-VN",
      {
        style: "currency",
        currency: "VND"
      }
    );
  }

  // --- Image Navigation Logic ---
  function updateImagePosition() {
    if (!imageList || imageElements.length === 0) return;
    const imageWidth = imageElements[0].offsetWidth;
    const totalMargin = 40; // margin-left + margin-right
    const translateX = -currentImageIndex * (imageWidth + totalMargin);
    imageList.style.transform = `translateX(${translateX}px)`;
    imageElements.forEach((img, index) => {
      img.classList.toggle("active", index === currentImageIndex);
    });
  }

  // --- Main Fetch and Render Orchestration ---
  async function fetchAndRenderUiRoomDetails(roomId) {
    try {
      const room = await RoomService.getRoomById(roomId);

      roomInfoContainer.innerHTML =
        "<p class='text-danger text-center'>Không tìm thấy phòng.</p>";

      renderRoomInfoUI(room);
      await renderRoomImagesUI(room);

      const amenityUtilityPromises = [];
      if (room.amenities && room.amenities.length > 0) {
        amenityUtilityPromises.push(
          Promise.all(
            room.amenities.map((id) => AmenityService.getAmenityById(id))
          )
            .then(renderAmenityListUI)
            .catch((error) => {
              console.error(error);
              amenityListContainer.innerHTML =
                "<p class='text-danger d-flex justify-content-center align-items-center'>Lỗi tải tiện nghi.</p>";
            })
        );
      } else {
        if (amenityListContainer)
          amenityListContainer.innerHTML =
            "<p class='text-danger d-flex justify-content-center align-items-center'>Hiện tại phòng này không được cung cấp bất kì tiện nghi nào.</p>";
      }
      if (room.utilities && room.utilities.length > 0) {
        amenityUtilityPromises.push(
          Promise.all(
            room.utilities.map((id) => UtilityService.getUtilityById(id))
          )
            .then(renderUtilityListUI)
            .catch((error) => {
              console.error(error);
              utilityListContainer.innerHTML =
                "<p class='text-danger d-flex justify-content-center align-items-center'>Lỗi tải tiện ích.</p>";
            })
        );
      } else {
        if (utilityListContainer)
          utilityListContainer.innerHTML =
            "<p class='text-danger d-flex justify-content-center align-items-center'>Hiện tại phòng này không được cung cấp bất kì tiện ích nào.</p>";
      }
      await Promise.all(amenityUtilityPromises);
    } catch (error) {
      console.error(error);
      roomInfoContainer.innerHTML =
        "<p class='text-danger text-center'>Lỗi tải thông tin phòng.</p>";
    }
  }

  // --- Event Listeners Setup ---
  prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      updateImagePosition();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentImageIndex < imageElements.length - 1) {
      currentImageIndex++;
      updateImagePosition();
    }
  });

  // --- Initial Load ---
  const roomId = getRoomIdFromUrl();
  if (roomId) {
    fetchAndRenderUiRoomDetails(roomId);
  } else {
    console.error(error);
    if (roomInfoContainer)
      roomInfoContainer.innerHTML =
        "<p class='text-danger text-center'>URL không hợp lệ.</p>";
  }
});
