document.addEventListener("DOMContentLoaded", function () {
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
});
