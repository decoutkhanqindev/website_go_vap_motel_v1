import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- global scope variables ---
// tracks the index of the currently displayed image in the image slider
let currentImageIndex = 0;
// stores the fetched and created <img> dom elements for the image slider
let imageElements = [];
// tracks the total price of selected *amenities* (added to deposit)
let selectedAmenitiesTotalPrice = 0;
// tracks the total price of selected *utilities* (monthly cost - kept for potential future use)
let selectedUtilitiesTotalPrice = 0; // still track this might be useful elsewhere later
// stores the ids of amenities currently selected by the user
let selectedAmenities = [];
// stores the ids of utilities currently selected by the user
let selectedUtilities = [];

// --- domcontentloaded event listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- element selectors ---
  // main container for displaying the core room information (name address price etc)
  const roomInfoContainer = document.querySelector(".room-info-container");
  // container for listing selectable amenities offered with the room
  const amenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container"
  );
  // container for listing selectable utilities offered with the room
  const utilityListContainer = document.querySelector(
    ".utility-list .utility-list-container"
  );
  // container for the image slider displaying room pictures
  const imageList = document.querySelector(".image-list");
  // button to navigate to the previous image in the slider
  const prevButton = document.getElementById("prevButton");
  // button to navigate to the next image in the slider
  const nextButton = document.getElementById("nextButton");
  // note: price elements are selected dynamically *after* rendering room info

  // --- core functions ---

  // extracts the room id from the current url path
  function getRoomIdFromUrl() {
    // split the url path into segments
    const pathSegments = window.location.pathname.split("/");
    // the id is expected to be the last segment
    const potentialId = pathSegments[pathSegments.length - 1];
    // basic check to ensure the segment is not empty
    return potentialId || null;
  }

  // --- ui rendering functions ---

  // renders the main room information section based on fetched room data
  function renderRoomInfoUI(room) {
    // ensure the container element exists
    if (!roomInfoContainer) return;
    // clear any previous content
    roomInfoContainer.innerHTML = "";

    // determine the display text and css class for the room status
    let statusText = "không có sẵn";
    let statusClass = "status-unavailable";
    if (room.status === "vacant") {
      statusText = "trống";
      statusClass = "status-vacant";
    } else if (room.status === "occupied") {
      statusText = "đã thuê";
      statusClass = "status-occupied";
    }

    // store the initial base rent price we'll use this for deposit calculation later
    const initialRentPrice = room.rentPrice || 0;

    // populate the container's innerhtml with room details
    // use more descriptive labels for clarity
    // store the initial price in a data attribute for later reference
    roomInfoContainer.innerHTML = `
        <h3 class="room-name d-flex justify-content-center align-items-center">phòng ${
          room.roomNumber || "n/a" // display room number or n/a
        }</h3>
        <p class="room-address">
            <span class="address-label">địa chỉ:</span>
            <span class="address-value">${room.address || "n/a"}</span>
        </p>
        <p class="room-price">
            <span class="price-label">giá thuê cơ bản:</span>
            <span class="price-value" data-initial-price="${initialRentPrice}">${initialRentPrice.toLocaleString(
      "vi-VN", // format as vietnamese currency
      { style: "currency", currency: "VND" }
    )}</span>
        </p>
        <p class="room-occupant-number">
            <span class="occupant-number-label">số người ở tối đa:</span>
            <span class="occupant-number-value">${
              room.occupantsNumber || "n/a"
            }</span>
        </p>
        <p class="room-status">
            <span class="status-label">trạng thái:</span>
            <span class="status-value ${statusClass}">${statusText}</span>
        </p>
        <p class="room-description">
            <span class="description-label">mô tả:</span>
            <span class="description-value">${
              room.description || "không có mô tả." // provide default text if no description
            }</span>
        </p>
    `;
    // update the price display initially (it might change if amenities are selected later)
    updateRoomDepositPriceDisplay();
  }

  // renders the images associated with the room in the image slider container
  // fetches image data asynchronously
  async function renderRoomImagesUI(room) {
    // ensure the image list container exists
    if (!imageList) return;
    // clear previous images and reset the global image element array
    imageList.innerHTML = "";
    imageElements = [];

    // check if the room has images
    if (room.images && room.images.length > 0) {
      // create an array of promises to fetch and create each image element
      const imagePromises = room.images.map(async (imageId, index) => {
        try {
          // fetch image data by id
          const imageData = await RoomService.getRoomImageById(imageId);
          // convert binary data to base64 string
          const base64Image = btoa(
            new Uint8Array(imageData.data.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          // create data url for the image source
          const imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
          // create the img element
          const img = document.createElement("img");
          img.src = imageSrc;
          img.alt = `room image ${index + 1}`;
          img.dataset.index = index; // store index for potential future use
          return img; // return the created element
        } catch (error) {
          // handle errors fetching individual images
          console.error(`error loading image ${imageId}:`, error);
          // create a placeholder error image element
          const img = document.createElement("img");
          img.src = "/assets/logo_error.png"; // fallback image
          img.alt = `error loading image ${index + 1}`;
          img.dataset.index = index;
          return img; // return the error placeholder element
        }
      });

      // wait for all image fetches and element creations to complete
      const fetchedImages = await Promise.all(imagePromises);
      // append each successfully created/fetched image element to the container
      // and add it to the global imageelements array
      fetchedImages.forEach((img) => {
        if (img) {
          // ensure img is not null (though shouldn't happen here)
          imageList.appendChild(img);
          imageElements.push(img);
        }
      });

      // if images were loaded set the first one as active and update slider position
      if (imageElements.length > 0) {
        imageElements[0].classList.add("active"); // make the first image visible
        updateImagePosition(); // adjust slider visually
      }
    } else {
      // if the room has no images display a default placeholder image
      const img = document.createElement("img");
      img.src = "../../assets/logo_error.png";
      img.alt = "default image";
      imageList.appendChild(img);
      imageElements.push(img); // add the placeholder to the array
      // disable buttons if only one placeholder image
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
    }
    // ensure buttons are hidden/shown based on final image count
    if (imageElements.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
    } else {
      if (prevButton) prevButton.style.display = "block"; // or 'inline-block' etc.
      if (nextButton) nextButton.style.display = "block";
    }
  }

  // creates a dom element for a single selectable amenity item
  // includes image name price note and add/remove buttons
  async function createAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item");
    amenityItem.dataset.amenityId = amenity._id; // store id for selection logic

    // attempt to load the first image for the amenity
    let imageSrc = "../../assets/logo_error.png"; // fallback
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
        console.error(`error loading image for amenity ${amenity._id}:`, error);
        // fallback already set
      }
    }

    // map internal names to vietnamese display names
    const amenityNameMap = {
      bed: "giường",
      refrigerator: "tủ lạnh",
      air_conditioner: "máy lạnh",
      water_heater: "vòi nước nóng",
      table_and_chairs: "bàn ghế",
      electric_stove: "bếp điện",
      gas_stove: "bếp ga"
    };
    const amenityName =
      amenityNameMap[amenity.name] || amenity.name || "tiện nghi";
    const amenityPrice = amenity.price || 0; // default price to 0 if missing

    // populate the innerhtml for the amenity item
    amenityItem.innerHTML = `
      <img src="${imageSrc}" alt="${amenityName}" class="amenity-image">
      <div class="amenity-info">
        <h3 class="amenity-name">${amenityName}</h3>
        <p class="amenity-price">
          <span class="price-label">giá:</span>
          <span class="price-value">${amenityPrice.toLocaleString("vi-VN", {
            // format price
            style: "currency",
            currency: "VND"
          })}</span>
        </p>
        <p class="amenity-note" style="font-style: italic; font-weight: bold">(cộng vào tiền cọc)</p>
        <button class="add-amenity btn btn-sm btn-success">thêm</button>
        <button class="remove-amenity btn btn-sm btn-danger" style="display: none;">xóa</button>
      </div>
    `;

    // get references to the add and remove buttons within this item
    const addButton = amenityItem.querySelector(".add-amenity");
    const removeButton = amenityItem.querySelector(".remove-amenity");

    // set initial button visibility based on whether the amenity is already selected
    if (selectedAmenities.includes(amenity._id)) {
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    }

    // add event listener for the 'add' button
    addButton?.addEventListener("click", () => {
      addAmenity(amenity); // call function to handle selection logic
      // toggle button visibility
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    });
    // add event listener for the 'remove' button
    removeButton?.addEventListener("click", () => {
      removeAmenity(amenity); // call function to handle deselection logic
      // toggle button visibility
      if (addButton) addButton.style.display = "inline-block";
      if (removeButton) removeButton.style.display = "none";
    });

    return amenityItem; // return the created element
  }

  // renders the list of selectable amenity items in the designated container
  async function renderAmenityListUI(amenities) {
    // ensure container exists
    if (!amenityListContainer) return;
    // clear previous items
    amenityListContainer.innerHTML = "";

    // handle case where no amenities are provided for this room
    if (!amenities || amenities.length === 0) {
      amenityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>phòng này không có tiện nghi tùy chọn thêm.</p>"; // changed message slightly
      return;
    }

    // create promises for generating each amenity item element
    const itemPromises = amenities.map((amenity) => createAmenityItem(amenity));
    // wait for all elements to be created
    const items = await Promise.all(itemPromises);
    // use fragment for efficient appending
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(item));
    amenityListContainer.appendChild(fragment);
  }

  // creates a dom element for a single selectable utility item
  // includes image name price unit note and add/remove buttons
  async function createUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item");
    utilityItem.dataset.utilityId = utility._id; // store id for selection logic

    // attempt to load the first image for the utility
    let imageSrc = "../../assets/logo_error.png"; // fallback
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
        console.error(`error loading image for utility ${utility._id}:`, error);
        // fallback already set
      }
    }

    // map internal names to vietnamese display names
    const utilityNameMap = {
      wifi: "wifi",
      parking: "đỗ xe",
      cleaning: "vệ sinh hàng tuần"
    };
    const utilityName =
      utilityNameMap[utility.name] || utility.name || "tiện ích";
    // determine pricing unit based on utility type
    const priceUnit = utility.name === "parking" ? "xe" : "phòng";
    const utilityPrice = utility.price || 0; // default price to 0

    // populate the innerhtml for the utility item
    utilityItem.innerHTML = `
      <img src="${imageSrc}" alt="${utilityName}" class="utility-image">
      <div class="utility-info">
          <h3 class="utility-name">${utilityName}</h3>
          <p class="utility-price">
              <span class="price-label">giá:</span>
              <span class="price-value">${utilityPrice.toLocaleString("vi-VN", {
                // format price
                style: "currency",
                currency: "VND"
              })} / ${priceUnit}</span> <!-- include price unit -->
          </p>
          <p class="utility-note" style="font-style: italic;">(trả phí hàng tháng)</p>
          <button class="add-utility btn btn-sm btn-success">thêm</button>
          <button class="remove-utility btn btn-sm btn-danger" style="display: none;">xóa</button>
      </div>
    `;

    // get references to the add/remove buttons
    const addButton = utilityItem.querySelector(".add-utility");
    const removeButton = utilityItem.querySelector(".remove-utility");

    // set initial button visibility based on selection state
    if (selectedUtilities.includes(utility._id)) {
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    }

    // add event listener for the 'add' button
    addButton?.addEventListener("click", () => {
      addUtility(utility); // handle selection logic
      // toggle button visibility
      if (addButton) addButton.style.display = "none";
      if (removeButton) removeButton.style.display = "inline-block";
    });
    // add event listener for the 'remove' button
    removeButton?.addEventListener("click", () => {
      removeUtility(utility); // handle deselection logic
      // toggle button visibility
      if (addButton) addButton.style.display = "inline-block";
      if (removeButton) removeButton.style.display = "none";
    });

    return utilityItem; // return the created element
  }

  // renders the list of selectable utility items in the designated container
  async function renderUtilityListUI(utilities) {
    // ensure container exists
    if (!utilityListContainer) return;
    // clear previous items
    utilityListContainer.innerHTML = "";

    // handle case where no utilities are provided
    if (!utilities || utilities.length === 0) {
      utilityListContainer.innerHTML =
        "<p class='text-muted p-3 text-center'>phòng này không có tiện ích tùy chọn thêm.</p>"; // changed message slightly
      return;
    }
    // create promises for generating each utility item element
    const itemPromises = utilities.map((utility) => createUtilityItem(utility));
    // wait for all elements to be created
    const items = await Promise.all(itemPromises);
    // use fragment for efficient appending
    const fragment = document.createDocumentFragment();
    items.forEach((item) => utilityListContainer.appendChild(item));
    utilityListContainer.appendChild(fragment);
  }

  // --- amenity and utility selection logic ---

  // adds an amenity to the selection updates total price and deposit display
  function addAmenity(amenity) {
    // ensure amenity exists and has a numeric price
    const price = Number(amenity?.price) || 0; // default to 0 if price missing/invalid
    // add only if not already selected
    if (amenity?._id && !selectedAmenities.includes(amenity._id)) {
      selectedAmenitiesTotalPrice += price;
      selectedAmenities.push(amenity._id);
      updateRoomDepositPriceDisplay(); // update the displayed total price
    }
  }

  // removes an amenity from the selection updates total price and deposit display
  function removeAmenity(amenity) {
    const price = Number(amenity?.price) || 0;
    // find the index of the amenity id in the selected array
    const index = amenity?._id ? selectedAmenities.indexOf(amenity._id) : -1;
    // if found remove it and update the total price
    if (index > -1) {
      selectedAmenitiesTotalPrice -= price;
      // prevent total going below zero due to potential floating point issues or bad data
      if (selectedAmenitiesTotalPrice < 0) selectedAmenitiesTotalPrice = 0;
      selectedAmenities.splice(index, 1); // remove the id from the array
      updateRoomDepositPriceDisplay(); // update the displayed total price
    }
  }

  // adds a utility to the selection updates total price (for utilities) and potentially the main display
  function addUtility(utility) {
    const price = Number(utility?.price) || 0;
    // add only if not already selected
    if (utility?._id && !selectedUtilities.includes(utility._id)) {
      selectedUtilitiesTotalPrice += price; // add to utility total
      selectedUtilities.push(utility._id);
      // updateRoomDepositPriceDisplay(); // initially updated deposit here but utilities are monthly
      // decide if utility price should affect the initially displayed price (it currently does)
      updateRoomDepositPriceDisplay(); // update the specific deposit display
    }
  }

  // removes a utility from the selection updates total price (for utilities) and potentially the main display
  function removeUtility(utility) {
    const price = Number(utility?.price) || 0;
    const index = utility?._id ? selectedUtilities.indexOf(utility._id) : -1;
    // if found remove it and update the total utility price
    if (index > -1) {
      selectedUtilitiesTotalPrice -= price;
      if (selectedUtilitiesTotalPrice < 0) selectedUtilitiesTotalPrice = 0; // prevent negative total
      selectedUtilities.splice(index, 1);
      // updateRoomDepositPriceDisplay(); // initially updated deposit here
      updateRoomDepositPriceDisplay(); // update the specific deposit display
    }
  }

  // updates the displayed room price which represents the initial deposit
  // (base rent + selected amenity costs + selected utility costs)
  function updateRoomDepositPriceDisplay() {
    // select the price display element *after* room info is rendered
    const roomPriceElement = roomInfoContainer?.querySelector(
      ".room-price .price-value" // target the specific span for the price value
    );

    // check if the element was found
    if (!roomPriceElement) {
      console.warn("room price display element not found for updating.");
      return;
    }

    // get the base rent price stored in the data attribute during initial render
    const initialRoomPrice =
      parseFloat(roomPriceElement.dataset.initialPrice) || 0;

    // calculate the total deposit price: base rent + selected amenities price + selected utilities price
    // note: this logic assumes utilities are added to the *initial* deposit shown
    // which might differ from actual monthly billing. adjust if needed.
    const newTotalDepositPrice =
      initialRoomPrice +
      selectedAmenitiesTotalPrice +
      selectedUtilitiesTotalPrice;

    // update the text content of the price element formatted as currency
    roomPriceElement.textContent = newTotalDepositPrice.toLocaleString(
      "vi-VN",
      {
        style: "currency",
        currency: "VND"
      }
    );
  }

  // --- image navigation logic ---
  // updates the visual position of the image slider based on currentimageindex
  function updateImagePosition() {
    // ensure slider container and image elements exist
    if (!imageList || imageElements.length === 0) return;
    // get the width of a single image (assuming all are the same width)
    // offsetwidth includes padding and borders if any
    const imageWidth = imageElements[0].offsetWidth;
    // define the margin between images (adjust based on css)
    const totalMargin = 20; // example: 10px margin-left + 10px margin-right
    // calculate the required translation value to show the current image
    const translateX = -currentImageIndex * (imageWidth + totalMargin);
    // apply the transform style to slide the list
    imageList.style.transform = `translateX(${translateX}px)`;

    // update the 'active' class on the image elements
    imageElements.forEach((img, index) => {
      // add 'active' to the current image remove from others
      img.classList.toggle("active", index === currentImageIndex);
    });

    // show/hide prev/next buttons based on index
    if (prevButton)
      prevButton.style.visibility =
        currentImageIndex > 0 ? "visible" : "hidden";
    if (nextButton)
      nextButton.style.visibility =
        currentImageIndex < imageElements.length - 1 ? "visible" : "hidden";
  }

  // --- main fetch and render orchestration ---
  // fetches all necessary data for the room details page and renders the ui components
  async function fetchAndRenderUiRoomDetails(roomId) {
    try {
      // show loading state perhaps? (optional)

      // fetch the main room data by id
      const room = await RoomService.getRoomById(roomId);

      // check if room data was actually found
      if (!room) {
        throw new Error(`room with id ${roomId} not found.`);
      }

      // render the core room information section
      renderRoomInfoUI(room);
      // render the room images slider asynchronously
      await renderRoomImagesUI(room);

      // fetch and render amenities and utilities associated with *this specific room*
      const amenityUtilityPromises = [];

      // handle amenities
      if (room.amenities && room.amenities.length > 0) {
        // create promises to fetch details for each amenity id associated with the room
        amenityUtilityPromises.push(
          Promise.all(
            room.amenities.map((id) => AmenityService.getAmenityById(id))
          )
            .then((detailedAmenities) => {
              // filter out any null results if an amenity fetch failed
              const validAmenities = detailedAmenities.filter(
                (a) => a !== null
              );
              renderAmenityListUI(validAmenities); // render the list with detailed data
            })
            .catch((error) => {
              // handle errors fetching amenity details
              console.error("error fetching detailed amenities:", error);
              if (amenityListContainer)
                amenityListContainer.innerHTML =
                  "<p class='text-danger text-center p-3'>lỗi tải tiện nghi.</p>";
            })
        );
      } else {
        // if room has no associated amenities display a message
        if (amenityListContainer)
          amenityListContainer.innerHTML =
            "<p class='text-muted p-3 text-center'>phòng này không có tiện nghi tùy chọn thêm.</p>";
      }

      // handle utilities
      if (room.utilities && room.utilities.length > 0) {
        // create promises to fetch details for each utility id associated with the room
        amenityUtilityPromises.push(
          Promise.all(
            room.utilities.map((id) => UtilityService.getUtilityById(id))
          )
            .then((detailedUtilities) => {
              // filter out any null results
              const validUtilities = detailedUtilities.filter(
                (u) => u !== null
              );
              renderUtilityListUI(validUtilities); // render the list
            })
            .catch((error) => {
              // handle errors fetching utility details
              console.error("error fetching detailed utilities:", error);
              if (utilityListContainer)
                utilityListContainer.innerHTML =
                  "<p class='text-danger text-center p-3'>lỗi tải tiện ích.</p>";
            })
        );
      } else {
        // if room has no associated utilities display a message
        if (utilityListContainer)
          utilityListContainer.innerHTML =
            "<p class='text-muted p-3 text-center'>phòng này không có tiện ích tùy chọn thêm.</p>";
      }

      // wait for both amenity and utility list rendering to complete (if fetches were initiated)
      await Promise.all(amenityUtilityPromises);
    } catch (error) {
      // handle errors fetching the main room data or other critical errors
      console.error("error fetching or rendering room details:", error);
      // display a prominent error message to the user
      if (roomInfoContainer)
        roomInfoContainer.innerHTML =
          // overwrite main info container
          `<p class='text-danger text-center p-5'>lỗi tải thông tin phòng (${
            error.message || "không rõ nguyên nhân"
          }).</p>`;
      // hide other sections that depend on room data
      if (imageList) imageList.innerHTML = "";
      if (amenityListContainer) amenityListContainer.innerHTML = "";
      if (utilityListContainer) utilityListContainer.innerHTML = "";
    }
  }

  // --- event listeners setup ---
  // add listener for the previous image button
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      // decrement index if not already at the first image
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateImagePosition(); // update slider visually
      }
    });
  }

  // add listener for the next image button
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      // increment index if not already at the last image
      if (currentImageIndex < imageElements.length - 1) {
        currentImageIndex++;
        updateImagePosition(); // update slider visually
      }
    });
  }

  // --- initial load ---
  // get the room id from the url when the page loads
  const roomId = getRoomIdFromUrl();
  // if a valid room id is found fetch and render the page details
  if (roomId) {
    fetchAndRenderUiRoomDetails(roomId);
  } else {
    // if no room id is found in the url display an error message
    console.error("no room id found in url.");
    if (roomInfoContainer)
      // display error in the main info area
      roomInfoContainer.innerHTML =
        "<p class='text-danger text-center p-5'>url không hợp lệ hoặc thiếu id phòng.</p>";
  }
});
