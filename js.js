const hamburguerButton = document.querySelector(".hamburguer");
const menuElement = document.querySelector(".menu");

hamburguerButton.addEventListener("click", () => {
  const isOpen = hamburguerButton.classList.contains("open");

  hamburguerButton.classList.toggle("open");
  menuElement.classList.toggle("open");

  hamburguerButton.setAttribute("aria-expanded", !isOpen);
});
