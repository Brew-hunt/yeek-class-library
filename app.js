const grid = document.getElementById("class-grid");
const searchInput = document.getElementById("search-input");
const count = document.getElementById("class-count");
const emptyState = document.getElementById("empty-state");
const modal = document.getElementById("video-modal");
const videoFrame = document.getElementById("video-frame");
const closeModalButton = document.getElementById("close-modal");

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function hasDriveId(id) {
  return typeof id === "string" && id.trim().length > 5 && !id.includes("PASTE_GOOGLE_DRIVE_FILE_ID");
}

function createCard(item, index) {
  const card = document.createElement("article");
  card.className = "class-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Watch ${item.title}`);
  card.innerHTML = `
    <div class="card-image-wrap">
      <img class="card-image" src="${item.thumbnail}" alt="" loading="lazy">
      <span class="card-index">${String(index + 1).padStart(2, "0")} / ${String(classes.length).padStart(2, "0")}</span>
      <span class="play-button" aria-hidden="true">▶</span>
    </div>
    <div class="card-content">
      <span class="card-category">${item.category}</span>
      <h3 class="card-title">${item.title}</h3>
      <div class="card-facilitator">
        <span class="facilitator-avatar">${initials(item.facilitator)}</span>
        <div class="facilitator-info">
          <strong>${item.facilitator}</strong>
          <span>${item.role}</span>
        </div>
        <span class="card-duration">${item.duration}</span>
      </div>
    </div>`;
  card.addEventListener("click", () => openClass(item));
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openClass(item);
    }
  });
  return card;
}

function renderClasses(query = "") {
  const term = query.trim().toLowerCase();
  const filtered = classes.filter(item =>
    [item.title, item.facilitator, item.role, item.category].some(value => String(value || "").toLowerCase().includes(term))
  );

  grid.replaceChildren(...filtered.map(createCard));
  count.textContent = `${String(filtered.length).padStart(2, "0")} SESSIONS`;
  emptyState.hidden = filtered.length !== 0;
  const hasAnyClasses = classes.length > 0;
  document.querySelector(".toolbar").hidden = !hasAnyClasses;
  document.getElementById("empty-title").textContent = hasAnyClasses ? "No sessions found" : "No classes published yet";
  document.getElementById("empty-message").textContent = hasAnyClasses
    ? "Try another class title or facilitator name."
    : "Recorded YEEK sessions will appear here as they are added. Check back soon.";
}

function openClass(item) {
  document.getElementById("modal-title").textContent = item.title;
  document.getElementById("modal-facilitator").textContent = `${item.facilitator} · ${item.role}`;
  document.getElementById("modal-bio").textContent = item.bio;
  document.getElementById("modal-duration").textContent = item.duration;

  if (hasDriveId(item.driveId)) {
    const frame = document.createElement("iframe");
    frame.src = `https://drive.google.com/file/d/${encodeURIComponent(item.driveId)}/preview`;
    frame.title = `Video recording: ${item.title}`;
    frame.allow = "autoplay; fullscreen";
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    videoFrame.replaceChildren(frame);
  } else {
    const message = document.createElement("div");
    message.className = "video-error";
    const heading = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Recording link not added yet.";
    heading.append(strong);
    const detail = document.createElement("p");
    detail.textContent = "Add the approved Google Drive file ID to this class in classes.js.";
    message.append(heading, detail);
    videoFrame.replaceChildren(message);
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeModalButton.focus();
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  videoFrame.replaceChildren(); // Stops playback when the player closes.
  document.body.style.overflow = "";
}

searchInput.addEventListener("input", event => renderClasses(event.target.value));
closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", event => {
  if (event.target.matches("[data-close-modal]")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

renderClasses();
