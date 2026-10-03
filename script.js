const CONFIG = {
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbweJ8dQniwYdvvGOGq37XheOdsfYJVQFywsPtcU1s7AnsYOsRqSZ5ag1uFG_amOs8FM/exec',
  DEFAULT_TIMER_SECONDS: 120,
  MAX_UPLOAD_SIZE_BYTES: 500 * 1024
};

const state = {
  images: [],
  currentIndex: 0,
  timerSeconds: CONFIG.DEFAULT_TIMER_SECONDS,
  isTimerRunning: false,
  timerInterval: null,
  lang: localStorage.getItem('app_lang') || 'id',
  appTitle: localStorage.getItem('app_title') || 'Interactive Gallery',
  audioPlaying: false,
  volume: 0.5,
  selectedFile: null,
  compressedBase64: null,
  inactivityTimeout: null
};

const i18n = {
  id: {
    editTitleHint: "Klik untuk mengedit judul",
    gallery: "Galeri",
    upload: "Unggah",
    noImages: "Belum Ada Gambar",
    uploadPrompt: "Silakan unggah gambar pertama Anda untuk memulai slideshow.",
    modalUploadTitle: "Unggah Gambar Baru",
    dragDropText: "Tarik & lepas file gambar ke sini atau",
    browseFile: "Cari File",
    cancel: "Batal",
    uploadAction: "Unggah Sekarang",
    modalGalleryTitle: "Kelola Daftar Galeri",
    confirmDelete: "Apakah Anda yakin ingin menghapus gambar ini?",
    uploadSuccess: "Gambar berhasil diunggah!",
    deleteSuccess: "Gambar berhasil dihapus!",
    compressing: "Mekompresi gambar..."
  },
  en: {
    editTitleHint: "Click to edit title",
    gallery: "Gallery",
    upload: "Upload",
    noImages: "No Images Available",
    uploadPrompt: "Please upload your first image to start the slideshow.",
    modalUploadTitle: "Upload New Image",
    dragDropText: "Drag & drop image file here or",
    browseFile: "Browse File",
    cancel: "Cancel",
    uploadAction: "Upload Now",
    modalGalleryTitle: "Manage Gallery",
    confirmDelete: "Are you sure you want to delete this image?",
    uploadSuccess: "Image uploaded successfully!",
    deleteSuccess: "Image deleted successfully!",
    compressing: "Compressing image..."
  }
};

class AtmosphericAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.intervalId = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = state.volume;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  setVolume(val) {
    state.volume = val;
    if (this.masterGain) this.masterGain.gain.value = val;
  }

  toggle() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.isMuted = !this.isMuted;
    if (!this.isMuted) this.startAtmosphere();
    else this.stopAtmosphere();
    return !this.isMuted;
  }

  startAtmosphere() {
    if (this.intervalId) return;
    let step = 0;
    this.intervalId = setInterval(() => {
      if (this.isMuted) return;
      this.playTone(step % 2 === 0 ? 110 : 130, 'sawtooth', 0.15, 0.2);
      if (step % 4 === 3) this.playTone(440, 'sine', 0.2, 0.4);
      step++;
    }, 500);
  }

  stopAtmosphere() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playTransitionSound() {
    this.playTone(587.33, 'triangle', 0.4, 0.2);
  }
}

const audioSys = new AtmosphericAudioSystem();

document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  initClock();
  initI18n();
  initAutoUIHider();
  initFullscreenHandler();
  fetchImagesFromGAS();
});

let dom = {};

function initDOM() {
  dom.app = document.getElementById('app');
  dom.appTitle = document.getElementById('appTitle');
  dom.timeDisplay = document.getElementById('timeDisplay');
  dom.dateDisplay = document.getElementById('dateDisplay');
  dom.mainImageViewer = document.getElementById('mainImageViewer');
  
  dom.topBar = document.getElementById('topBar');
  dom.bottomControls = document.getElementById('bottomControls');
  dom.imageMeta = document.getElementById('imageMeta');
  dom.lblImageName = document.getElementById('lblImageName');
  dom.lblImageCounter = document.getElementById('lblImageCounter');

  dom.timerCenterpiece = document.getElementById('timerCenterpiece');
  dom.timerButtons = document.getElementById('timerButtons');
  dom.lblTimer = document.getElementById('lblTimer');
  dom.timerProgress = document.getElementById('timerProgress');
  dom.btnTimerToggle = document.getElementById('btnTimerToggle');
  dom.playIcon = document.getElementById('playIcon');
  dom.btnTimerReset = document.getElementById('btnTimerReset');
  dom.btnAdd30s = document.getElementById('btnAdd30s');
  dom.btnAdd1m = document.getElementById('btnAdd1m');

  dom.navControls = document.getElementById('navControls');
  dom.btnPrev = document.getElementById('btnPrevImage');
  dom.btnNext = document.getElementById('btnNextImage');
  dom.btnDelete = document.getElementById('btnDeleteCurrent');
  dom.btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
  dom.fullscreenIcon = document.getElementById('fullscreenIcon');
  dom.emptyState = document.getElementById('emptyState');

  dom.uploadModal = document.getElementById('uploadModal');
  dom.galleryModal = document.getElementById('galleryModal');
  dom.btnOpenUpload = document.getElementById('btnOpenUpload');
  dom.btnOpenGallery = document.getElementById('btnOpenGallery');
  dom.dropZone = document.getElementById('dropZone');
  dom.fileInput = document.getElementById('fileInput');
  dom.btnSubmitUpload = document.getElementById('btnSubmitUpload');
  dom.uploadPreviewContainer = document.getElementById('uploadPreviewContainer');
  dom.uploadPreviewImg = document.getElementById('uploadPreviewImg');
  dom.lblFileName = document.getElementById('lblFileName');
  dom.lblFileSize = document.getElementById('lblFileSize');
  dom.uploadProgressBar = document.getElementById('uploadProgressBar');
  dom.uploadProgressFill = document.getElementById('uploadProgressFill');
  dom.galleryGrid = document.getElementById('galleryGrid');

  dom.btnAudioToggle = document.getElementById('btnAudioToggle');
  dom.audioIcon = document.getElementById('audioIcon');
  dom.volumeSlider = document.getElementById('volumeSlider');
  dom.btnLangId = document.getElementById('btnLangId');
  dom.btnLangEn = document.getElementById('btnLangEn');

  bindEvents();
}

function bindEvents() {
  dom.appTitle.textContent = state.appTitle;
  dom.appTitle.addEventListener('blur', () => {
    state.appTitle = dom.appTitle.textContent.trim() || 'Interactive Gallery';
    localStorage.setItem('app_title', state.appTitle);
  });

  dom.btnTimerToggle.addEventListener('click', toggleTimer);
  dom.btnTimerReset.addEventListener('click', () => resetTimer(CONFIG.DEFAULT_TIMER_SECONDS));
  dom.btnAdd30s.addEventListener('click', () => addTimerTime(30));
  dom.btnAdd1m.addEventListener('click', () => addTimerTime(60));

  dom.btnPrev.addEventListener('click', prevImage);
  dom.btnNext.addEventListener('click', nextImage);
  dom.btnDelete.addEventListener('click', deleteCurrentImage);
  dom.btnToggleFullscreen.addEventListener('click', toggleFullscreen);

  dom.btnLangId.addEventListener('click', () => switchLanguage('id'));
  dom.btnLangEn.addEventListener('click', () => switchLanguage('en'));

  dom.btnAudioToggle.addEventListener('click', () => {
    const isPlaying = audioSys.toggle();
    dom.audioIcon.className = isPlaying ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
  });
  dom.volumeSlider.addEventListener('input', (e) => audioSys.setVolume(e.target.value));

  dom.btnOpenUpload.addEventListener('click', () => openModal(dom.uploadModal));
  dom.btnOpenGallery.addEventListener('click', () => {
    renderGalleryGrid();
    openModal(dom.galleryModal);
  });

  document.querySelectorAll('.btnCloseModal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(dom.uploadModal);
      closeModal(dom.galleryModal);
      resetUploadForm();
    });
  });

  ['dragenter', 'dragover'].forEach(name => {
    dom.dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dom.dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dom.dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dom.dropZone.classList.remove('dragover');
    });
  });

  dom.dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) handleSelectedFile(e.dataTransfer.files[0]);
  });
  
  dom.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleSelectedFile(e.target.files[0]);
  });

  dom.btnSubmitUpload.addEventListener('click', uploadFileToGAS);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    dom.app.requestFullscreen().catch(err => {
      alert(`Gagal mengaktifkan mode Fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

function initFullscreenHandler() {
  document.addEventListener('fullscreenchange', () => {
    const isFS = !!document.fullscreenElement;
    dom.app.classList.toggle('is-fullscreen', isFS);
    dom.fullscreenIcon.className = isFS ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  });
}

function initClock() {
  const update = () => {
    const now = new Date();
    dom.timeDisplay.textContent = now.toLocaleTimeString(state.lang === 'id' ? 'id-ID' : 'en-US');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dom.dateDisplay.textContent = now.toLocaleDateString(state.lang === 'id' ? 'id-ID' : 'en-US', options);
  };
  update();
  setInterval(update, 1000);
}

function toggleTimer() {
  if (state.isTimerRunning) pauseTimer();
  else startTimer();
}

function startTimer() {
  if (state.images.length === 0) return;
  state.isTimerRunning = true;
  dom.playIcon.className = 'fa-solid fa-pause';
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerDisplay();

    if (state.timerSeconds <= 0) {
      audioSys.playTransitionSound();
      nextImage();
      resetTimer(CONFIG.DEFAULT_TIMER_SECONDS);
    }
  }, 1000);
}

function pauseTimer() {
  state.isTimerRunning = false;
  dom.playIcon.className = 'fa-solid fa-play';
  if (state.timerInterval) clearInterval(state.timerInterval);
}

function resetTimer(seconds) {
  state.timerSeconds = seconds;
  updateTimerDisplay();
  if (state.isTimerRunning) startTimer();
}

function addTimerTime(seconds) {
  state.timerSeconds += seconds;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(state.timerSeconds / 60);
  const secs = state.timerSeconds % 60;
  dom.lblTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const total = CONFIG.DEFAULT_TIMER_SECONDS;
  const progress = Math.max(0, state.timerSeconds / total);
  const offset = 283 - (progress * 283);
  dom.timerProgress.style.strokeDashoffset = offset;
}

function renderCurrentImage() {
  if (state.images.length === 0) {
    dom.mainImageViewer.classList.add('hidden');
    dom.emptyState.classList.remove('hidden');
    dom.lblImageName.textContent = '-';
    dom.lblImageCounter.textContent = '0 / 0';
    pauseTimer();
    return;
  }

  dom.emptyState.classList.add('hidden');
  dom.mainImageViewer.classList.remove('hidden');

  const curr = state.images[state.currentIndex];
  dom.mainImageViewer.classList.add('fade-out');
  setTimeout(() => {
    dom.mainImageViewer.src = curr.directUrl;
    dom.mainImageViewer.classList.remove('fade-out');
  }, 200);

  dom.lblImageName.textContent = curr.fileName;
  dom.lblImageCounter.textContent = `${state.currentIndex + 1} / ${state.images.length}`;
}

function nextImage() {
  if (state.images.length === 0) return;
  state.currentIndex = (state.currentIndex + 1) % state.images.length;
  renderCurrentImage();
  resetTimer(CONFIG.DEFAULT_TIMER_SECONDS);
}

function prevImage() {
  if (state.images.length === 0) return;
  state.currentIndex = (state.currentIndex - 1 + state.images.length) % state.images.length;
  renderCurrentImage();
  resetTimer(CONFIG.DEFAULT_TIMER_SECONDS);
}

async function fetchImagesFromGAS() {
  try {
    const res = await fetch(CONFIG.GAS_API_URL);
    const result = await res.json();
    if (result.status === 'success') {
      state.images = result.data || [];
      if (state.images.length > 0) {
        state.currentIndex = 0;
        renderCurrentImage();
        startTimer();
      } else {
        renderCurrentImage();
      }
    }
  } catch (err) {
    console.warn('Gagal memuat API GAS. Menggunakan fallback data.', err);
    state.images = [
      { id: '1', fileName: 'Sample Neon City', directUrl: 'https://picsum.photos/id/1015/1920/1080' },
      { id: '2', fileName: 'Sample Mountain Lake', directUrl: 'https://picsum.photos/id/1018/1920/1080' }
    ];
    renderCurrentImage();
  }
}

async function compressImageToMax500KB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file tidak valid'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        const getByteSize = (base64) => {
          const str = base64.split(',')[1] || base64;
          return Math.round((str.length * 3) / 4);
        };

        while (getByteSize(dataUrl) > CONFIG.MAX_UPLOAD_SIZE_BYTES && quality > 0.15) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (getByteSize(dataUrl) > CONFIG.MAX_UPLOAD_SIZE_BYTES) {
          let scale = 0.75;
          while (getByteSize(dataUrl) > CONFIG.MAX_UPLOAD_SIZE_BYTES && scale > 0.1) {
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            scale -= 0.15;
          }
        }

        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleSelectedFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  
  state.selectedFile = file;
  dom.btnSubmitUpload.disabled = true;
  dom.lblFileName.textContent = file.name;
  dom.lblFileSize.textContent = i18n[state.lang].compressing;
  dom.uploadPreviewContainer.classList.remove('hidden');

  try {
    const compressedDataUrl = await compressImageToMax500KB(file);
    state.compressedBase64 = compressedDataUrl;

    const base64Clean = compressedDataUrl.split(',')[1];
    const finalSizeKB = (Math.round((base64Clean.length * 3) / 4) / 1024).toFixed(1);

    dom.uploadPreviewImg.src = compressedDataUrl;
    dom.lblFileSize.textContent = `${finalSizeKB} KB (Terkompresi < 500 KB)`;
    dom.btnSubmitUpload.disabled = false;
  } catch (err) {
    alert('Gagal memproses gambar: ' + err.message);
    resetUploadForm();
  }
}

async function uploadFileToGAS() {
  if (!state.compressedBase64 || !state.selectedFile) return;

  dom.btnSubmitUpload.disabled = true;
  dom.uploadProgressBar.classList.remove('hidden');
  dom.uploadProgressFill.style.width = '30%';

  const payload = {
    action: 'upload',
    fileName: state.selectedFile.name.replace(/\.[^/.]+$/, "") + ".jpg",
    mimeType: 'image/jpeg',
    base64Data: state.compressedBase64
  };

  try {
    dom.uploadProgressFill.style.width = '70%';
    const res = await fetch(CONFIG.GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();

    if (result.status === 'success') {
      dom.uploadProgressFill.style.width = '100%';
      setTimeout(() => {
        closeModal(dom.uploadModal);
        state.images.push(result.data);
        state.currentIndex = state.images.length - 1;
        renderCurrentImage();
        resetUploadForm();
        alert(i18n[state.lang].uploadSuccess);
      }, 300);
    } else {
      throw new Error(result.message || 'Gagal menyimpan file.');
    }
  } catch (err) {
    alert('Proses upload gagal: ' + err.toString());
  } finally {
    dom.btnSubmitUpload.disabled = false;
    dom.uploadProgressBar.classList.add('hidden');
    dom.uploadProgressFill.style.width = '0%';
  }
}

async function deleteCurrentImage() {
  if (state.images.length === 0) return;
  const curr = state.images[state.currentIndex];
  if (!confirm(i18n[state.lang].confirmDelete)) return;

  try {
    const payload = { action: 'delete', id: curr.id };
    await fetch(CONFIG.GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    state.images.splice(state.currentIndex, 1);
    if (state.currentIndex >= state.images.length) {
      state.currentIndex = Math.max(0, state.images.length - 1);
    }
    renderCurrentImage();
    alert(i18n[state.lang].deleteSuccess);
  } catch (err) {
    alert('Hapus gagal: ' + err.toString());
  }
}

function resetUploadForm() {
  state.selectedFile = null;
  state.compressedBase64 = null;
  dom.fileInput.value = '';
  dom.uploadPreviewContainer.classList.add('hidden');
  dom.uploadProgressBar.classList.add('hidden');
  dom.uploadProgressFill.style.width = '0%';
  dom.btnSubmitUpload.disabled = true;
}

function renderGalleryGrid() {
  dom.galleryGrid.innerHTML = '';
  state.images.forEach((img, index) => {
    const card = document.createElement('div');
    card.className = 'grid-item';
    card.innerHTML = `
      <img src="${img.directUrl}" alt="${img.fileName}">
      <div class="grid-item-overlay">
        <button class="btn-circle btn-accent" onclick="selectFromGrid(${index})">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
    `;
    dom.galleryGrid.appendChild(card);
  });
}

window.selectFromGrid = function(index) {
  state.currentIndex = index;
  renderCurrentImage();
  closeModal(dom.galleryModal);
  resetTimer(CONFIG.DEFAULT_TIMER_SECONDS);
};

function initAutoUIHider() {
  const resetTimerHide = () => {
    // Tampilkan kembali elemen navigasi saat ada interaksi
    if (dom.topBar) dom.topBar.classList.remove('auto-hide');
    if (dom.imageMeta) dom.imageMeta.classList.remove('auto-hide');
    if (dom.timerButtons) dom.timerButtons.classList.remove('auto-hide');
    if (dom.navControls) dom.navControls.classList.remove('auto-hide');
    if (dom.bottomControls) dom.bottomControls.classList.remove('no-bg');

    clearTimeout(state.inactivityTimeout);

    state.inactivityTimeout = setTimeout(() => {
      if (state.isTimerRunning) {
        if (dom.topBar) dom.topBar.classList.add('auto-hide');
        if (dom.imageMeta) dom.imageMeta.classList.add('auto-hide');
        if (dom.timerButtons) dom.timerButtons.classList.add('auto-hide');
        if (dom.navControls) dom.navControls.classList.add('auto-hide');
        if (dom.bottomControls) dom.bottomControls.classList.add('no-bg');
        // dom.timerCenterpiece sengaja TIDAK disembunyikan agar selalu aktif!
      }
    }, 4000);
  };

  window.addEventListener('mousemove', resetTimerHide);
  window.addEventListener('touchstart', resetTimerHide);
  window.addEventListener('keydown', resetTimerHide);
}

function initI18n() { switchLanguage(state.lang); }

function switchLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('app_lang', lang);

  dom.btnLangId.classList.toggle('active', lang === 'id');
  dom.btnLangEn.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (i18n[lang][key]) el.title = i18n[lang][key];
  });
}

function openModal(modalEl) { modalEl.classList.remove('hidden'); }
function closeModal(modalEl) { modalEl.classList.add('hidden'); }
