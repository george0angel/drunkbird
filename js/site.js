document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown[open]").forEach((dropdown) => {
      dropdown.removeAttribute("open");
    });
  }
});
