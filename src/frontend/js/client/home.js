import RoomService from "../services/RoomService.js";

document.addEventListener("DOMContentLoaded", async function () {
  const navItems = document.querySelectorAll(".navbar-nav .nav-item");

  // handle active bg for each meny item when it clicked
  if (navItems.length > 0) {
    navItems[0].classList.add("active-menu-item");
  }
  navItems.forEach(function (navItem) {
    navItem.addEventListener("click", function (event) {
      event.preventDefault();

      navItems.forEach((item) => {
        item.classList.remove("active-menu-item");
      });

      this.classList.add("active-menu-item");
    });
  });

  try {
    const rooms = await RoomService.getAllRooms();
    console.log(rooms);
    const roomNVC = rooms.filter((room) => {
      return room.address.includes("Nguyễn Văn Công");
    });
    console.log(roomNVC);
    const roomDQH = rooms.filter((room) => {
      return room.address.includes("Dương Quảng Hàm");
    });
    console.log(roomDQH);
  } catch (error) {
    console.error("Failed to fetch and display room data:", error);
  }
});
