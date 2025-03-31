import RoomService from "../js/services/RoomService.js";
import AmenityService from "../js/services/AmenityService.js";
import UtilityService from "../js/services/UtilityService.js";

// --- global scope variables ---
// tracks the current page number for the rooms tab pagination
let currentPage = 1;
// stores the total number of rooms found based on the current filters for the rooms tab
let totalRooms = 0;
// defines how many room items are displayed per page on the rooms tab
const roomsPerPage = 9;
// stores the full list of room data fetched according to the current filters for the rooms tab
let currentRoomData = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- element selectors ---
  // main navigation items used for switching tabs/content sections
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  // the main content divs that correspond to each navigation item
  const contentDivs = document.querySelectorAll(".content .container > div");

  // home tab elements
  // container for displaying branch summary information (address total/vacant rooms)
  const branchContainer = document.querySelector(".branch .row");
  // container for displaying a list of featured/random rooms on the home tab
  const homeRoomListContainer = document.querySelector(
    ".room-list .room-list-container" // specific to home tab's room list
  );
  // container for displaying a list of available amenities on the home tab
  const homeAmenityListContainer = document.querySelector(
    ".amenity-list .amenity-list-container" // specific to home tab's amenity list
  );

  // rooms tab elements (filter controls and room list)
  // dropdown select for filtering rooms by status (vacant occupied etc)
  const statusFilter = document.getElementById("statusFilter");
  // range input for selecting the minimum rent price filter
  const priceRangeInput = document.getElementById("priceRange");
  // span element to display the selected minimum price value
  const minPriceSpan = document.getElementById("minPrice");
  // dropdown select for filtering rooms by address/branch
  const addressFilter = document.getElementById("addressFilter");
  // range input for selecting the minimum number of occupants filter
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  // span element to display the selected minimum occupants value
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");
  // button to trigger fetching and displaying rooms based on selected filters
  const applyFiltersButton = document.getElementById("applyFilters");
  // container specifically for displaying the filtered and paginated room list on the rooms tab
  const roomsTabRoomListContainer = document.querySelector(
    ".rooms .room-list-container" // specific container for rooms tab
  );
  // container for the pagination controls (page numbers) for the rooms tab list
  const paginationContainer = document.querySelector(".pagination");

  // amenities & utilities tab elements
  // container for displaying the full list of amenities on its dedicated tab
  const amenitiesTabAmenityListContainer = document.querySelector(
    ".amenities-utilities .amenities-container .amenity-list-container"
  );
  // container for displaying the full list of utilities on its dedicated tab
  const utilitiesTabUtilityListContainer = document.querySelector(
    ".amenities-utilities .utilities-container .utility-list-container"
  );

  // other elements
  // the login navigation item potentially used for redirection
  const loginTab = document.querySelector(".login-tab");

  // --- core functions ---

  // shows the content section associated with a target id hides others
  // also updates the visual active state of the navigation items
  function showContent(targetId) {
    // hide all main content divs first
    contentDivs.forEach((div) => (div.style.display = "none"));
    // find the target content div by its id
    const targetDiv = document.getElementById(targetId);
    // if found display it
    if (targetDiv) {
      targetDiv.style.display = "block";
    }
    // remove the active class from all navigation items
    navItems.forEach((item) => item.classList.remove("active-menu-item"));
    // find the navigation link whose data-target matches the targetid
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    // if found add the active class to its parent list item
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // shuffles the elements of an array in place using the fisher-yates algorithm
  // creates a copy to avoid modifying the original array
  function shuffleArray(array) {
    const shuffledArray = [...array]; // create a shallow copy
    // iterate backwards through the array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      // pick a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // swap the elements at indices i and j
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i]
      ];
    }
    return shuffledArray; // return the shuffled copy
  }

  // adds click event listeners to all elements with the class 'room-item'
  // clicking a room item navigates the user to the room's details page
  // uses a data attribute to prevent adding multiple listeners to the same element
  function addRoomClickListeners() {
    // select all room items currently present in the dom across any container
    const roomItems = document.querySelectorAll(".room-item");
    roomItems.forEach((roomItem) => {
      // check if a listener has already been added using a custom attribute
      if (!roomItem.hasAttribute("data-listener-added")) {
        roomItem.addEventListener("click", () => {
          // get the room id stored in the element's dataset
          const roomId = roomItem.dataset.id;
          // redirect the browser to the client-side room details page
          // ensure roomid is present
          window.location.href = `/client/room/details/${roomId}`;
        });
        // mark the element as having a listener attached
        roomItem.setAttribute("data-listener-added", "true");
      }
    });
  }

  // --- ui creation functions (shared by multiple tabs) ---

  // creates a dom element representing a single room item (card view)
  // includes room image basic info price status etc
  // fetches the primary image for the room asynchronously
  async function createRoomItem(room) {
    const roomItem = document.createElement("div");
    roomItem.classList.add("room-item"); // base class for styling
    roomItem.dataset.id = room._id; // store room id for click events

    // set default image source and attempt to load the first image from the room data
    let imageSrc = "../../assets/logo_error.png"; // fallback image
    if (room.images && room.images.length > 0) {
      try {
        // fetch image data by id
        const imageData = await RoomService.getRoomImageById(room.images[0]);
        // convert binary data to base64 string
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        // create data url
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        // log error if image fetch fails use fallback
        console.error(`error loading image for room ${room._id}:`, error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    // determine status text and corresponding css class
    let statusText = "không có sẵn";
    let statusClass = "status-unavailable";
    if (room.status === "vacant") {
      statusText = "trống";
      statusClass = "status-vacant";
    } else if (room.status === "occupied") {
      statusText = "đã thuê";
      statusClass = "status-occupied";
    }

    // populate the inner html of the room item element using template literals
    roomItem.innerHTML = `
      <img src="${imageSrc}" alt="${
      room.name || "room image" // use room name for alt text if available
    }" class="room-image">
      <div class="room-info">
        <h3 class="room-name">phòng ${room.roomNumber || "n/a"}</h3>
        <p class="room-address">
          <span class="address-label">địa chỉ:</span>
          <span class="address-value">${room.address || "n/a"}</span>
        </p>
        <p class="room-price">
          <span class="price-label">giá:</span>
          <span class="price-value">${
            room.rentPrice
              ? room.rentPrice.toLocaleString("vi-VN", {
                  // format price as currency
                  style: "currency",
                  currency: "VND"
                })
              : "n/a"
          }</span>
        </p>
        <p class="room-occupant-number">
          <span class="occupant-number-label">số người ở:</span>
          <span class="occupant-number-value">${
            room.occupantsNumber || "n/a"
          }</span>
        </p>
        <p class="room-status">
          <span class="status-label">trạng thái:</span>
          <span class="status-value ${statusClass}">${statusText}</span>
        </p>
      </div>
    `;
    return roomItem; // return the created dom element
  }

  // creates a dom element representing a single amenity item
  // includes amenity image name price and note
  // fetches the primary image for the amenity asynchronously
  async function createAmenityItem(amenity) {
    const amenityItem = document.createElement("div");
    amenityItem.classList.add("amenity-item"); // base class for styling

    // set default image and attempt to load the first amenity image
    let imageSrc = "../../assets/logo_error.png"; // fallback image
    if (amenity.images && amenity.images.length > 0) {
      try {
        // fetch amenity image data by id
        const imageData = await AmenityService.getAmenityImageById(
          amenity.images[0]
        );
        // convert to base64
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        // create data url
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        // log error use fallback
        console.error(`error loading image for amenity ${amenity._id}:`, error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    // map internal amenity names to user-friendly vietnamese names
    const amenityNameMap = {
      bed: "giường",
      refrigerator: "tủ lạnh",
      air_conditioner: "máy lạnh",
      water_heater: "vòi nước nóng",
      table_and_chairs: "bàn ghế",
      electric_stove: "bếp điện",
      gas_stove: "bếp ga"
    };
    // get the display name using the map or fallback to the internal name or default
    const amenityName =
      amenityNameMap[amenity.name] || amenity.name || "tiện nghi";

    // populate the inner html for the amenity item
    amenityItem.innerHTML = `
      <img src="${imageSrc}" alt="${amenityName}" class="amenity-image">
      <div class="amenity-info">
        <h3 class="amenity-name">${amenityName}</h3>
        <p class="amenity-price">
          <span class="price-label">giá:</span>
          <span class="price-value">${
            amenity.price
              ? amenity.price.toLocaleString("vi-VN", {
                  // format price
                  style: "currency",
                  currency: "VND"
                })
              : "n/a"
          } / phòng</span>
        </p>
        <p class="amenity-note" style="font-style: italic; font-weight: bold">(cộng vào tiền cọc)</p>
      </div>
    `;
    return amenityItem; // return the created element
  }

  // creates a dom element representing a single utility item
  // includes utility image name price unit and note
  // fetches the primary image for the utility asynchronously
  async function createUtilityItem(utility) {
    const utilityItem = document.createElement("div");
    utilityItem.classList.add("utility-item"); // base class for styling

    // set default image and attempt to load the first utility image
    let imageSrc = "../../assets/logo_error.png"; // fallback image
    if (utility.images && utility.images.length > 0) {
      try {
        // fetch utility image data
        const imageData = await UtilityService.getUtilityImageById(
          utility.images[0]
        );
        // convert to base64
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        // create data url
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        // log error use fallback
        console.error(`error loading image for utility ${utility._id}:`, error);
        imageSrc = "../../assets/logo_error.png";
      }
    }

    // map internal utility names to vietnamese
    const utilityNameMap = {
      wifi: "wifi",
      parking: "đỗ xe",
      cleaning: "vệ sinh hàng tuần"
    };
    // get display name using map or fallback
    const utilityName =
      utilityNameMap[utility.name] || utility.name || "tiện ích";
    // determine the pricing unit based on utility type
    const priceUnit = utility.name === "parking" ? "xe" : "phòng";

    // populate the inner html for the utility item
    utilityItem.innerHTML = `
      <img src="${imageSrc}" alt="${utilityName}" class="utility-image">
      <div class="utility-info">
        <h3 class="utility-name">${utilityName}</h3>
        <p class="utility-price">
          <span class="price-label">giá:</span>
          <span class="price-value">${
            utility.price
              ? utility.price.toLocaleString("vi-VN", {
                  // format price
                  style: "currency",
                  currency: "VND"
                })
              : "n/a"
          } / ${priceUnit}</span> <!-- include price unit -->
        </p>
        <p class="utility-note" style="font-style: italic;">(trả phí hàng tháng)</p>
      </div>
    `;
    return utilityItem; // return the created element
  }

  // --- home tab: fetch and render ---

  // fetches and renders all necessary ui elements for the home tab
  // includes branches featured rooms and available amenities
  async function fetchAndRenderUiForHomeTab() {
    // fetch rooms for branch and room list sections
    try {
      const rooms = await RoomService.getAllRooms({}); // fetch all rooms initially
      // render branch summary based on all rooms
      renderBranchUIHomeTab(rooms);
      // render a limited number of random rooms
      await renderRoomListUIHomeTab(rooms, 10); // wait for items to be created
    } catch (error) {
      console.error("error fetching/rendering rooms for home tab:", error);
      // potentially display an error message in the respective containers
      if (branchContainer)
        branchContainer.innerHTML =
          "<p class='text-danger text-center'>lỗi tải thông tin chi nhánh.</p>";
      if (homeRoomListContainer)
        homeRoomListContainer.innerHTML =
          "<p class='text-danger text-center'>lỗi tải danh sách phòng.</p>";
    }

    // fetch amenities for the amenity list section
    try {
      const amenities = await AmenityService.getAllAmenities();
      // render the list of amenities
      await renderAmenityListUIHomeTab(amenities);
    } catch (error) {
      console.error("error fetching/rendering amenities for home tab:", error);
      if (homeAmenityListContainer)
        homeAmenityListContainer.innerHTML =
          "<p class='text-danger text-center'>lỗi tải danh sách tiện nghi.</p>";
    }
  }

  // --- home tab: ui rendering functions ---

  // renders the branch summary section based on room data
  // groups rooms by address and displays counts
  function renderBranchUIHomeTab(rooms) {
    // ensure the container exists
    if (!branchContainer) return;
    // clear previous content
    branchContainer.innerHTML = "";

    // helper function to create a single branch item element
    function createBranchItem(address, total, vacant) {
      const roomDiv = document.createElement("div");
      roomDiv.classList.add("col-md-6"); // use bootstrap grid column
      roomDiv.innerHTML = `
        <div class="branch-item">
          <p class="branch-address">📍 ${address}</p> <!-- add icon -->
          <p class="branch-info-total">tổng số phòng: ${total}</p>
          <p class="branch-info-vaccant">số phòng trống: ${vacant}</p>
        </div>
      `;
      return roomDiv;
    }

    // get all unique addresses from the room data
    const allAddresses = rooms.map((room) => room.address).filter(Boolean); // filter out falsy addresses
    const uniqueAddresses = [...new Set(allAddresses)];

    // iterate over unique addresses create and append a branch item for each
    uniqueAddresses.forEach((address) => {
      // filter rooms belonging to the current address
      const roomsFilteredByAddress = rooms.filter(
        (room) => room.address?.includes(address) // use optional chaining for safety
      );
      // count total rooms at this address
      const totalRoomsAtAddress = roomsFilteredByAddress.length;
      // count vacant rooms at this address
      const vacantRoomsAtAddress = roomsFilteredByAddress.filter(
        (r) => r.status === "vacant"
      ).length;
      // create the branch item element and append it
      branchContainer.appendChild(
        createBranchItem(address, totalRoomsAtAddress, vacantRoomsAtAddress)
      );
    });
  }

  // renders a list of room items in the home tab's room list container
  // optionally shuffles and limits the number of rooms displayed
  async function renderRoomListUIHomeTab(rooms, numberOfRandomRooms = 0) {
    // ensure the container exists
    if (!homeRoomListContainer) return;
    // clear previous content
    homeRoomListContainer.innerHTML = "";

    let roomsToShow = rooms;
    // if a specific number of random rooms is requested
    if (numberOfRandomRooms > 0) {
      // shuffle the array
      const shuffledRooms = shuffleArray(rooms);
      // determine how many to actually show (min of requested number and available rooms)
      const actualNumberOfRandom = Math.min(
        numberOfRandomRooms,
        shuffledRooms.length
      );
      // slice the shuffled array to get the random subset
      roomsToShow = shuffledRooms.slice(0, actualNumberOfRandom);
    }

    // create promises for generating each room item element
    const itemsPromises = roomsToShow.map((room) => createRoomItem(room));

    try {
      // wait for all room item elements to be created (including image fetches)
      const createdItems = await Promise.all(itemsPromises);

      // use a document fragment for efficient dom appending
      const fragment = document.createDocumentFragment();
      createdItems.forEach((item) => {
        fragment.appendChild(item);
      });
      // append all created items at once
      homeRoomListContainer.appendChild(fragment);

      // add click listeners to the newly added room items
      addRoomClickListeners();
    } catch (error) {
      // handle errors during item creation or appending
      console.error("error rendering room list for home tab:", error);
      homeRoomListContainer.innerHTML =
        "<p class='text-danger text-center'>đã xảy ra lỗi khi tải danh sách phòng.</p>";
    }
  }

  // renders the list of amenity items in the home tab's amenity list container
  async function renderAmenityListUIHomeTab(amenities) {
    // ensure container exists
    if (!homeAmenityListContainer) return;
    // clear previous content
    homeAmenityListContainer.innerHTML = "";

    // handle case where there are no amenities
    if (!amenities || amenities.length === 0) {
      homeAmenityListContainer.innerHTML =
        "<p class='text-muted text-center'>không có tiện nghi nào được liệt kê.</p>";
      return;
    }

    try {
      // create promises for generating each amenity item element
      const itemPromises = amenities.map(
        (amenity) => createAmenityItem(amenity) // reuse the shared creation function
      );
      // wait for all elements to be created (including image fetches)
      const items = await Promise.all(itemPromises);
      // use a document fragment for performance
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      // append all items at once
      homeAmenityListContainer.appendChild(fragment);
    } catch (error) {
      // handle errors during rendering
      console.error("error rendering amenity list for home tab:", error);
      homeAmenityListContainer.innerHTML = `
        <p class="error-message text-danger text-center">
          lỗi tải tiện nghi
        </p>
      `;
    }
  }

  // --- rooms tab: fetch and render ---

  // fetches unique addresses from all rooms and populates the address filter dropdown
  async function populateAddressFilter() {
    // ensure the filter element exists
    if (!addressFilter) return;

    // clear existing options except the default "all" option
    while (addressFilter.options.length > 1) {
      addressFilter.remove(1);
    }

    try {
      // fetch all rooms without filters to get all possible addresses
      const allRooms = await RoomService.getAllRooms({});
      // extract addresses filter out any falsy values
      const allAddresses = allRooms.map((room) => room.address).filter(Boolean);
      // get unique addresses
      const uniqueAddresses = [...new Set(allAddresses)];
      // create and append an option element for each unique address
      uniqueAddresses.forEach((addr) => {
        const option = document.createElement("option");
        option.value = addr;
        option.textContent = addr;
        addressFilter.appendChild(option);
      });
    } catch (error) {
      // log error and potentially inform user
      console.error("error populating address filter:", error);
      const errorOption = document.createElement("option");
      errorOption.textContent = "lỗi tải địa chỉ";
      errorOption.disabled = true;
      addressFilter.appendChild(errorOption);
    }
  }

  // fetches room data based on the current filter settings in the rooms tab
  // updates global state (currentroomdata totalrooms) and renders the room list ui
  async function fetchAndRenderUiForRoomsTab() {
    // display loading message in the room list container
    if (roomsTabRoomListContainer)
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 p-5"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> đang tải dữ liệu phòng...</div>';
    // clear pagination while loading
    if (paginationContainer) paginationContainer.innerHTML = "";

    try {
      // --- get filter values ---
      // read values from the filter controls in the rooms tab
      const status = statusFilter?.value || "all";
      const minPrice = priceRangeInput?.value || "0";
      const maxPrice = priceRangeInput?.getAttribute("max") || "5000000"; // use a sensible default max if attribute missing
      const address = addressFilter?.value || "all";
      const minOccupant = occupantNumberRangeInput?.value || "0";
      const maxOccupant = occupantNumberRangeInput?.getAttribute("max") || "5"; // use a sensible default max

      // --- build filter object ---
      // construct the filter object to send to the api
      const filter = {};
      if (status !== "all") filter.status = status;
      // include price range only if min price is above 0
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice;
      }
      if (address !== "all") filter.address = address;
      // include occupants range only if min occupants is above 0
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant;
      }

      // --- fetch rooms ---
      // call the service with the constructed filter
      const rooms = await RoomService.getAllRooms(filter);
      // update global state with the fetched data
      currentRoomData = rooms;
      totalRooms = rooms.length;

      // render the first page of the results
      await renderRoomListUIRoomsTab(); // call the async rendering function
    } catch (error) {
      // handle errors during fetch
      console.error("error fetching rooms for rooms tab:", error);
      if (roomsTabRoomListContainer)
        roomsTabRoomListContainer.innerHTML =
          '<div class="text-center w-100 text-danger p-3">lỗi khi tải dữ liệu. vui lòng thử lại.</div>';
    }
  }

  // --- rooms tab: ui rendering functions ---

  // renders the list of room items for the current page in the rooms tab container
  // also renders pagination controls
  async function renderRoomListUIRoomsTab() {
    // ensure the container exists
    if (!roomsTabRoomListContainer) return;
    // clear previous content
    roomsTabRoomListContainer.innerHTML = "";

    // basic validation of the global room data
    if (!Array.isArray(currentRoomData)) {
      console.error(
        "renderroomlistuiroomstab error: currentroomdata is not an array",
        currentRoomData
      );
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 error-message text-danger">lỗi: dữ liệu phòng không hợp lệ.</div>';
      renderPaginationUI(); // render empty pagination
      return;
    }

    // handle case where no rooms match the filter
    if (currentRoomData.length === 0) {
      roomsTabRoomListContainer.innerHTML =
        '<div class="text-center w-100 p-3">không tìm thấy phòng nào phù hợp với bộ lọc của bạn.</div>';
      renderPaginationUI(); // render empty pagination
      return;
    }

    try {
      // calculate start and end indices for the current page
      const startIndex = (currentPage - 1) * roomsPerPage;
      const endIndex = Math.min(
        startIndex + roomsPerPage,
        currentRoomData.length // use actual length of data
      );
      // get the subset of rooms for the current page
      const roomsToDisplay = currentRoomData.slice(startIndex, endIndex);

      // handle case where the current page might be empty (eg after deleting items on the last page)
      if (roomsToDisplay.length === 0 && currentPage > 1) {
        // maybe reset to page 1 or show a message? showing message for now.
        console.warn(
          `no rooms found on page ${currentPage}, total rooms: ${totalRooms}`
        );
        roomsTabRoomListContainer.innerHTML = `<div class="text-center w-100 p-3">không có phòng nào trên trang ${currentPage}.</div>`;
        renderPaginationUI(); // render pagination based on totalrooms
        return;
      }

      // create promises for generating each room item element
      const itemPromises = roomsToDisplay.map((room) => createRoomItem(room));
      // wait for all elements to be created (including image fetches)
      const items = await Promise.all(itemPromises);

      // use a document fragment and bootstrap grid for layout
      const fragment = document.createDocumentFragment();
      let currentRow = null;

      items.forEach((roomItem, index) => {
        // create a new bootstrap row every 3 items (for 3 columns layout)
        if (index % 3 === 0) {
          currentRow = document.createElement("div");
          currentRow.classList.add("row", "mb-4"); // add bottom margin to rows
          fragment.appendChild(currentRow);
        }

        // create a bootstrap column wrapper for each room item
        const colDiv = document.createElement("div");
        colDiv.classList.add(
          "col-lg-4", // large screens: 3 columns
          "col-md-6", // medium screens: 2 columns
          "col-12", // small screens: 1 column
          "d-flex", // use flexbox for alignment if needed
          "justify-content-center", // center item within column on smaller screens
          "mb-3" // add some margin bottom to columns
        );
        colDiv.appendChild(roomItem); // add the room item card to the column

        // append the column to the current row
        // !important: ensure currentRow is defined before appending
        if (currentRow) {
          currentRow.appendChild(colDiv);
        } else {
          // fallback if somehow currentRow isn't created (shouldn't happen with index % 3 === 0 check)
          console.error("currentrow not defined when creating room grid");
          fragment.appendChild(colDiv); // append directly to fragment as a fallback
        }
      });

      // append the completed fragment (containing rows and columns) to the container
      roomsTabRoomListContainer.appendChild(fragment);

      // render pagination controls based on total rooms
      renderPaginationUI();
      // add click listeners to the newly rendered room items
      addRoomClickListeners();
    } catch (error) {
      // handle errors during the rendering process
      console.error("error rendering room list for rooms tab:", error);
      roomsTabRoomListContainer.innerHTML = `
        <div class="text-center w-100 error-message text-danger p-3">
            đã xảy ra lỗi khi hiển thị danh sách phòng.
        </div>
      `;
      renderPaginationUI(); // still try to render pagination controls
    }
  }

  // renders the pagination controls ui based on global totalrooms and roomsperpage
  function renderPaginationUI() {
    // ensure container exists
    if (!paginationContainer) return;
    // clear previous controls
    paginationContainer.innerHTML = "";

    // calculate total pages needed
    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    // dont render if only one page or less
    if (totalPages <= 1) return;

    // create page number links
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      // add 'active' class if this is the current page
      if (i === currentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#"; // prevent page reload
      pageNumberLink.textContent = i; // display page number

      // add click listener to handle page changes
      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault(); // stop default link behavior
        // if clicked page is different from current page
        if (i !== currentPage) {
          currentPage = i; // update global current page
          renderRoomListUIRoomsTab(); // re-render the room list for the new page
          // optionally scroll to top of list after page change
          roomsTabRoomListContainer?.scrollIntoView({ behavior: "smooth" });
        }
      });

      // append link to list item and list item to container
      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- amenities & utilities tab: fetch and render ---

  // fetches and renders the lists for the dedicated amenities and utilities tab
  async function fetchAndRenderUiForAmenitiesAndUtilitiesTab() {
    // fetch and render amenities list
    try {
      const amenities = await AmenityService.getAllAmenities();
      await renderAmenityListUIAmenitiesAndUtilitiesTab(amenities);
    } catch (error) {
      console.error("error fetching/rendering amenities tab:", error);
      if (amenitiesTabAmenityListContainer)
        amenitiesTabAmenityListContainer.innerHTML =
          "<p class='text-danger text-center p-3'>lỗi tải tiện nghi.</p>";
    }

    // fetch and render utilities list
    try {
      const utilities = await UtilityService.getAllUtilities();
      await renderUtilityListUIAmenitiesAndUtilitiesTab(utilities);
    } catch (error) {
      console.error("error fetching/rendering utilities tab:", error);
      if (utilitiesTabUtilityListContainer)
        utilitiesTabUtilityListContainer.innerHTML =
          "<p class='text-danger text-center p-3'>lỗi tải tiện ích.</p>";
    }
  }

  // --- amenities & utilities tab: ui rendering functions ---
  // renders the list of amenity items specifically for the amenities & utilities tab
  async function renderAmenityListUIAmenitiesAndUtilitiesTab(amenities) {
    // ensure container exists
    if (!amenitiesTabAmenityListContainer) return;
    // clear previous content
    amenitiesTabAmenityListContainer.innerHTML = "";

    // handle no amenities case
    if (!amenities || amenities.length === 0) {
      amenitiesTabAmenityListContainer.innerHTML =
        "<p class='text-muted text-center p-3'>không có tiện nghi nào được liệt kê.</p>";
      return;
    }

    try {
      // create item elements asynchronously
      const itemPromises = amenities.map(
        (amenity) => createAmenityItem(amenity) // reuse the shared function
      );
      const items = await Promise.all(itemPromises);
      // use fragment for appending
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      amenitiesTabAmenityListContainer.appendChild(fragment);
    } catch (error) {
      // handle rendering errors
      console.error("error rendering amenity list for amenities tab:", error);
      amenitiesTabAmenityListContainer.innerHTML = `
        <p class="error-message text-danger text-center p-3">
          lỗi tải tiện nghi
        </p>
      `;
    }
  }

  // renders the list of utility items specifically for the amenities & utilities tab
  async function renderUtilityListUIAmenitiesAndUtilitiesTab(utilities) {
    // ensure container exists
    if (!utilitiesTabUtilityListContainer) return;
    // clear previous content
    utilitiesTabUtilityListContainer.innerHTML = "";

    // handle no utilities case
    if (!utilities || utilities.length === 0) {
      utilitiesTabUtilityListContainer.innerHTML =
        "<p class='text-muted text-center p-3'>không có tiện ích nào được liệt kê.</p>";
      return;
    }

    try {
      // create item elements asynchronously
      const itemPromises = utilities.map(
        (utility) => createUtilityItem(utility) // reuse the shared function
      );
      const items = await Promise.all(itemPromises);
      // use fragment for appending
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        fragment.appendChild(item);
      });
      utilitiesTabUtilityListContainer.appendChild(fragment);
    } catch (error) {
      // handle rendering errors
      console.error("error rendering utility list for utilities tab:", error);
      utilitiesTabUtilityListContainer.innerHTML = `
        <p class="error-message text-danger text-center p-3">
          lỗi tải tiện ích
        </p>
      `;
    }
  }

  // --- event listeners setup ---

  // navigation item clicks
  // add listeners to main nav items to switch content views
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a"); // find the link within the nav item
    if (link) {
      // ensure link exists
      link.addEventListener("click", function (event) {
        event.preventDefault(); // prevent default link navigation
        const targetId = link.dataset.target; // get target content id from data attribute
        if (targetId) {
          showContent(targetId); // switch to the target content section
        }
      });
    }
  });

  // rooms tab: apply filters button
  // add listener to the filter button on the rooms tab
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      currentPage = 1; // reset to page 1 when filters change
      fetchAndRenderUiForRoomsTab(); // fetch and display results with new filters
    });
  }

  // rooms tab: price range input
  // update the displayed minimum price as the slider moves
  if (priceRangeInput && minPriceSpan) {
    priceRangeInput.addEventListener("input", () => {
      // format the value as vietnamese currency
      minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
        "vi-VN"
      );
    });
    // set initial display value on load
    minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
      "vi-VN"
    );
  }

  // rooms tab: occupant range input
  // update the displayed minimum occupants as the slider moves
  if (occupantNumberRangeInput && minOccupantNumberSpan) {
    occupantNumberRangeInput.addEventListener("input", () => {
      // display the raw number value
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    // set initial display value on load
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  }

  // login tab click
  // add listener to the login tab/button to redirect to the login page
  if (loginTab) {
    loginTab.addEventListener("click", (event) => {
      event.preventDefault(); // prevent default if it's a link
      window.location.href = `/login`; // redirect to the login route
    });
  }

  // --- initial load ---
  // functions to run when the dom is fully loaded
  fetchAndRenderUiForHomeTab(); // load content for the default home tab
  populateAddressFilter(); // populate address filter dropdown for rooms tab
  fetchAndRenderUiForRoomsTab(); // load initial (unfiltered) rooms for the rooms tab
  fetchAndRenderUiForAmenitiesAndUtilitiesTab(); // load content for the amenities/utilities tab

  showContent("home"); // explicitly show the home tab content initially
});
