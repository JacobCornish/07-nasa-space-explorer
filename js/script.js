// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// NASA API Key
const API_KEY = 'IkWp30bCOoAY8RSblTfA4usrigdHMSnOEoMMD4Uk';

// ─── Space Facts (Did You Know? / Space Term of the Day) ──────────────────────
const spaceFacts = [
  { term: "Black Hole", definition: "A region of spacetime where gravity is so strong that nothing—not even light—can escape once it crosses the event horizon." },
  { term: "Neutron Star", definition: "The ultra-dense remnant of a massive star after a supernova explosion, packing more mass than our Sun into a sphere just 20 km across." },
  { term: "Light-Year", definition: "The distance light travels in one year—about 9.46 trillion kilometers. The nearest star to our Sun is 4.24 light-years away." },
  { term: "Galaxy", definition: "A massive system of stars, gas, dust, and dark matter bound together by gravity. The Milky Way contains an estimated 100–400 billion stars." },
  { term: "Nebula", definition: "An interstellar cloud of gas and dust—the birthplace (and sometimes graveyard) of stars, often glowing in spectacular colors." },
  { term: "Pulsar", definition: "A rapidly rotating neutron star that emits beams of electromagnetic radiation. Some spin hundreds of times per second." },
  { term: "Dark Matter", definition: "An invisible substance comprising about 27% of the universe. It doesn't emit light but its gravitational effects shape the large-scale structure of the cosmos." },
  { term: "Supernova", definition: "A powerful stellar explosion marking the death of a massive star—briefly outshining entire galaxies and seeding space with heavy elements." },
  { term: "Event Horizon", definition: "The boundary around a black hole beyond which no information or matter can escape. It's not a physical surface, but a point of no return." },
  { term: "Quasar", definition: "Extremely luminous active galactic nuclei powered by supermassive black holes, some shining brighter than a trillion suns from billions of light-years away." },
  { term: "Red Dwarf", definition: "The most common type of star in the Milky Way—small, cool, and incredibly long-lived. Some are expected to burn for trillions of years." },
  { term: "Cosmic Inflation", definition: "A theory that the universe underwent an exponentially rapid expansion in the first fraction of a second after the Big Bang." },
  { term: "Magnetar", definition: "A type of neutron star with an extraordinarily powerful magnetic field—a trillion times stronger than Earth's." },
  { term: "Exoplanet", definition: "A planet orbiting a star outside our solar system. NASA has confirmed over 5,600 exoplanets, and the count keeps growing." },
  { term: "Solar Wind", definition: "A stream of charged particles flowing outward from the Sun at up to 800 km/s, shaping planetary magnetospheres and creating auroras." },
];

// Display a random space fact on load
function displaySpaceFact() {
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  document.getElementById('fact-term').textContent = fact.term;
  document.getElementById('fact-definition').textContent = fact.definition;
}
displaySpaceFact();

// ─── Button click handler ────────────────────────────────────────────────────
document.getElementById('getImagesBtn').addEventListener('click', fetchAPOD);

async function fetchAPOD() {
  const start = startInput.value;
  const end = endInput.value;

  if (!start || !end) {
    showError('Please select both a start and end date.');
    return;
  }
  if (start > end) {
    showError('Start date must be before end date.');
    return;
  }

  showLoading();

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }

    const data = await response.json();
    renderGallery(Array.isArray(data) ? data : [data]);
  } catch (err) {
    showError(`Failed to load images. ${err.message}`);
  }
}

// ─── Gallery Rendering ───────────────────────────────────────────────────────
function renderGallery(items) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  if (!items || items.length === 0) {
    gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🔭</div><p>No results found for this date range.</p></div>`;
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.style.animationDelay = `${index * 0.07}s`;

    const isVideo = item.media_type === 'video';

    if (isVideo) {
      // Video thumbnail using YouTube embed or fallback
      const videoId = extractYouTubeId(item.url);
      const thumbUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : null;

      card.innerHTML = `
        <div class="media-wrapper video-wrapper">
          ${thumbUrl
            ? `<img src="${thumbUrl}" alt="${item.title}" loading="lazy" />`
            : `<div class="video-placeholder"><span>▶</span></div>`
          }
          <div class="video-badge">▶ VIDEO</div>
        </div>
        <div class="card-info">
          <h3>${item.title}</h3>
          <time>${formatDate(item.date)}</time>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="media-wrapper">
          <img src="${item.url}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="card-info">
          <h3>${item.title}</h3>
          <time>${formatDate(item.date)}</time>
        </div>
      `;
    }

    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function openModal(item) {
  const modal = document.getElementById('modal');
  const isVideo = item.media_type === 'video';
  const videoId = isVideo ? extractYouTubeId(item.url) : null;

  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-date').textContent = formatDate(item.date);
  document.getElementById('modal-explanation').textContent = item.explanation;

  const mediaContainer = document.getElementById('modal-media');
  mediaContainer.innerHTML = '';

  if (isVideo) {
    if (videoId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.title = item.title;
      mediaContainer.appendChild(iframe);
    } else {
      const linkWrap = document.createElement('div');
      linkWrap.className = 'video-link-wrap';
      linkWrap.innerHTML = `<p>This entry is a video.</p><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="video-link-btn">▶ Watch Video</a>`;
      mediaContainer.appendChild(linkWrap);
    }
  } else {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    mediaContainer.appendChild(img);
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // Stop any playing video
  const iframe = modal.querySelector('iframe');
  if (iframe) iframe.src = iframe.src;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function showLoading() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading space photos…</p>
    </div>
  `;
}

function showError(msg) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = `
    <div class="placeholder">
      <p>${msg}</p>
    </div>
  `;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
