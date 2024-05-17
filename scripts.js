import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Generates book elements
function renderBooks(books) {
  const starting = document.createDocumentFragment();
  books.forEach((book) => {
    const element = createBookElement(book);
    starting.appendChild(element);
  });
  document.querySelector("[data-list-items]").appendChild(starting);
  showMoreBtn();
}

renderBooks(matches.slice(0, BOOKS_PER_PAGE));

// Button element with preview information - image & info
function createBookElement({ author, id, image, title }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

  return element;
}

// Function to create an option element
function createOptionElement(text, value) {
  const element = document.createElement("option");
  element.value = value;
  element.innerText = text;
  return element;
}

createOptionElement();

// Function to render genre options in the dropdown
function renderGenres() {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = createOptionElement("All Genre", "any");
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = createOptionElement(name, id);
    genreHtml.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);
}

renderGenres();

// Function to render author options in the dropdown
function renderAuthors() {
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = createOptionElement("All authors", "any");
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = createOptionElement(name, id);
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
}

renderAuthors();

// Theme Settings
function setTheme(theme) {
  const isDark = theme === "night";
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty(
    "--color-dark",
    isDark ? "255, 255, 255" : "10, 10, 20"
  );
  document.documentElement.style.setProperty(
    "--color-light",
    isDark ? "10, 10, 20" : "255, 255, 255"
  );
}

//Theme function application
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setTheme(theme);
    document.querySelector("[data-settings-overlay]").open = false;
  });

// Function to update the "Show More" button's state and label
function showMoreBtn() {
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;

  // Update the button's inner HTML to show remaining number of books
  document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>`;
}

// Initialize the "Show More" button with the number of books left to display
document.querySelector("[data-list-button]").innerText = `Show more (${
  books.length - BOOKS_PER_PAGE
})`;

// Add click event listener to the "Show More" button
document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  renderBooks(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)
  );
  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  showMoreBtn();
});

// Function to filter books based on provided filters
function filterBooks(books, filters) {
  const filteredBooks = books.filter((book) => {
    let genreMatch = filters.genre === "any";

    // Loop through each genre of the current book
    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    return (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    );
  });

  return filteredBooks;
}

// Add event listener for the search form submission
document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = filterBooks(books, filters);

    page = 1;
    matches = result;

    // Show or hide the message based on the filter results
    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    renderBooks(matches.slice(0, BOOKS_PER_PAGE));

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
});

// Event listener for the search modal cancel button
document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

// Event listener for the settings modal cancel button
document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
});

// Event listener for the search button
document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

// Event listener for the settings button
document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
});

// Event listener for the list close button
document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

// Event listener for clicks on the book list
document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
});
