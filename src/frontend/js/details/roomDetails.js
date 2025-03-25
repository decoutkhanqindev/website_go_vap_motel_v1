// --- roomDetails.js ---

import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- Global Scope Variables ---
let currentImageIndex = 0;
let imageElements = []; // Array to store <img> elements
let selectedAmenitiesTotalPrice = 0;
let selectedUtilitiesTotalPrice = 0;
let selectedAmenities = []; // Array to store IDs of selected amenities
let selectedUtilities = []; // Array to store IDs of selected utilities

// --- DOMContentLoaded Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Function: Fetch Room Details and Render UI ---
  async function fetchAndRenderUiRoomDetails(roomId) {
    try {
      const room = await RoomService.getRoomById(roomId);

      renderRoomImagesUI(room); // Render room images
      setupNavigation(); // Setup image navigation (prev/next buttons)
      renderRoomInfoUI(room); // Render room information

      // Fetch and render amenities *if* the room has any
      if (room.amenities && room.amenities.length > 0) {
        try {
          // Create an array of Promises to fetch each amenity by its ID
          const amenityPromises = room.amenities.map((amenityId) =>
            AmenityService.getAmenityById(amenityId)
          );
          // Use Promise.all to wait for all amenity fetches to complete
          const amenities = await Promise.all(amenityPromises);
          renderAmenityListUI(amenities); // Render the list of amenities
        } catch (error) {
          handleError(error, "Error fetching amenities");
          console.error("Error fetching amenities:", error);
        }
      }

      // Fetch and render utilities *if* the room has any
      if (room.utilities && room.utilities.length > 0) {
        try {
          // Create an array of Promises to fetch each utility by its ID
          const utilityPromises = room.utilities.map((utilityId) =>
            UtilityService.getUtilityById(utilityId)
          );
          // Use Promise.all
          const utilities = await Promise.all(utilityPromises);
          renderUtilityListUI(utilities);
        } catch (error) {
          handleError(error, "Error fetching utilities");
          console.error("Error fetching utilities:", error);
        }
      }
    } catch (error) {
      handleError(error, "Failed to fetch room details.");
    }
  }

  // --- Get Room ID from URL ---
  const roomId = getRoomIdFromUrl();
  if (roomId) {
    fetchAndRenderUiRoomDetails(roomId); // Fetch and render room details
  } else {
    console.error("Room ID not found in URL.");
  }
});

// --- Helper Function: Extract Room ID from URL ---
function getRoomIdFromUrl() {
  const pathSegments = window.location.pathname.split("/");
  return pathSegments.pop(); // Get the last segment (the ID)
}

// --- UI Rendering Functions ---

// Function: Render Room Information
async function renderRoomInfoUI(room) {
  const container = document.querySelector(".room-info-container");
  container.innerHTML = ""; // Clear previous content

  container.innerHTML = `
      <h3 class="room-name  d-flex justify-content-center align-items-center">Phòng ${
        room.roomNumber || "N/A"
      }</h3>
      <p class="room-address">
        <span class="address-label">Địa chỉ:</span>
        <span class="address-value">${room.address || "N/A"}</span>
      </p>
      <p class="room-price">
        <span class="price-label">Giá:</span>
        <span class="price-value" data-initial-price="${room.rentPrice}">${
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
        }">
          ${
            room.status === "vacant"
              ? "Trống"
              : room.status === "occupied"
              ? "Đã thuê"
              : "Không có sẵn"
          }
        </span>
      </p>
        <p class="room-description">
        <span class="description-label">Mô tả:</span>
        <span class="description-value">${
          room.description || "Không có mô tả."
        }</span>
      </p>
  `;
}

// Function: Create an Amenity Item Element
async function createAmenityItem(amenity) {
  const amenityItem = document.createElement("div");
  amenityItem.classList.add("amenity-item");
  amenityItem.dataset.amenityId = amenity._id; // Store the amenity's ID

  // --- Image Handling ---
  let imageSrc = "../../assets/logo_error.png"; // Default image
  if (amenity.images && amenity.images.length > 0) {
    try {
      // Fetch the image data from the server
      const imageData = await AmenityService.getAmenityImageById(
        amenity.images[0]
      );
      // Convert to base64
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
      // Keep default error image
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

  // --- Create HTML ---
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
      <button class="add-amenity">Thêm</button>
      <button class="remove-amenity" style="display: none;">Xóa</button>
    </div>
  `;

  const addButton = amenityItem.querySelector(".add-amenity");
  const removeButton = amenityItem.querySelector(".remove-amenity");

  // --- Check if amenity is already selected ---
  if (selectedAmenities.includes(amenity._id)) {
    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
  }

  // --- Event Listeners for Add/Remove Buttons ---
  addButton.addEventListener("click", () => {
    addAmenity(amenity);
    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
  });
  removeButton.addEventListener("click", () => {
    removeAmenity(amenity);
    addButton.style.display = "inline-block";
    removeButton.style.display = "none";
  });

  return amenityItem;
}

// Function: Render Amenity List
async function renderAmenityListUI(amenities) {
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

async function createUtilityItem(utility) {
  const utilityItem = document.createElement("div");
  utilityItem.classList.add("utility-item");
  utilityItem.dataset.utilityId = utility._id; // Store the utility's ID

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
            <button class="add-utility">Thêm</button>
            <button class="remove-utility" style="display: none;">Xóa</button>
        </div>
    `;

  const addButton = utilityItem.querySelector(".add-utility");
  const removeButton = utilityItem.querySelector(".remove-utility");

  // --- Check if amenity is already selected ---
  if (selectedUtilities.includes(utility._id)) {
    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
  }

  // --- Event Listeners for Add/Remove Buttons ---
  addButton.addEventListener("click", () => {
    addUtility(utility);
    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
  });
  removeButton.addEventListener("click", () => {
    removeUtility(utility);
    addButton.style.display = "inline-block";
    removeButton.style.display = "none";
  });
  return utilityItem;
}

async function renderUtilityListUI(utilities) {
  const utilityListContainer = document.querySelector(
    ".utility-list .utility-list-container"
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

// Function: Render Room Images
async function renderRoomImagesUI(room) {
  const imageList = document.querySelector(".image-list");
  imageList.innerHTML = ""; // Clear previous images
  imageElements = []; // Reset the imageElements array

  if (room.images && room.images.length > 0) {
    // --- Loop through image IDs and fetch image data ---
    for (let i = 0; i < room.images.length; i++) {
      const imageId = room.images[i];
      try {
        // Fetch image data
        const imageData = await RoomService.getRoomImageById(imageId);
        // Convert to base64
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const imageSrc = `data:${imageData.contentType};base64,${base64Image}`;

        // Create the <img> element
        const img = document.createElement("img");
        img.src = imageSrc;
        img.alt = `Room Image ${i + 1}`;
        img.dataset.index = i; // Store the image index
        imageList.appendChild(img);
        imageElements.push(img); // Add to the imageElements array
      } catch (error) {
        handleError(error, "Error fetching or processing image.");
        console.error("Error fetching or processing image:", error);
      }
    }
    // Set the first image as active
    if (imageElements.length > 0) {
      imageElements[0].classList.add("active");
    }
  } else {
    // --- Display a default image if no images are available ---
    const img = document.createElement("img");
    img.src = "../../assets/logo_error.png"; // Path to your default image
    img.alt = "Default Image";
    imageList.appendChild(img);
    imageElements.push(img); // Add the default image to the array
  }
  updateImagePosition(); // Initialize image position
}

// --- Amenity and Utility Selection ---

// Function: Add Amenity
function addAmenity(amenity) {
  selectedAmenitiesTotalPrice += amenity.price;
  selectedAmenities.push(amenity._id); // Add amenity ID to the array
  updateRoomPrice(); // Update the displayed room price
}

// Function: Remove Amenity
function removeAmenity(amenity) {
  selectedAmenitiesTotalPrice -= amenity.price;
  selectedAmenities = selectedAmenities.filter((id) => id !== amenity._id); // Remove from array
  updateRoomPrice(); // Update the displayed room price
}

// Function: Add Utility
function addUtility(utility) {
  selectedUtilitiesTotalPrice += utility.price;
  selectedUtilities.push(utility._id);
  updateRoomPrice();
}

// Function: remove Utility
function removeUtility(utility) {
  selectedUtilitiesTotalPrice -= utility.price;
  selectedUtilities = selectedUtilities.filter((id) => id !== utility._id);
  updateRoomPrice();
}

// Function: Update Room Price
function updateRoomPrice() {
  const roomPriceElement = document.querySelector(".room-price .price-value");
  const initialRoomPrice = parseFloat(roomPriceElement.dataset.initialPrice); // Get initial price
  const newPrice = initialRoomPrice + selectedAmenitiesTotalPrice; // + selectedUtilitiesTotalPrice; // Calculate the new price

  roomPriceElement.textContent = newPrice.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND"
  });
}

// --- Image Navigation ---

// Function: Setup Navigation Buttons (Previous/Next)
function setupNavigation() {
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      updateImagePosition(); // Update the image display
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentImageIndex < imageElements.length - 1) {
      currentImageIndex++;
      updateImagePosition(); // Update the image display
    }
  });
}

// Function: Update Image Position and Active State
function updateImagePosition() {
  const imageList = document.querySelector(".image-list");
  // const imageListContainer = document.querySelector(".image-list-container"); // No need to use

  // Calculate the position to center the active image
  // Get container width
  // const containerWidth = imageListContainer.offsetWidth; // No need to use.

  // Get image width (assume all images have the same size when not active).
  const imageWidth = imageElements[0].offsetWidth;
  const activeImageWidth = imageWidth * 1.5; // Active image width

  // Calculate translateX position
  // let translateX = -currentImageIndex * (imageWidth + 10) + (containerWidth - activeImageWidth) / 2; // 10 is margin-right, containerWidth has removed.
  let translateX = -currentImageIndex * (imageWidth + 40); // 40 tổng của margin-left và margin-right

  imageList.style.transform = `translateX(${translateX}px)`;

  // Update the "active" class
  imageElements.forEach((img, index) => {
    if (index === currentImageIndex) {
      img.classList.add("active");
    } else {
      img.classList.remove("active");
    }
  });
}

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
