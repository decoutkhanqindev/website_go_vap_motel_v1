import RoomService from "../services/RoomService.js";
import ContractService from "../services/ContractService.js";
import UserService from "../services/UserService.js";
import OccupantService from "../services/OccupantService.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element Selectors ---
  const navItems = document.querySelectorAll(
    ".navbar-nav .nav-item:not(.logout-tab)"
  );
  const contentDivs = document.querySelectorAll(
    ".content .container > div:not(#occupant-status-message)"
  );
  const logoutLink = document.querySelector(".logout-tab a");
  const occupantStatusMessageDiv = document.getElementById(
    "occupant-status-message"
  );
  const mainNavbar = document.querySelector(".navbar .navbar-nav");

  // --- Core UI Functions ---

  // Function: Manages displaying content sections based on navigation clicks
  function showContent(targetId) {
    contentDivs.forEach((div) => (div.style.display = "none"));
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
      targetDiv.style.display = "block";
    } else {
      console.warn("Target content div not found:", targetId);
    }

    // Update active state in navbar
    document
      .querySelectorAll(".navbar-nav .nav-item")
      .forEach((item) => item.classList.remove("active-menu-item"));
    const activeNavItem = document.querySelector(
      `.nav-item a[data-target="${targetId}"]`
    );
    if (activeNavItem && activeNavItem.parentElement) {
      activeNavItem.parentElement.classList.add("active-menu-item");
    }
  }

  // --- Event Listener Setup ---
  // Event Listeners: Navigation
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a");
    if (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const targetId = link.dataset.target;
        if (targetId) {
          if (
            occupantStatusMessageDiv.style.display !== "block" ||
            occupantStatusMessageDiv.textContent === ""
          ) {
            showContent(targetId);
          }
        }
      });
    }
  });

  // Event Listener for Logout Link
  if (logoutLink) {
    logoutLink.addEventListener("click", async (event) => {
      event.preventDefault();

      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn đăng xuất không?"
      );
      if (!confirmed) {
        return;
      }

      logoutLink.parentElement.style.pointerEvents = "none";
      logoutLink.innerHTML = "Đang xử lý...";

      try {
        await UserService.logoutUser();
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accessToken");
        alert(
          "Đã xảy ra lỗi khi đăng xuất khỏi máy chủ, nhưng bạn sẽ được đăng xuất khỏi trình duyệt này."
        );
      } finally {
        window.location.replace("/");
      }
    });
  }

  // --- Initial Page Load Logic ---
  async function initializePage() {
    // Display a loading message initially
    occupantStatusMessageDiv.textContent = "Đang tải dữ liệu người dùng...";
    occupantStatusMessageDiv.className = "alert alert-info";
    occupantStatusMessageDiv.style.display = "block";
    contentDivs.forEach((div) => (div.style.display = "none"));

    try {
      const currentUser = await UserService.getMe();
      if (!currentUser || !currentUser._id) {
        throw new Error("Không thể xác thực người dùng.");
      }
      const userId = currentUser._id;

      occupantStatusMessageDiv.textContent =
        "Đang kiểm tra thông tin thuê phòng...";
      const occupants = await OccupantService.getAllOccupants({
        tenantId: userId
      });

      if (occupants && occupants.length > 0) {
        // User is an occupant
        occupantStatusMessageDiv.style.display = "none";
        occupantStatusMessageDiv.textContent = "";
        occupantStatusMessageDiv.className = "alert";

        showContent("room-tab-container"); // Show default tab

        // Enable navigation
        if (mainNavbar) mainNavbar.style.pointerEvents = "auto";

        // ### ADD LATER: Initial data loading for the default tab ###
        // Example: loadClientRoomDetails(occupants[0].roomId); // Pass necessary info
      }
    } catch (error) {
      console.error(error);
      if (
        error.response &&
        error.response.status === 404 &&
        error.config?.url?.includes("/occupants")
      ) {
        // User is NOT an occupant (API returned 404 Not Found)
        occupantStatusMessageDiv.textContent =
          "Bạn hiện không phải là người thuê phòng trong hệ thống. Vui lòng liên hệ quản lý.";
        occupantStatusMessageDiv.className = "alert alert-warning";
        occupantStatusMessageDiv.style.display = "block";
        contentDivs.forEach((div) => (div.style.display = "none")); // Keep content hidden
        if (mainNavbar) mainNavbar.style.pointerEvents = "none"; // Disable nav
        if (logoutLink) logoutLink.parentElement.style.pointerEvents = "auto"; // Keep logout enabled
      } else {
        let errorMessage =
          "Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.";
        if (
          error.response?.status === 401 ||
          error.message.includes("xác thực")
        ) {
          errorMessage =
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
          setTimeout(() => window.location.replace("/"), 3000);
        } else if (error.message) {
          errorMessage += ` (Chi tiết: ${
            error.response?.data?.message || error.message
          })`;
        }
        occupantStatusMessageDiv.textContent = errorMessage;
        occupantStatusMessageDiv.className = "alert alert-danger";
        occupantStatusMessageDiv.style.display = "block";
        contentDivs.forEach((div) => (div.style.display = "none"));
        if (mainNavbar) mainNavbar.style.pointerEvents = "none";
        if (logoutLink) logoutLink.parentElement.style.pointerEvents = "auto";
      }
    }
  }

  initializePage(); // Execute initialization
});
