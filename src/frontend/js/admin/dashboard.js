import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- global scope variables ---
// the current page number for pagination
let currentPage = 1;
// the total number of rooms fetched based on filters
let totalRooms = 0;
// the number of rooms to display per page
const roomsPerPage = 10;
// stores the full dataset of rooms fetched for the current filter
let currentRoomData = [];
// stores the file objects selected for a new room
let selectedImageFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  // --- element selectors ---

  // general navigation and content areas
  // all navigation items in the main navbar
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");
  // all main content divs that correspond to nav items
  const contentDivs = document.querySelectorAll(".content .container > div");

  // rooms tab elements
  // the table body for displaying rooms
  const roomTableBody = document.getElementById("roomTableBody");
  // the container for pagination controls
  const paginationContainer = document.querySelector(".pagination");
  // the dropdown for filtering by room status
  const statusFilterSelect = document.getElementById("statusFilter");
  // the range input for filtering by minimum price
  const priceRangeInput = document.getElementById("priceRange");
  // displays the selected minimum price
  const minPriceSpan = document.getElementById("minPrice");
  // displays the maximum price (potentially dynamic) - only needed if dynamically changing max display
  const maxPriceSpan = document.getElementById("maxPrice");
  // the dropdown for filtering by address
  const addressFilterSelect = document.getElementById("addressFilter");
  // the range input for filtering by minimum occupants
  const occupantNumberRangeInput = document.getElementById(
    "occupantNumberRange"
  );
  // displays the selected minimum occupants
  const minOccupantNumberSpan = document.getElementById("minOccupantNumber");
  // displays the maximum occupants (potentially dynamic) - only needed if dynamically changing max display
  const maxOccupantNumberSpan = document.getElementById("maxOccupantNumber");
  // the button to apply selected filters
  const applyFiltersButton = document.getElementById("applyFilters");
  // the button to open the add new room modal - added selector
  const addNewRoomButton = document.getElementById("addNewRoomBtn");

  // add new room modal elements
  // the modal element itself
  const addNewRoomModalElement = document.getElementById("addNewRoomModal");
  // the form for adding a new room
  const addRoomForm = document.getElementById("addRoomForm");
  // input for the new room number
  const newRoomNumberInput = document.getElementById("newRoomNumber");
  // select dropdown for the new room address
  const newRoomAddressInput = document.getElementById("newRoomAddress");
  // input for the new room rent price
  const newRoomRentPriceInput = document.getElementById("newRoomRentPrice");
  // input for the new room maximum occupants
  const newRoomOccupantsNumberInput = document.getElementById(
    "newRoomOccupantsNumber"
  );
  // select dropdown for the new room status
  const newRoomStatusSelect = document.getElementById("newRoomStatus");
  // textarea for the new room description
  const newRoomDescriptionInput = document.getElementById("newRoomDescription");
  // container for the list of available amenities
  const newRoomAmenitiesListDiv = document.getElementById(
    "newRoomAmenitiesList"
  );
  // container for the list of available utilities
  const newRoomUtilitiesListDiv = document.getElementById(
    "newRoomUtilitiesList"
  );
  // hidden file input for selecting room images
  const newRoomImagesInput = document.getElementById("newRoomImagesInput");
  // button to trigger the hidden file input
  const selectRoomImagesBtn = document.getElementById("selectRoomImagesBtn");
  // container to display previews of selected images
  const newRoomImagePreviewDiv = document.getElementById("newRoomImagePreview");
  // button to save the new room data
  const saveNewRoomBtn = document.getElementById("saveNewRoomBtn");
  // div to display feedback messages within the modal
  const addRoomModalFeedbackDiv = document.getElementById(
    "addRoomModalFeedback"
  );
  // the spinner element inside the save button
  const saveNewRoomSpinner = saveNewRoomBtn?.querySelector(".spinner-border");

  // initialize bootstrap modal instance (do this once)
  // instance of the bootstrap modal for adding rooms
  const addNewRoomModal = addNewRoomModalElement
    ? new bootstrap.Modal(addNewRoomModalElement)
    : null;

  // others tab elements
  // (selectors for other tabs would go here if they existed)

  // --- core functions ---

  // shows the content div corresponding to the selected navigation item
  // hides all other content divs and updates the active state in the navbar
  function showContent(targetId) {
    // hide all content divs
    contentDivs.forEach((div) => (div.style.display = "none"));

    // show the target div
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    }

    // remove 'active-menu-item' class from all nav items
    navItems.forEach((item) => item.classList.remove("active-menu-item"));

    // add 'active-menu-item' class to the selected nav item
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // displays a feedback message within a modal typically the add room modal
  function showModalFeedback(message, type = "danger") {
    if (addRoomModalFeedbackDiv) {
      addRoomModalFeedbackDiv.textContent = message;
      addRoomModalFeedbackDiv.className = `alert alert-${type} mt-3`;
      addRoomModalFeedbackDiv.style.display = "block";
      // scroll the feedback into view smoothly
      addRoomModalFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // hides the feedback message area within the modal
  function hideModalFeedback() {
    if (addRoomModalFeedbackDiv) {
      addRoomModalFeedbackDiv.style.display = "none";
      addRoomModalFeedbackDiv.textContent = "";
      addRoomModalFeedbackDiv.className = "alert"; // reset class
    }
  }

  // --- rooms tab: fetch and render ---

  // fetches all unique room addresses and populates the address filter dropdown
  async function populateAddressFilter() {
    // check if the address filter element exists
    if (!addressFilterSelect) return;

    // clear existing options except the default 'all' option
    while (addressFilterSelect.options.length > 1) {
      addressFilterSelect.remove(1);
    }

    try {
      // fetch all rooms without any specific filter to get all addresses
      const allRooms = await RoomService.getAllRooms({});
      // extract addresses filter out any null or empty values
      const allAddresses = allRooms.map((room) => room.address).filter(Boolean);
      // get unique addresses using a set
      const uniqueAddresses = [...new Set(allAddresses)];
      // create and append option elements for each unique address
      uniqueAddresses.forEach((addr) => {
        const option = document.createElement("option");
        option.value = addr;
        option.textContent = addr;
        addressFilterSelect.appendChild(option);
      });
    } catch (error) {
      // log errors during the fetch or population process
      console.error(error);
      // optionally display an error message to the user in the dropdown
      const errorOption = document.createElement("option");
      errorOption.textContent = "lỗi tải địa chỉ";
      errorOption.disabled = true;
      addressFilterSelect.appendChild(errorOption);
    }
  }

  // fetches room data based on current filter settings and renders the room table ui
  // updates global variables totalrooms and currentroomdata
  async function fetchAndRenderUiForRoomsTab() {
    // display loading state in the table body
    if (roomTableBody) {
      roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center">đang tải dữ liệu...</td></tr>`; // adjusted colspan to 7
    }
    // clear pagination while loading
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }

    try {
      // --- get filter values ---
      // retrieve values from the filter input elements using the selectors defined earlier
      const status = statusFilterSelect ? statusFilterSelect.value : "all";
      const minPrice = priceRangeInput ? priceRangeInput.value : "0";
      const maxPrice = priceRangeInput
        ? priceRangeInput.getAttribute("max")
        : "5000000"; // get max from attribute or use a default
      const address = addressFilterSelect ? addressFilterSelect.value : "all";
      const minOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.value
        : "0";
      const maxOccupant = occupantNumberRangeInput
        ? occupantNumberRangeInput.getAttribute("max")
        : "5"; // get max from attribute or use a default

      // --- build filter object ---
      // construct the filter object to pass to the api based on selected values
      const filter = {};
      if (status !== "all") filter.status = status;
      // only include price filter if minprice is greater than 0
      if (Number(minPrice) > 0) {
        filter.minRentPrice = minPrice;
        filter.maxRentPrice = maxPrice; // include max price
      }
      if (address !== "all") filter.address = address;
      // only include occupant filter if minoccupant is greater than 0
      if (Number(minOccupant) > 0) {
        filter.minOccupantsNumber = minOccupant;
        filter.maxOccupantsNumber = maxOccupant; // include max occupants
      }

      // --- fetch rooms with filter ---
      // call the room service to get rooms matching the filter criteria
      const rooms = await RoomService.getAllRooms(filter);
      currentRoomData = rooms; // store the fetched data globally
      totalRooms = rooms.length; // update the total room count based on the filtered result

      // render the first page of the table using the fetched data
      renderRoomTableUIRoomsTab(); // this function uses the global currentroomdata
    } catch (error) {
      // handle errors during the fetch process
      console.error(error);
      // display an error message in the table body
      if (roomTableBody) {
        roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">lỗi khi tải dữ liệu.</td></tr>`; // adjusted colspan
      }
    }
  }

  // --- rooms tab: ui rendering functions ---

  // renders the rows of the room table based on the current page and currentroomdata
  // also calls renderpaginationui
  function renderRoomTableUIRoomsTab() {
    // ensure the table body element exists
    if (!roomTableBody) return;
    // clear previous table rows
    roomTableBody.innerHTML = "";

    // handle case where no rooms match the filters
    if (currentRoomData.length === 0) {
      roomTableBody.innerHTML = `<tr><td colspan="7" class="text-center">không tìm thấy phòng nào phù hợp.</td></tr>`; // adjusted colspan
      renderPaginationUI(); // still render pagination controls even if empty
      return;
    }

    // calculate the start and end indices for the rooms to display on the current page
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = Math.min(startIndex + roomsPerPage, totalRooms); // use totalrooms for the upper bound
    // slice the global room data to get only the rooms for the current page
    const roomsToDisplay = currentRoomData.slice(startIndex, endIndex);

    // create table rows for each room on the current page
    roomsToDisplay.forEach((room, index) => {
      const row = document.createElement("tr");
      row.dataset.id = room._id; // add data-id attribute for identifying the room

      // --- determine status text and class ---
      let statusText = "không xác định";
      let statusClass = "status-unavailable"; // default class
      if (room.status === "vacant") {
        statusText = "trống";
        statusClass = "status-vacant";
      } else if (room.status === "occupied") {
        statusText = "đã thuê";
        statusClass = "status-occupied";
      } else if (room.status === "unavailable") {
        statusText = "không có sẵn";
        statusClass = "status-unavailable";
      }

      // --- populate row html ---
      // use template literals for cleaner html generation
      // format currency using tolocalestring
      // add action cell with delete button
      row.innerHTML = `
        <td>${startIndex + index + 1}</td> <!-- sequential numbering -->
        <td>${room.roomNumber || "n/a"}</td>
        <td>${room.address || "n/a"}</td>
        <td class="text-end">${
          room.rentPrice
            ? room.rentPrice.toLocaleString("vi-VN") // format price
            : "n/a"
        }</td>
        <td class="text-center">${room.occupantsNumber || "n/a"}</td>
        <td class="text-center">
            <span class="${statusClass}">${statusText}</span>
        </td>
        <td class="text-center action-cell"> <!-- added action cell -->
             <button class="btn btn-sm btn-danger delete-room-btn" data-id="${
               room._id
             }">xóa</button>
        </td>
      `;

      // add click listener to the entire row for navigation to details page
      row.addEventListener("click", (event) => {
        // prevent navigation if the click originated within the action cell eg on the delete button
        if (event.target.closest(".action-cell")) {
          return; // do nothing if the click is on an action button
        }
        // navigate to the room details page
        window.location.href = `/admin/room/details/${room._id}`;
      });

      // append the created row to the table body
      roomTableBody.appendChild(row);
    });

    // render pagination controls after the table rows have been added
    renderPaginationUI();
  }

  // renders the pagination controls based on totalrooms and roomsperpage
  function renderPaginationUI() {
    // ensure the pagination container element exists
    if (!paginationContainer) return;
    // clear previous pagination links
    paginationContainer.innerHTML = "";

    // calculate the total number of pages needed
    const totalPages = Math.ceil(totalRooms / roomsPerPage);

    // if there's only one page or no pages dont render pagination
    if (totalPages <= 1) {
      return;
    }

    // create page number links (list items with anchor tags)
    for (let i = 1; i <= totalPages; i++) {
      const pageNumberItem = document.createElement("li");
      pageNumberItem.classList.add("page-item");
      // add 'active' class to the current page's list item
      if (i === currentPage) {
        pageNumberItem.classList.add("active");
      }

      const pageNumberLink = document.createElement("a");
      pageNumberLink.classList.add("page-link");
      pageNumberLink.href = "#"; // use href="#" to prevent page reload
      pageNumberLink.textContent = i; // display the page number

      // add event listener to handle page clicks
      pageNumberLink.addEventListener("click", (event) => {
        event.preventDefault(); // prevent the default anchor tag behavior
        // if the clicked page is different from the current page
        if (i !== currentPage) {
          currentPage = i; // update the global current page variable
          renderRoomTableUIRoomsTab(); // re-render the table for the new page
        }
      });

      // append the link to the list item and the list item to the container
      pageNumberItem.appendChild(pageNumberLink);
      paginationContainer.appendChild(pageNumberItem);
    }
  }

  // --- delete room function ---
  // handles the process of deleting a room after confirmation
  async function handleDeleteRoom(roomId) {
    // 1 confirmation dialog
    // ask the user for confirmation before proceeding
    const confirmed = window.confirm(
      "bạn có chắc chắn muốn xóa phòng này không?"
    );

    // if the user cancels stop the function
    if (!confirmed) {
      return;
    }

    // 2 ui feedback show loading state on the button
    // find the specific delete button that was clicked
    const deleteButton = roomTableBody?.querySelector(
      `.delete-room-btn[data-id="${roomId}"]`
    );
    // store original button text to restore it later
    const originalButtonText = deleteButton ? deleteButton.innerHTML : "xóa";
    if (deleteButton) {
      deleteButton.disabled = true; // disable the button
      // show a loading spinner and text
      deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> đang xóa...`;
    }

    try {
      // 3 call api to delete the room
      await RoomService.deleteRoom(roomId);

      // 4 refresh the table data
      // recalculate total pages after deletion might change the current page
      const totalPagesAfterDeletion = Math.ceil(
        (totalRooms - 1) / roomsPerPage
      );
      // adjust currentpage if it becomes invalid after deletion
      if (
        currentPage > totalPagesAfterDeletion &&
        totalPagesAfterDeletion > 0
      ) {
        currentPage = totalPagesAfterDeletion; // go to the new last page
      } else if (totalPagesAfterDeletion === 0) {
        currentPage = 1; // go back to page 1 if the list becomes empty
      }
      // fetch the updated room list and re-render the ui
      await fetchAndRenderUiForRoomsTab();
      // note success feedback could be added here eg using a toast notification
    } catch (error) {
      // 5 error handling
      console.error(error);
      // display an error message to the user eg using alert or a modal
      alert(`lỗi khi xóa phòng ${error.message || ""}`);
      // re-enable the button and restore its original text on error
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
      }
    }
  }

  // --- add new room modal functions ---

  // loads available amenities from the service and populates the checkbox list in the modal
  async function loadAmenitiesForModal() {
    // ensure the container element exists
    if (!newRoomAmenitiesListDiv) return;
    // display loading message
    newRoomAmenitiesListDiv.innerHTML =
      '<p class="text-muted">đang tải tiện nghi...</p>';

    try {
      // fetch all amenities
      const amenities = await AmenityService.getAllAmenities();
      // clear loading message or previous content
      newRoomAmenitiesListDiv.innerHTML = "";
      // check if amenities were fetched successfully and the array is not empty
      if (amenities && amenities.length > 0) {
        // mapping for user-friendly amenity names
        const amenityNameMap = {
          bed: "giường",
          refrigerator: "tủ lạnh",
          air_conditioner: "máy lạnh",
          water_heater: "vòi nước nóng",
          table_and_chairs: "bàn ghế",
          electric_stove: "bếp điện",
          gas_stove: "bếp ga"
        };

        // create a checkbox for each amenity
        amenities.forEach((amenity) => {
          const div = document.createElement("div");
          div.classList.add("form-check");
          // get the display name or use a default
          const amenityName = amenityNameMap[amenity.name] || "tiện nghi";
          // set the inner html for the checkbox and label
          div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${amenity._id}" id="amenity-${amenity._id}" name="newRoomAmenities">
            <label class="form-check-label" for="amenity-${amenity._id}">
                ${amenityName}
            </label>
          `;
          // append the checkbox div to the container
          newRoomAmenitiesListDiv.appendChild(div);
        });
      } else {
        // display message if no amenities are available
        newRoomAmenitiesListDiv.innerHTML =
          '<p class="text-muted">không có tiện nghi nào.</p>';
      }
    } catch (error) {
      // handle errors during the fetch process
      console.error(error);
      // display an error message in the container
      newRoomAmenitiesListDiv.innerHTML =
        '<p class="text-danger">lỗi tải tiện nghi.</p>';
    }
  }

  // loads available utilities from the service and populates the checkbox list in the modal
  async function loadUtilitiesForModal() {
    // ensure the container element exists
    if (!newRoomUtilitiesListDiv) return;
    // display loading message
    newRoomUtilitiesListDiv.innerHTML =
      '<p class="text-muted">đang tải tiện ích...</p>';
    try {
      // fetch all utilities
      const utilities = await UtilityService.getAllUtilities();
      // clear loading message or previous content
      newRoomUtilitiesListDiv.innerHTML = "";
      // check if utilities were fetched successfully and the array is not empty
      if (utilities && utilities.length > 0) {
        // mapping for user-friendly utility names
        const utilityNameMap = {
          wifi: "wifi",
          parking: "đỗ xe",
          cleaning: "vệ sinh hàng tuần"
        };

        // create a checkbox for each utility
        utilities.forEach((utility) => {
          const div = document.createElement("div");
          div.classList.add("form-check");
          // get the display name or use a default
          const utilityName = utilityNameMap[utility.name] || "tiện ích";
          // set the inner html for the checkbox and label
          div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${utility._id}" id="utility-${utility._id}" name="newRoomUtilities">
            <label class="form-check-label" for="utility-${utility._id}">
                ${utilityName}
            </label>
          `;
          // append the checkbox div to the container
          newRoomUtilitiesListDiv.appendChild(div);
        });
      } else {
        // display message if no utilities are available
        newRoomUtilitiesListDiv.innerHTML =
          '<p class="text-muted">không có tiện ích nào.</p>';
      }
    } catch (error) {
      // handle errors during the fetch process
      console.error(error);
      // display an error message in the container
      newRoomUtilitiesListDiv.innerHTML =
        '<p class="text-danger">lỗi tải tiện ích.</p>';
    }
  }

  // renders image previews in the modal based on the selectedimagefiles array
  function renderImagePreviews() {
    // ensure the preview container exists
    if (!newRoomImagePreviewDiv) return;
    // clear existing previews
    newRoomImagePreviewDiv.innerHTML = "";

    // iterate over the globally stored selected image files
    selectedImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      // define what happens when the file reader successfully loads a file
      reader.onload = function (e) {
        const previewItem = document.createElement("div");
        previewItem.classList.add("image-preview-item");
        // create the html for the preview including the image and a remove button
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="preview ${file.name}">
          <button type="button" class="remove-image-btn" data-index="${index}">×</button>
        `;
        // add event listener to the remove button for this specific preview
        previewItem
          .querySelector(".remove-image-btn")
          .addEventListener("click", (event) => {
            // get the index of the image to remove from the button's data attribute
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            // remove the file from the global array using splice
            selectedImageFiles.splice(indexToRemove, 1);
            // re-render the previews to reflect the removal
            renderImagePreviews();
          });

        // append the created preview item to the container
        newRoomImagePreviewDiv.appendChild(previewItem);
      };
      // start reading the file as a data url to display the image
      reader.readAsDataURL(file);
    });

    // if no images are selected display a placeholder message
    if (selectedImageFiles.length === 0) {
      newRoomImagePreviewDiv.innerHTML =
        '<p class="text-muted small">chưa chọn ảnh nào.</p>';
    }
  }

  // handles the file selection event when new images are chosen
  function handleImageSelection(event) {
    // get the files from the event target (the file input)
    const files = Array.from(event.target.files);
    // add the newly selected files to the global array
    selectedImageFiles.push(...files);
    // update the image previews
    renderImagePreviews();
    // clear the file input's value
    // this allows selecting the same file again if it was removed and then re-added
    event.target.value = null;
  }

  // resets the add room form to its default state
  function resetAddRoomForm() {
    // reset form fields using the native form reset method
    if (addRoomForm) {
      addRoomForm.reset();
      // remove bootstrap validation styling
      addRoomForm.classList.remove("was-validated");
    }
    // clear the global array of selected files
    selectedImageFiles = [];
    // clear the image preview area
    renderImagePreviews();
    // explicitly uncheck all amenity checkboxes
    document
      .querySelectorAll('#newRoomAmenitiesList input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    // explicitly uncheck all utility checkboxes
    document
      .querySelectorAll('#newRoomUtilitiesList input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    // hide any previous feedback messages
    hideModalFeedback();
  }

  // handles the submission of the add new room form
  async function handleSaveNewRoom() {
    // clear any previous feedback messages
    hideModalFeedback();

    // perform basic html5 form validation
    if (!addRoomForm || !addRoomForm.checkValidity()) {
      // add bootstrap validation classes to show error states
      if (addRoomForm) addRoomForm.classList.add("was-validated");
      // show a generic validation warning message
      showModalFeedback("vui lòng điền đầy đủ các trường bắt buộc.", "warning");
      return; // stop if the form is invalid
    }
    // ensure validation styles are shown even if initially valid but submitted
    if (addRoomForm) addRoomForm.classList.add("was-validated");

    // disable the save button and show the spinner for visual feedback
    if (saveNewRoomBtn) saveNewRoomBtn.disabled = true;
    if (saveNewRoomSpinner) saveNewRoomSpinner.style.display = "inline-block";

    // --- collect form data ---
    // collect basic room information
    const roomData = {
      roomNumber: newRoomNumberInput ? newRoomNumberInput.value.trim() : "",
      address: newRoomAddressInput ? newRoomAddressInput.value.trim() : "",
      rentPrice: newRoomRentPriceInput
        ? parseInt(newRoomRentPriceInput.value, 10)
        : 0,
      occupantsNumber: newRoomOccupantsNumberInput
        ? parseInt(newRoomOccupantsNumberInput.value, 10)
        : 1,
      status: newRoomStatusSelect ? newRoomStatusSelect.value : "vacant",
      description: newRoomDescriptionInput
        ? newRoomDescriptionInput.value.trim()
        : ""
    };

    // collect selected amenity ids
    const amenityIds = Array.from(
      document.querySelectorAll(
        '#newRoomAmenitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);

    // collect selected utility ids
    const utilityIds = Array.from(
      document.querySelectorAll(
        '#newRoomUtilitiesList input[type="checkbox"]:checked'
      )
    ).map((cb) => cb.value);

    // --- create formdata object ---
    // use formdata because we are sending files (images)
    const formData = new FormData();

    // append basic room data fields to formdata
    for (const key in roomData) {
      // check if the property belongs to the object itself not its prototype
      if (Object.hasOwnProperty.call(roomData, key)) {
        formData.append(key, roomData[key]);
      }
    }

    // append amenity ids individually with the key 'amenities'
    // backend expects an array for this key
    amenityIds.forEach((id) => formData.append("amenities", id));

    // append utility ids individually with the key 'utilities'
    utilityIds.forEach((id) => formData.append("utilities", id));

    // append selected image files
    if (selectedImageFiles) {
      selectedImageFiles.forEach((file) => {
        // the key 'images' must match the name expected by the backend (multer field name)
        formData.append("images", file);
      });
    }

    try {
      // call the service to add the new room using the formdata
      await RoomService.addNewRoom(formData);
      // show success message
      showModalFeedback("thêm phòng thành công!", "success");
      // refresh the room list in the main table
      await fetchAndRenderUiForRoomsTab();
      // hide the modal after a short delay to allow the user to see the success message
      setTimeout(() => {
        if (addNewRoomModal) addNewRoomModal.hide();
        // form reset is now handled by the 'hidden.bs.modal' event listener
      }, 1500);
    } catch (error) {
      // handle api errors
      console.error(error);
      // display a detailed error message from the api response if available or a generic one
      showModalFeedback(
        `lỗi: ${
          error?.response?.data?.message || // axios error structure
          error.message || // generic error message
          "không thể thêm phòng"
        }`,
        "danger"
      );
    } finally {
      // this block always executes whether the try block succeeded or failed
      // re-enable the save button and hide the spinner
      if (saveNewRoomBtn) saveNewRoomBtn.disabled = false;
      if (saveNewRoomSpinner) saveNewRoomSpinner.style.display = "none";
    }
  }

  // --- event listeners setup ---

  // navigation item clicks
  // add click listeners to each navigation item link
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a");
    if (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault(); // prevent default link navigation
        const targetId = link.dataset.target; // get the target content id from data attribute
        if (targetId) {
          showContent(targetId); // call showcontent to display the correct section
        }
      });
    }
  });

  // rooms tab: apply filters button
  // add click listener to the apply filters button
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", () => {
      currentPage = 1; // reset to the first page when applying new filters
      fetchAndRenderUiForRoomsTab(); // fetch and display rooms with the new filters
    });
  }

  // rooms tab: price range input
  // update the displayed minimum price when the range input changes
  if (priceRangeInput && minPriceSpan) {
    priceRangeInput.addEventListener("input", () => {
      // format the number as vietnamese currency
      minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
        "vi-VN"
      );
    });
    // set the initial display value on page load
    minPriceSpan.textContent = Number(priceRangeInput.value).toLocaleString(
      "vi-VN"
    );
  }

  // rooms tab: occupant range input
  // update the displayed minimum occupants when the range input changes
  if (occupantNumberRangeInput && minOccupantNumberSpan) {
    occupantNumberRangeInput.addEventListener("input", () => {
      // display the raw value
      minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
    });
    // set the initial display value on page load
    minOccupantNumberSpan.textContent = occupantNumberRangeInput.value;
  }

  // rooms tab: delete room button (event delegation)
  // use event delegation on the table body to handle clicks on delete buttons
  if (roomTableBody) {
    roomTableBody.addEventListener("click", (event) => {
      // find the closest ancestor element with the 'delete-room-btn' class
      const deleteButton = event.target.closest(".delete-room-btn");
      if (deleteButton) {
        // important: stop the event from bubbling up to the row's click listener
        event.stopPropagation();
        const roomId = deleteButton.dataset.id; // get the room id from the button's data attribute
        if (roomId) {
          handleDeleteRoom(roomId); // call the delete handler function
        }
      }
    });
  }

  // rooms tab: add new room button
  // add click listener to the button that opens the add room modal
  if (addNewRoomButton && addNewRoomModal) {
    addNewRoomButton.addEventListener("click", () => {
      resetAddRoomForm(); // reset the form every time the modal is opened
      // load dynamic data like amenities and utilities before showing the modal
      // this ensures the lists are up-to-date
      loadAmenitiesForModal();
      loadUtilitiesForModal();
      addNewRoomModal.show(); // show the bootstrap modal
    });
  }

  // add new room modal is completely hidden event
  // listen for the bootstrap modal 'hidden' event to reset the form *after* it closes
  if (addNewRoomModalElement) {
    addNewRoomModalElement.addEventListener("hidden.bs.modal", () => {
      resetAddRoomForm(); // reset form ensures clean state for next opening
    });
  }

  // --- event listeners for add new room modal ---
  // select room images button click
  // trigger the hidden file input when the visible button is clicked
  if (selectRoomImagesBtn && newRoomImagesInput) {
    selectRoomImagesBtn.addEventListener("click", () => {
      newRoomImagesInput.click();
    });
  }

  // new room images input change
  // handle file selection when the hidden input's value changes
  if (newRoomImagesInput) {
    newRoomImagesInput.addEventListener("change", handleImageSelection);
  }

  // save new room button click
  // handle the form submission when the save button is clicked
  if (saveNewRoomBtn) {
    saveNewRoomBtn.addEventListener("click", handleSaveNewRoom);
  }

  // --- initial load ---
  // actions to perform when the page finishes loading
  populateAddressFilter(); // load addresses into the filter dropdown
  fetchAndRenderUiForRoomsTab(); // fetch and display the initial list of rooms
  showContent("rooms-tab-container"); // show the 'rooms' tab by default
});
