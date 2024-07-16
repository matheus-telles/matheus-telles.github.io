const hamburguerButton = document.querySelector(".hamburguer");
const menuElement = document.querySelector(".menu");
const toggleDarkMode = document.querySelector(".toggleDarkMode");

hamburguerButton.addEventListener("click", () => {
  const isOpen = hamburguerButton.classList.contains("open");

  hamburguerButton.classList.toggle("open");
  menuElement.classList.toggle("open");

  hamburguerButton.setAttribute("aria-expanded", !isOpen);
});

toggleDarkMode.addEventListener("click", () => {
  const body = document.body;
  body.classList.toggle("light-mode");
  if (body.classList == "light-mode") {
    toggleDarkMode.innerText = "Dark";
  } else {
    toggleDarkMode.textContent = "Light";
  }
});
