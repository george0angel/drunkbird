import {
  createIcons,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  ChevronsRight,
} from "lucide";

createIcons({
  icons: {
    ChevronUp,
    ChevronDown,
    ChevronsDown,
    ChevronsRight,
  },
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown[open]").forEach((dropdown) => {
      dropdown.removeAttribute("open");
    });
  }
});
