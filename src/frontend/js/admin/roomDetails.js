import RoomService from "../services/RoomService.js";
import AmenityService from "../services/AmenityService.js";
import UtilityService from "../services/UtilityService.js";

// --- global scope variables ---
// stores the id of the room currently being edited
let currentRoomId = null;
// stores the complete data object for the room being edited fetched from the api
let currentRoomData = null;
// stores all available amenities fetched from the api used to populate checkboxes
let allAmenities = [];
// stores all available utilities fetched from the api used to populate checkboxes
let allUtilities = [];
// stores information about existing images associated with the room primarily their ids
let existingImagePreviews = []; // example { id: '...' }
// stores file objects for new images selected by the user to be uploaded
let newImageFiles = []; // file objects
// stores the ids of existing images that the user has marked for deletion
let imagesToDeleteIds = []; // array of image ids

// --- domcontentloaded event listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- element selectors ---
  // the main form for editing room details
  const editRoomForm = document.getElementById("editRoomForm");
  // input field for the room number
  const roomNumberInput = document.getElementById("roomNumber");
  // input field for the room address
  const roomAddressInput = document.getElementById("roomAddress");
  // input field for the room rent price
  const roomRentPriceInput = document.getElementById("roomRentPrice");
  // input field for the maximum number of occupants
  const roomOccupantsNumberInput = document.getElementById(
    "roomOccupantsNumber"
  );
  // select dropdown for the room status vacant occupied unavailable
  const roomStatusSelect = document.getElementById("RoomStatus");
  // textarea for the room description
  const roomDescriptionInput = document.getElementById("RoomDescription");
  // container div for the amenity checkboxes
  const roomAmenitiesListDiv = document.getElementById("roomAmenitiesList");
  // container div for the utility checkboxes
  const roomUtilitiesListDiv = document.getElementById("roomUtilitiesList");
  // hidden file input for selecting new room images
  const roomImagesInput = document.getElementById("roomImagesInput");
  // button to trigger the hidden file input
  const selectRoomImagesBtn = document.getElementById("selectRoomImagesBtn");
  // container div to display previews of existing and newly selected images
  const roomImagePreviewDiv = document.getElementById("roomImagePreview");
  // button to submit the changes made to the room
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  // button to cancel editing and go back
  const cancelChangesBtn = document.getElementById("cancelChangesBtn");
  // div to display feedback messages eg errors or success messages
  const editRoomFeedbackDiv = document.getElementById("editRoomModalFeedback");
  // the spinner element inside the save changes button
  const saveChangesSpinner = saveChangesBtn?.querySelector(".spinner-border");

  // --- core functions ---

  // extracts the room id from the current url's path
  function getRoomIdFromUrl() {
    // get the path part of the url eg /admin/room/details/someid
    const pathSegments = window.location.pathname.split("/");
    // the id is expected to be the last segment
    return pathSegments[pathSegments.length - 1] || null;
  }

  // displays a feedback message on the page typically for errors or success
  function showModalFeedback(message, type = "danger") {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.textContent = message;
      editRoomFeedbackDiv.className = `alert alert-${type} mt-3`; // set bootstrap alert class
      editRoomFeedbackDiv.style.display = "block";
      // scroll the feedback message into view
      editRoomFeedbackDiv.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }

  // hides the feedback message area
  function hideModalFeedback() {
    if (editRoomFeedbackDiv) {
      editRoomFeedbackDiv.style.display = "none";
      editRoomFeedbackDiv.textContent = "";
      editRoomFeedbackDiv.className = "alert"; // reset class
    }
  }

  // --- ui rendering functions ---

  // renders the checklist of available amenities based on allamenities
  // checks the boxes corresponding to the current room's amenities
  function renderAmenitiesChecklist() {
    // ensure the container exists and we have amenity data
    if (!roomAmenitiesListDiv || !allAmenities.length) {
      if (roomAmenitiesListDiv)
        roomAmenitiesListDiv.innerHTML =
          '<p class="text-muted">không có tiện nghi nào.</p>';
      return;
    }
    // clear previous checklist items
    roomAmenitiesListDiv.innerHTML = "";

    // create a set of the current room's amenity ids for efficient lookup
    // handles cases where amenities might be stored as objects or just ids
    const roomAmenityIds = new Set(
      currentRoomData?.amenities?.map((a) =>
        typeof a === "string" ? a : a._id
      ) || []
    );

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

    // create a checkbox item for each available amenity
    allAmenities.forEach((amenity) => {
      // determine if this amenity should be checked based on the room's current data
      const isChecked = roomAmenityIds.has(amenity._id);
      const div = document.createElement("div");
      div.classList.add("form-check");

      // get the display name using the map or fallback to the raw name
      const amenityName =
        amenityNameMap[amenity.name] || amenity.name || "tiện nghi";
      // generate the html for the checkbox and label
      div.innerHTML = `<input class="form-check-input" type="checkbox" value="${
        amenity._id
      }" id="edit-amenity-${amenity._id}" name="editRoomAmenities" ${
        isChecked ? "checked" : "" // set the checked attribute if needed
      }><label class="form-check-label" for="edit-amenity-${
        amenity._id
      }">${amenityName}</label>`;

      // append the checkbox item to the container
      roomAmenitiesListDiv.appendChild(div);
    });
  }

  // renders the checklist of available utilities based on allutilities
  // checks the boxes corresponding to the current room's utilities
  function renderUtilitiesChecklist() {
    // ensure the container exists and we have utility data
    if (!roomUtilitiesListDiv || !allUtilities.length) {
      if (roomUtilitiesListDiv)
        roomUtilitiesListDiv.innerHTML =
          '<p class="text-muted">không có tiện ích nào.</p>';
      return;
    }
    // clear previous checklist items
    roomUtilitiesListDiv.innerHTML = "";

    // create a set of the current room's utility ids for efficient lookup
    const roomUtilityIds = new Set(
      currentRoomData?.utilities?.map((u) =>
        typeof u === "string" ? u : u._id
      ) || []
    );

    // mapping for user-friendly utility names
    const utilityNameMap = {
      wifi: "wifi",
      parking: "đỗ xe",
      cleaning: "vệ sinh hàng tuần"
    };

    // create a checkbox item for each available utility
    allUtilities.forEach((utility) => {
      // determine if this utility should be checked
      const isChecked = roomUtilityIds.has(utility._id);
      const div = document.createElement("div");
      div.classList.add("form-check");

      // get the display name using the map or fallback to the raw name
      const utilityName =
        utilityNameMap[utility.name] || utility.name || "tiện ích";
      // generate the html for the checkbox and label
      div.innerHTML = `<input class="form-check-input" type="checkbox" value="${
        utility._id
      }" id="edit-utility-${utility._id}" name="editRoomUtilities" ${
        isChecked ? "checked" : "" // set checked attribute
      }><label class="form-check-label" for="edit-utility-${
        utility._id
      }">${utilityName}</label>`;

      // append the checkbox item to the container
      roomUtilitiesListDiv.appendChild(div);
    });
  }

  // renders previews for both existing and newly added images
  // handles fetching existing image data and displaying file reader previews for new ones
  // also adds remove buttons for both types
  async function renderImagePreviews() {
    // ensure the preview container exists
    if (!roomImagePreviewDiv) return;
    // clear previous previews
    roomImagePreviewDiv.innerHTML = "";

    // --- 1 render existing images ---
    // create an array of promises to fetch and create preview elements for existing images
    const existingImagePromises = existingImagePreviews.map(async (imgInfo) => {
      // skip rendering if the image is marked for deletion
      if (imagesToDeleteIds.includes(imgInfo.id)) return null;

      const previewItem = document.createElement("div");
      previewItem.classList.add("image-preview-item");
      let imageSrc = "/assets/logo_error.png"; // default error image

      try {
        // fetch the image data by its id
        const imageData = await RoomService.getRoomImageById(imgInfo.id);
        // convert the binary data array to a base64 string
        const base64Image = btoa(
          new Uint8Array(imageData.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        // create the data url for the image source
        imageSrc = `data:${imageData.contentType};base64,${base64Image}`;
      } catch (error) {
        // log errors fetching image data keep the error placeholder image
        console.error(`error fetching image ${imgInfo.id}:`, error);
      }

      // generate html for the existing image preview including a remove button
      previewItem.innerHTML = `
          <img src="${imageSrc}" alt="existing room image">
          <button type="button" class="remove-image-btn existing-remove-btn" data-image-id="${imgInfo.id}" title="xóa ảnh này">×</button>
      `;
      return previewItem; // return the created dom element
    });

    // wait for all existing image fetches and element creation to complete
    // filter out any null results (images skipped due to deletion)
    const existingItems = (await Promise.all(existingImagePromises)).filter(
      (item) => item !== null
    );

    // append existing image previews to the dom and attach event listeners *after* appending
    existingItems.forEach((previewItem) => {
      roomImagePreviewDiv.appendChild(previewItem);

      // find the remove button within this specific preview item
      const removeBtn = previewItem.querySelector(".existing-remove-btn");
      if (removeBtn) {
        // add click listener to handle removal of *existing* images
        removeBtn.addEventListener("click", (event) => {
          const imageId = event.target.getAttribute("data-image-id");
          // if the id is valid and not already marked for deletion
          if (imageId && !imagesToDeleteIds.includes(imageId)) {
            // add the id to the deletion list
            imagesToDeleteIds.push(imageId);
            // re-render previews to visually remove the item
            renderImagePreviews();
          }
        });
      }
    });

    // --- 2 render new image previews ---
    // iterate through the files selected by the user (stored in newimagefiles)
    newImageFiles.forEach((file, index) => {
      const reader = new FileReader();
      // define onload behavior for the file reader
      reader.onload = function (e) {
        const newPreviewItem = document.createElement("div");
        newPreviewItem.classList.add("image-preview-item");
        // generate html for the new image preview including a remove button
        newPreviewItem.innerHTML = `
                <img src="${e.target.result}" alt="preview ${file.name}">
                <button type="button" class="remove-image-btn new-remove-btn" data-index="${index}" title="hủy thêm ảnh này">×</button>
            `;

        // find the remove button within this specific new preview item
        const removeBtn = newPreviewItem.querySelector(".new-remove-btn");
        if (removeBtn) {
          // add click listener to handle removal of *new* images before upload
          removeBtn.addEventListener("click", (event) => {
            // get the index from the data attribute
            const indexToRemove = parseInt(
              event.target.getAttribute("data-index"),
              10
            );
            // validate the index against the current state of the newimagefiles array
            if (
              !isNaN(indexToRemove) &&
              indexToRemove >= 0 &&
              indexToRemove < newImageFiles.length
            ) {
              // remove the file from the array
              newImageFiles.splice(indexToRemove, 1);
              // re-render previews to reflect the change and potentially update indices
              renderImagePreviews();
            } else {
              // if index is somehow invalid just re-render to be safe
              console.warn(
                "invalid index found for new image removal:",
                indexToRemove
              );
              renderImagePreviews();
            }
          });
        }
        // append the new preview item *after* the listener is attached
        roomImagePreviewDiv.appendChild(newPreviewItem);
      };
      // handle potential file reader errors
      reader.onerror = (error) => {
        console.error("filereader error:", error);
        // optionally display a placeholder for the failed preview
      };
      // start reading the file as a data url
      reader.readAsDataURL(file);
    });

    // --- 3 add "no images" message ---
    // if after rendering both existing and new previews the container is still empty
    if (roomImagePreviewDiv.childElementCount === 0) {
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted small ms-1">chưa có ảnh nào.</p>';
    }
  }

  // --- data fetching and population ---
  // fetches all necessary data room details amenities utilities for the page
  // populates the form fields checklists and image previews
  async function fetchAndRenderUiRoomDetails() {
    // get the room id from the url
    currentRoomId = getRoomIdFromUrl();
    // if no id is found show an error and hide the form
    if (!currentRoomId) {
      showModalFeedback("không tìm thấy id phòng hợp lệ trong url.", "danger");
      if (editRoomForm) editRoomForm.style.display = "none";
      return;
    }

    // reset global state variables before fetching new data
    currentRoomData = null;
    existingImagePreviews = [];
    newImageFiles = [];
    imagesToDeleteIds = [];

    // show loading states in dynamic sections
    if (roomAmenitiesListDiv)
      roomAmenitiesListDiv.innerHTML =
        '<p class="text-muted">đang tải tiện nghi...</p>';
    if (roomUtilitiesListDiv)
      roomUtilitiesListDiv.innerHTML =
        '<p class="text-muted">đang tải tiện ích...</p>';
    if (roomImagePreviewDiv)
      roomImagePreviewDiv.innerHTML =
        '<p class="text-muted">đang tải hình ảnh...</p>';
    // hide any previous feedback messages
    hideModalFeedback();
    // ensure the form is visible
    if (editRoomForm) editRoomForm.style.display = "block";

    try {
      // fetch room details all amenities and all utilities concurrently
      const [roomDetails, amenities, utilities] = await Promise.all([
        RoomService.getRoomById(currentRoomId),
        AmenityService.getAllAmenities(),
        UtilityService.getAllUtilities()
      ]);

      // store fetched data in global variables
      currentRoomData = roomDetails;
      allAmenities = amenities || [];
      allUtilities = utilities || [];

      // store only the ids of existing images for managing previews and deletion
      existingImagePreviews =
        currentRoomData.images?.map((img) => ({
          id: typeof img === "string" ? img : img._id // handle if images are stored as strings or objects
        })) || [];

      // populate the basic form fields (room number address price etc)
      populateFormFieldsBasicInfo();
      // render the amenity and utility checklists checking appropriate boxes
      renderAmenitiesChecklist();
      renderUtilitiesChecklist();
      // render the image previews including existing and new ones
      await renderImagePreviews(); // wait for image rendering which might involve fetches

      // remove any previous validation styling
      if (editRoomForm) editRoomForm.classList.remove("was-validated");
    } catch (error) {
      // handle errors during the data fetching process
      console.error(error);
      // display an informative error message
      showModalFeedback(
        `lỗi khi tải dữ liệu phòng: ${
          error?.response?.data?.message || error.message
        }`,
        "danger"
      );
      // hide the form if data loading failed critically
      if (editRoomForm) editRoomForm.style.display = "none";
    }
  }

  // populates the basic information fields of the form using currentroomdata
  function populateFormFieldsBasicInfo() {
    // ensure we have room data and the form element
    if (!currentRoomData || !editRoomForm) return;
    // set the value for each input field using data from currentroomdata
    // provide default values (empty string 0 1 vacant) if data is missing
    if (roomNumberInput)
      roomNumberInput.value = currentRoomData.roomNumber || "";
    if (roomAddressInput)
      roomAddressInput.value = currentRoomData.address || "";
    if (roomRentPriceInput)
      roomRentPriceInput.value = currentRoomData.rentPrice || 0;
    if (roomOccupantsNumberInput)
      roomOccupantsNumberInput.value = currentRoomData.occupantsNumber || 1;
    if (roomStatusSelect)
      roomStatusSelect.value = currentRoomData.status || "vacant";
    if (roomDescriptionInput)
      roomDescriptionInput.value = currentRoomData.description || "";
  }

  // --- event handlers ---

  // handles the file selection event for adding new images
  function handleImageSelection(event) {
    // get the selected files as an array
    const files = Array.from(event.target.files);
    // add the new files to the global array
    newImageFiles.push(...files);
    // re-render the image previews to include the new ones
    renderImagePreviews(); // this now also attaches remove listeners
    // clear the file input value to allow selecting the same file again if needed
    event.target.value = null;
  }

  // handles the form submission when the save changes button is clicked
  async function handleSaveChanges() {
    // clear previous feedback messages
    hideModalFeedback();

    // --- form validation ---
    // perform standard html5 validation
    if (!editRoomForm || !editRoomForm.checkValidity()) {
      // add bootstrap validation classes to show feedback
      if (editRoomForm) editRoomForm.classList.add("was-validated");
      showModalFeedback(
        "vui lòng kiểm tra lại các trường thông tin.",
        "warning"
      );
      return; // stop if validation fails
    }
    // ensure validation styles are applied after check
    if (editRoomForm) editRoomForm.classList.add("was-validated");

    // --- check for core data ---
    // ensure we have the room id and the initial room data loaded
    if (!currentRoomId || !currentRoomData) {
      showModalFeedback(
        "lỗi: không thể xác định dữ liệu phòng hiện tại.",
        "danger"
      );
      return;
    }

    // --- disable ui show spinner ---
    // provide visual feedback that processing is happening
    if (saveChangesBtn) saveChangesBtn.disabled = true;
    if (saveChangesSpinner) saveChangesSpinner.style.display = "inline-block";
    // array to collect potential errors from multiple api calls
    const errors = [];

    try {
      // --- 1 collect current form data ---

      // gather updated basic room information from input fields
      const updatedBasicData = {
        roomNumber: roomNumberInput.value.trim(),
        address: roomAddressInput.value.trim(),
        rentPrice: parseInt(roomRentPriceInput.value, 10) || 0,
        occupantsNumber: parseInt(roomOccupantsNumberInput.value, 10) || 1,
        status: roomStatusSelect.value,
        description: roomDescriptionInput.value.trim()
      };

      // gather currently selected amenity ids from checkboxes
      const currentAmenityIds = new Set();
      roomAmenitiesListDiv
        ?.querySelectorAll('input[type="checkbox"]:checked')
        .forEach((cb) => currentAmenityIds.add(cb.value));

      // gather currently selected utility ids from checkboxes
      const currentUtilityIds = new Set();
      roomUtilitiesListDiv
        ?.querySelectorAll('input[type="checkbox"]:checked')
        .forEach((cb) => currentUtilityIds.add(cb.value));

      // --- 2 determine what actually changed ---
      // compare updated data with the initially loaded data (currentroomdata)

      // basic info changes check
      let basicDataChanged = false;
      const initialBasicData = currentRoomData; // reference original data
      for (const key in updatedBasicData) {
        // compare values robustly handle potential type differences eg "1" vs 1
        // explicitly check description allowing empty/null/undefined to be considered unchanged if both are that way
        if (key === "description") {
          if ((updatedBasicData[key] || "") !== (initialBasicData[key] || "")) {
            // treat null/undefined as empty string for comparison
            basicDataChanged = true;
            break;
          }
        } else if (
          String(updatedBasicData[key]) !== String(initialBasicData[key])
        ) {
          basicDataChanged = true;
          break; // exit loop early if a change is found
        }
      }

      // amenity changes check: find ids to add and ids to delete
      const initialAmenityIds = new Set(
        currentRoomData.amenities?.map(
          (a) => (typeof a === "string" ? a : a._id) // handle mixed data types
        ) || []
      );
      // amenities to add are those checked now but not initially present
      const amenitiesToAdd = [...currentAmenityIds].filter(
        (id) => !initialAmenityIds.has(id)
      );
      // amenities to delete are those initially present but not checked now
      const amenitiesToDelete = [...initialAmenityIds].filter(
        (id) => !currentAmenityIds.has(id)
      );

      // utility changes check: find ids to add and ids to delete
      const initialUtilityIds = new Set(
        currentRoomData.utilities?.map(
          (u) => (typeof u === "string" ? u : u._id) // handle mixed data types
        ) || []
      );
      // utilities to add
      const utilitiesToAdd = [...currentUtilityIds].filter(
        (id) => !initialUtilityIds.has(id)
      );
      // utilities to delete
      const utilitiesToDelete = [...initialUtilityIds].filter(
        (id) => !currentUtilityIds.has(id)
      );

      // --- 3 build array of api calls based on changes ---
      // create an array to hold promises for all necessary api operations
      const apiCalls = [];

      // add api call promise for updating basic data if it changed
      if (basicDataChanged) {
        apiCalls.push(
          RoomService.updateRoom(currentRoomId, updatedBasicData).catch(
            (err) => {
              // collect error message if this specific call fails
              errors.push(
                `lỗi cập nhật cơ bản: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err; // re-throw to stop promise.all if basic update fails (critical)
            }
          )
        );
      }

      // add api call promise for deleting amenities if needed
      if (amenitiesToDelete.length > 0) {
        apiCalls.push(
          RoomService.deleteAmenitiesForRoom(
            currentRoomId,
            amenitiesToDelete
          ).catch((err) => {
            errors.push(
              `lỗi xóa tiện nghi: ${
                err?.response?.data?.message || err.message
              }`
            );
            throw err; // re-throw to potentially stop promise.all
          })
        );
      }

      // add api call promise for adding amenities if needed
      if (amenitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addAmenitiesToRoom(currentRoomId, amenitiesToAdd).catch(
            (err) => {
              errors.push(
                `lỗi thêm tiện nghi: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            }
          )
        );
      }

      // add api call promise for deleting utilities if needed
      if (utilitiesToDelete.length > 0) {
        apiCalls.push(
          RoomService.deleteUtilitiesForRoom(
            currentRoomId,
            utilitiesToDelete
          ).catch((err) => {
            errors.push(
              `lỗi xóa tiện ích: ${err?.response?.data?.message || err.message}`
            );
            throw err;
          })
        );
      }

      // add api call promise for adding utilities if needed
      if (utilitiesToAdd.length > 0) {
        apiCalls.push(
          RoomService.addUtilitiesToRoom(currentRoomId, utilitiesToAdd).catch(
            (err) => {
              errors.push(
                `lỗi thêm tiện ích: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            }
          )
        );
      }

      // add api call promise for deleting images if needed (using imagestodeleteids array)
      if (imagesToDeleteIds.length > 0) {
        apiCalls.push(
          RoomService.deleteImagesForRoom(
            currentRoomId,
            imagesToDeleteIds
          ).catch((err) => {
            errors.push(
              `lỗi xóa hình ảnh: ${err?.response?.data?.message || err.message}`
            );
            throw err;
          })
        );
      }

      // add api call promise for adding new images if needed (using newimagefiles array)
      if (newImageFiles.length > 0) {
        apiCalls.push(
          // assumes addimagestoroom handles formdata creation internally or accepts files directly
          RoomService.addImagesToRoom(currentRoomId, newImageFiles).catch(
            (err) => {
              errors.push(
                `lỗi thêm hình ảnh mới: ${
                  err?.response?.data?.message || err.message
                }`
              );
              throw err;
            }
          )
        );
      }

      // --- 4 execute api calls and handle results ---
      // proceed only if there are actual changes to save
      if (apiCalls.length > 0) {
        // execute all collected api calls concurrently
        await Promise.all(apiCalls);
        // if all promises resolve successfully show success message
        showModalFeedback("cập nhật phòng thành công!", "success");

        // after a short delay refresh the page data to reflect changes
        setTimeout(async () => {
          try {
            // re-fetch and re-render everything this also resets the change tracking arrays
            await fetchAndRenderUiRoomDetails();
          } catch (fetchError) {
            // handle errors during the refresh process
            console.error("error refreshing data after update:", fetchError);
            showModalFeedback(
              `cập nhật thành công, nhưng lỗi khi tải lại dữ liệu: ${fetchError.message}`,
              "warning" // show a warning as the update itself was successful
            );
          }
        }, 1500); // delay to let user see success message
      } else {
        // inform the user if no changes were detected
        showModalFeedback("không có thay đổi nào để lưu.", "info");
      }
    } catch (error) {
      // this catch block handles errors from promise.all (if any promise rejected and re-threw)
      // or errors that occurred before promise.all
      console.error("error during save process:", error); // log the detailed error
      // construct a comprehensive error message possibly combining multiple errors
      const errorMessage =
        errors.length > 0
          ? errors.join("; ") // combine messages from individual failed api calls
          : `đã xảy ra lỗi: ${
              // fallback to the main error caught
              error?.response?.data?.message || error.message || "unknown error"
            }`;
      showModalFeedback(errorMessage, "danger");
    } finally {
      // --- re-enable ui ---
      // this block *always* executes regardless of success or failure in the try/catch
      // re-enable the save button and hide the spinner
      if (saveChangesBtn) saveChangesBtn.disabled = false;
      if (saveChangesSpinner) saveChangesSpinner.style.display = "none";
      // note state arrays like newimagefiles imagestodeleteids are implicitly reset
      // by fetchandrenderuiroomdetails only when the update succeeds and refresh happens
    }
  }

  // --- event listeners setup ---

  // select room images button click
  // trigger the hidden file input when the visible button is clicked
  if (selectRoomImagesBtn && roomImagesInput) {
    selectRoomImagesBtn.addEventListener("click", () => {
      roomImagesInput.click();
    });
  }

  // room images input change
  // listen for changes on the hidden file input to handle new selections
  if (roomImagesInput) {
    roomImagesInput.addEventListener("change", handleImageSelection);
  }

  // save changes button click
  // attach the main save handler to the save button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", handleSaveChanges);
  }

  // cancel changes button click
  // navigate back in browser history when cancel is clicked
  if (cancelChangesBtn) {
    cancelChangesBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // --- initial load ---
  // fetch and render all data when the page loads
  fetchAndRenderUiRoomDetails();
});
