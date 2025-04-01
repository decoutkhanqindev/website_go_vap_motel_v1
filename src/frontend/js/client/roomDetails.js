import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope: State Variables ---
// --- State for Image Slider and Item Selection ---
let currentImageIndex = 0;
let imageElements = [];
let selectedAmenitiesTotalPrice = 0;
let selectedUtilitiesTotalPrice = 0;
let selectedAmenities = [];
let selectedUtilities = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---

  // --- Selectors for Room Details Display Areas ---
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

  // --- Core Utility Functions ---

  // Function: Extracts the room ID from the current URL path.
  function getRoomIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    const potentialId = pathSegments[pathSegments.length - 1];
    return potentialId || null;
  }

  // --- UI Rendering Functions ---

  // Function: Renders the main room information section (name, price, status, etc.).
  function renderRoomInfoUI(room) {
    if (!roomInfoContainer) return;
    roomInfoContainer.innerHTML = ""; // Clear previous

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
              room.description
                ? room.description.charAt(0).toUpperCase() +
                  room.description.slice(1)
                : "Không có mô tả."
            }</span>
        </p>
    `;
    updateRoomDepositPriceDisplay(); // Update price display initially
  }

  // Function: Renders the room images in the image slider, handling async loading.
  async function renderRoomImagesUI(room) {
    if (!imageList) return;
    imageList.innerHTML = "";
    imageElements = []; // Reset global image array

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
          img.alt = `Room image ${index + 1}`;
          img.dataset.index = index;
          return img;
        } catch (error) {
          console.error(`Error loading image ${imageId}:`, error);
          const img = document.createElement("img"); // Fallback image element
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
      // Display default image if none found
      const img = document.createElement("img");
      img.src = "../../assets/logo_error.png";
      img.alt = "Default image";
      imageList.appendChild(img);
      imageElements.push(img);
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
    }
    // Final check for button visibility
    if (imageElements.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
    } else {
      if (prevButton) prevButton.style.display = "block";
      if (nextButton) nextButton.style.display = "block";
    }
  }

  // Function: Creates a DOM element for a single selectable amenity item.
  async function createAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item");
    amenityItem.dataset.amenityId = amenity._id;

    let imageSrc = "../../assets/logo_error.png";
    // ... (image loading logic) ...
    if (amenity.images && amenity.images.length > 0) {
      try {
        /* ... fetch and create base64 src ... */
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
      }
    }

    const amenityNameMap = {
      /* ... name mappings ... */ bed: "Giường",
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

    // Add/Remove button logic and listeners
    const addButton = amenityItem.querySelector(".add-amenity");
    const removeButton = amenityItem.querySelector(".remove-amenity");
    if (selectedAmenities.includes(amenity._id)) {
      // Set initial state
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    }
    addButton?.addEventListener("click", () => {
      addAmenity(amenity);
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    });
    removeButton?.addEventListener("click", () => {
      removeAmenity(amenity);
      if (addButton) addButton.style.display = "inline-block";
      if (removeButton) removeButton.style.display = "none";
    });

    return amenityItem;
  }

  // Function: Renders the list of selectable amenity items.
  async function renderAmenityListUI(amenities) {
    if (!amenityListContainer) return;
    amenityListContainer.innerHTML = ""; // Clear previous

    if (!amenities || amenities.length === 0) {
      amenityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>Phòng này không có tiện nghi tùy chọn thêm.</p>";
      return;
    }

    const itemPromises = amenities.map((amenity) => createAmenityItem(amenity));
    const items = await Promise.all(itemPromises);
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(item));
    amenityListContainer.appendChild(fragment);
  }

  // Function: Creates a DOM element for a single selectable utility item.
  async function createUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item");
    utilityItem.dataset.utilityId = utility._id;

    let imageSrc = "../../assets/logo_error.png";
    // ... (image loading logic) ...
    if (utility.images && utility.images.length > 0) {
      try {
        /* ... fetch and create base64 src ... */
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
      }
    }

    const utilityNameMap = {
      /* ... name mappings ... */ wifi: "Wifi",
      parking: "Đỗ xe",
      cleaning: "Vệ sinh hàng tuần"
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
          <button class="add-utility btn btn-sm btn-success">Thêm</button>
          <button class="remove-utility btn btn-sm btn-danger" style="display: none;">Xóa</button>
      </div>
    `;

    // Add/Remove button logic and listeners
    const addButton = utilityItem.querySelector(".add-utility");
    const removeButton = utilityItem.querySelector(".remove-utility");
    if (selectedUtilities.includes(utility._id)) {
      // Set initial state
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    }
    addButton?.addEventListener("click", () => {
      addUtility(utility);
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    });
    removeButton?.addEventListener("click", () => {
      removeUtility(utility);
      if (addButton) addButton.style.display = "inline-block";
      if (removeButton) removeButton.style.display = "none";
    });

    return utilityItem;
  }

  // Function: Renders the list of selectable utility items.
  async function renderUtilityListUI(utilities) {
    if (!utilityListContainer) return;
    utilityListContainer.innerHTML = ""; // Clear previous

    if (!utilities || utilities.length === 0) {
      utilityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>Phòng này không có tiện ích tùy chọn thêm.</p>";
      return;
    }
    const itemPromises = utilities.map((utility) => createUtilityItem(utility));
    const items = await Promise.all(itemPromises);
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      if (item) fragment.appendChild(item);
    }); // Append valid items
    utilityListContainer.appendChild(fragment);
  }

  // --- Amenity and Utility Selection Logic ---

  // Function: Adds an amenity to selection, updates total price, and updates UI.
  function addAmenity(amenity) {
    const price = Number(amenity?.price) || 0;
    if (amenity?._id && !selectedAmenities.includes(amenity._id)) {
      selectedAmenitiesTotalPrice += price;
      selectedAmenities.push(amenity._id);
      updateRoomDepositPriceDisplay();
    }
  }

  // Function: Removes an amenity from selection, updates total price, and updates UI.
  function removeAmenity(amenity) {
    const price = Number(amenity?.price) || 0;
    const index = amenity?._id ? selectedAmenities.indexOf(amenity._id) : -1;
    if (index > -1) {
      selectedAmenitiesTotalPrice -= price;
      if (selectedAmenitiesTotalPrice < 0) selectedAmenitiesTotalPrice = 0;
      selectedAmenities.splice(index, 1);
      updateRoomDepositPriceDisplay();
    }
  }

  // Function: Adds a utility to selection, updates total price, and updates UI.
  function addUtility(utility) {
    const price = Number(utility?.price) || 0;
    if (utility?._id && !selectedUtilities.includes(utility._id)) {
      selectedUtilitiesTotalPrice += price;
      selectedUtilities.push(utility._id);
      updateRoomDepositPriceDisplay(); // Update deposit display based on current logic
    }
  }

  // Function: Removes a utility from selection, updates total price, and updates UI.
  function removeUtility(utility) {
    const price = Number(utility?.price) || 0;
    const index = utility?._id ? selectedUtilities.indexOf(utility._id) : -1;
    if (index > -1) {
      selectedUtilitiesTotalPrice -= price;
      if (selectedUtilitiesTotalPrice < 0) selectedUtilitiesTotalPrice = 0;
      selectedUtilities.splice(index, 1);
      updateRoomDepositPriceDisplay(); // Update deposit display based on current logic
    }
  }

  // Function: Updates the displayed "deposit" price (base rent + selected item costs).
  function updateRoomDepositPriceDisplay() {
    const roomPriceElement = roomInfoContainer?.querySelector(
      ".room-price .price-value"
    );
    if (!roomPriceElement) {
      console.warn("Room price display element not found.");
      return;
    }

    const initialRoomPrice =
      parseFloat(roomPriceElement.dataset.initialPrice) || 0;
    // Current logic includes utilities in initial deposit display
    const newTotalDepositPrice =
      initialRoomPrice +
      selectedAmenitiesTotalPrice +
      selectedUtilitiesTotalPrice;
    roomPriceElement.textContent = newTotalDepositPrice.toLocaleString(
      "vi-VN",
      { style: "currency", currency: "VND" }
    );

    // Update price label for clarity
    const priceLabelElement = roomInfoContainer?.querySelector(
      ".room-price .price-label"
    );
    if (priceLabelElement) {
      if (selectedAmenitiesTotalPrice > 0 || selectedUtilitiesTotalPrice > 0) {
        priceLabelElement.textContent =
          "Tổng tiền cọc (bao gồm tiện nghi/tiện ích đã chọn):";
      } else {
        priceLabelElement.textContent = "Giá thuê cơ bản (tiền cọc):";
      }
    }
  }

  // --- Image Navigation Logic ---

  // Function: Updates the visual position of the image slider and button visibility.
  function updateImagePosition() {
    if (!imageList || imageElements.length === 0) return;
    const imageWidth = imageElements[0].offsetWidth;
    // Calculate margin dynamically (assuming consistent margin/gap)
    const computedStyle = window.getComputedStyle(imageElements[0]);
    const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
    const marginRight = parseFloat(computedStyle.marginRight) || 0;
    const totalMargin = marginLeft + marginRight;

    // Calculate and clamp translation
    const maxTranslateX = 0;
    const minTranslateX =
      -(imageElements.length - 1) * (imageWidth + totalMargin);
    let translateX = -currentImageIndex * (imageWidth + totalMargin);
    translateX = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));

    imageList.style.transform = `translateX(${translateX}px)`;

    // Update active class and button visibility
    imageElements.forEach((img, index) =>
      img.classList.toggle("active", index === currentImageIndex)
    );
    if (prevButton)
      prevButton.style.visibility =
        currentImageIndex > 0 ? "visible" : "hidden";
    if (nextButton)
      nextButton.style.visibility =
        currentImageIndex < imageElements.length - 1 ? "visible" : "hidden";
  }

  // --- Main Data Fetching and Rendering Orchestration ---

  // Function: Fetches room details, images, amenities, utilities and renders the entire UI.
  async function fetchAndRenderUiRoomDetails(roomId) {
    try {
      // Show loading states
      if (roomInfoContainer)
        roomInfoContainer.innerHTML =
          "<p class='text-center p-5'>Đang tải...</p>";
      // ... clear other containers ...
      if (imageList) imageList.innerHTML = "";
      if (amenityListContainer) amenityListContainer.innerHTML = "";
      if (utilityListContainer) utilityListContainer.innerHTML = "";

      const room = await RoomService.getRoomById(roomId);
      if (!room) {
        throw new Error(`Room with ID ${roomId} not found.`);
      }

      // Render core info and images
      renderRoomInfoUI(room);
      await renderRoomImagesUI(room); // Await image rendering

      // Fetch and render associated amenities and utilities
      const amenityUtilityPromises = [];
      if (room.amenities && room.amenities.length > 0) {
        amenityUtilityPromises.push(
          Promise.all(
            room.amenities.map((id) => AmenityService.getAmenityById(id))
          )
            .then((detailedAmenities) => {
              const validAmenities = detailedAmenities.filter(
                (a) => a !== null && typeof a === "object"
              );
              if (validAmenities.length !== detailedAmenities.length)
                console.warn("Some amenities were invalid.");
              return renderAmenityListUI(validAmenities);
            })
            .catch((error) => {
              console.error("Error fetching detailed amenities:", error);
              if (amenityListContainer)
                amenityListContainer.innerHTML =
                  "<p class='text-danger text-center p-3'>Lỗi tải tiện nghi.</p>";
            })
        );
      } else {
        if (amenityListContainer)
          amenityListContainer.innerHTML =
            "<p class='text-muted p-3 text-center'>Phòng này không có tiện nghi tùy chọn thêm.</p>";
      }

      if (room.utilities && room.utilities.length > 0) {
        amenityUtilityPromises.push(
          Promise.all(
            room.utilities.map((id) => UtilityService.getUtilityById(id))
          )
            .then((detailedUtilities) => {
              const validUtilities = detailedUtilities.filter(
                (u) => u !== null && typeof u === "object"
              );
              if (validUtilities.length !== detailedUtilities.length)
                console.warn("Some utilities were invalid.");
              return renderUtilityListUI(validUtilities);
            })
            .catch((error) => {
              console.error("Error fetching detailed utilities:", error);
              if (utilityListContainer)
                utilityListContainer.innerHTML =
                  "<p class='text-danger text-center p-3'>Lỗi tải tiện ích.</p>";
            })
        );
      } else {
        if (utilityListContainer)
          utilityListContainer.innerHTML =
            "<p class='text-muted p-3 text-center'>Phòng này không có tiện ích tùy chọn thêm.</p>";
      }

      await Promise.all(amenityUtilityPromises); // Wait for lists to render
    } catch (error) {
      console.error("Error fetching or rendering room details:", error);
      const errorMessage = error?.message
        ? error.message.charAt(0).toUpperCase() + error.message.slice(1)
        : "Không rõ nguyên nhân";
      if (roomInfoContainer)
        roomInfoContainer.innerHTML = `<p class='text-danger text-center p-5'>Lỗi tải thông tin phòng (${errorMessage}).</p>`;
      // Clear dependent sections on error
      if (imageList) imageList.innerHTML = "";
      if (amenityListContainer) amenityListContainer.innerHTML = "";
      if (utilityListContainer) utilityListContainer.innerHTML = "";
    }
  }

  // --- Event Listener Setup ---

  // Event Listeners: Image Slider Navigation
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImagePosition();
      }
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (currentImageIndex < imageElements.length - 1) {
        currentImageIndex++;
        updateImagePosition();
      }
    });
  }

  // Event Listener: Recalculate slider on window resize
  window.addEventListener("resize", updateImagePosition);

  // --- Initial Page Load Logic ---
  // Get Room ID and initiate data fetching and rendering.
  const roomId = getRoomIdFromUrl();
  if (roomId) {
    fetchAndRenderUiRoomDetails(roomId);
  } else {
    console.error("No room ID found in URL.");
    if (roomInfoContainer)
      roomInfoContainer.innerHTML =
        "<p class='text-danger text-center p-5'>URL không hợp lệ hoặc thiếu ID phòng.</p>";
  }
});
