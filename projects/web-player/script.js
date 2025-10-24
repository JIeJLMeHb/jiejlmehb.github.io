const defaultTracks = [
    {
      title: "Царица",
      artist: "Анна Асти",
      src: "Tracks/ANNA ASTI - Carica.mp3",
      cover: "assets/Background.jpg",
    },
    {
        title: "UP",
        artist: "INNA",
        src: "Tracks/Inna - UP.mp3",
        cover: "assets/Background.jpg",
    },
    {
        title: "The Dead Dance",
        artist: "Lady gaga",
        src: "Tracks/Lady Gaga - The Dead Dancе.mp3",
        cover: "assets/Background.jpg",
    },
  ];
  
  const state = {
    tracks: [...defaultTracks],
    currentIndex: -1,
    isPlaying: false,
    isLoop: false,
  };
  
  const el = {
    audio: document.getElementById("audio"),
    listView: document.getElementById("listView"),
    playerView: document.getElementById("playerView"),
    trackList: document.getElementById("trackList"),
    nowBar: document.getElementById("nowPlayingBar"),
    npCover: document.getElementById("npCover"),
    npTitle: document.getElementById("npTitle"),
    npArtist: document.getElementById("npArtist"),
    npPrev: document.getElementById("npPrev"),
    npPlayPause: document.getElementById("npPlayPause"),
    npNext: document.getElementById("npNext"),
    npVolume: document.getElementById("npVolume"),
  
    playerCover: document.getElementById("playerCover"),
    playerTitle: document.getElementById("playerTitle"),
    playerArtist: document.getElementById("playerArtist"),
    prevBtn: document.getElementById("prevBtn"),
    playPauseBtn: document.getElementById("playPauseBtn"),
    nextBtn: document.getElementById("nextBtn"),
    volumeSlider: document.getElementById("volumeSlider"),
    seekSlider: document.getElementById("seekSlider"),
    currentTime: document.getElementById("currentTime"),
    durationTime: document.getElementById("durationTime"),
  
    playAlbumBtn: document.getElementById("playAlbumBtn"),
    randomBtn: document.getElementById("randomBtn"),
    loopBtn: document.getElementById("loopBtn"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    shuffleTracksBtn: document.getElementById("shuffleTracksBtn"),
  
    backToList: document.getElementById("backToList"),
  
    settingsBtn: document.getElementById("settingsBtn"),
    settingsMenu: document.getElementById("settingsMenu"),
    accentPicker: document.getElementById("accentPicker"),
    addUrlBtn: document.getElementById("addUrlBtn"),
    urlTitle: document.getElementById("urlTitle"),
    urlArtist: document.getElementById("urlArtist"),
    urlSrc: document.getElementById("urlSrc"),
    fileInput: document.getElementById("fileInput"),
  };

function saveState() {
    const data = {
      tracks: state.tracks,
      theme: document.documentElement.getAttribute("data-theme"),
      accent: getComputedStyle(document.documentElement).getPropertyValue("--accent"),
      volume: el.audio.volume,
    };
    localStorage.setItem("musicPlayerState", JSON.stringify(data));
  }
  
  function loadState() {
    const saved = localStorage.getItem("playerState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tracks && parsed.tracks.length) {
          state.tracks = parsed.tracks;
        }
      } catch (e) {
        console.warn("Ошибка загрузки state:", e);
      }
    }
  }
  
  
  loadState();
  renderTrackList();
  bindGlobalEvents();
  updateUI();
  
  function renderTrackList() {
    el.trackList.innerHTML = "";
    state.tracks.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "track-item";
      li.dataset.index = i;
  
      const img = document.createElement("img");
      img.className = "track-cover";
      img.src = t.cover || "assets/Background.jpg";
  
      const info = document.createElement("div");
      const title = document.createElement("div");
      title.className = "track-title";
      title.textContent = t.title;
      const artist = document.createElement("div");
      artist.className = "track-artist";
      artist.textContent = t.artist;
      info.appendChild(title);
      info.appendChild(artist);
  
      const duration = document.createElement("div");
      duration.className = "track-duration";
      duration.textContent = t.external ? "—" : "…";
  
      if (!t.external) {
        loadDuration(t.src).then(d => duration.textContent = formatTime(d)).catch(() => duration.textContent = "—");
      }
  
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn icon";
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Удалить трек";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTrack(i);
      });
  
      li.appendChild(img);
      li.appendChild(info);
      li.appendChild(duration);
      li.appendChild(deleteBtn);
  
      li.addEventListener("click", () => {
        playIndex(i);
        switchToView("player");
      });
  
      el.trackList.appendChild(li);
    });
    markActive();
  }
  
  function bindGlobalEvents() {
    el.playAlbumBtn.addEventListener("click", () => {
      if (!state.tracks.length) return;
      playIndex(0);
    });
  
    el.randomBtn.addEventListener("click", () => {
      if (!state.tracks.length) return;
      const i = Math.floor(Math.random() * state.tracks.length);
      playIndex(i);
    });
  
    el.loopBtn.addEventListener("click", () => {
        state.isLoop = !state.isLoop;
        el.audio.loop = state.isLoop;
      
        if (state.isLoop) {
          el.loopBtn.classList.add("loop-on");
          el.loopBtn.classList.remove("loop-off");
        } else {
          el.loopBtn.classList.add("loop-off");
          el.loopBtn.classList.remove("loop-on");
        }
      });
      
  
    el.shuffleBtn.addEventListener("click", () => {
      shuffleArray(state.tracks);
      renderTrackList();
    });
  
    el.shuffleTracksBtn.addEventListener("click", () => {
      shuffleArray(state.tracks);
      renderTrackList();
    });
  
    el.npPrev.addEventListener("click", prevTrack);
    el.npNext.addEventListener("click", nextTrack);
    el.npPlayPause.addEventListener("click", togglePlayPause);
    el.npVolume.addEventListener("input", (e) => {
      el.audio.volume = Number(e.target.value);
      el.volumeSlider.value = e.target.value;
    });
  
    el.prevBtn.addEventListener("click", prevTrack);
    el.nextBtn.addEventListener("click", nextTrack);
    el.playPauseBtn.addEventListener("click", togglePlayPause);
    el.volumeSlider.addEventListener("input", (e) => {
      el.audio.volume = Number(e.target.value);
      el.npVolume.value = e.target.value;
    });

    el.seekSlider.addEventListener("input", (e) => {
      const percent = Number(e.target.value);
      const dur = el.audio.duration || 0;
      el.audio.currentTime = (percent / 100) * dur;
    });
  
    el.audio.addEventListener("timeupdate", () => {
      const cur = el.audio.currentTime || 0;
      const dur = el.audio.duration || 0;
      el.currentTime.textContent = formatTime(cur);
      el.durationTime.textContent = isFinite(dur) ? formatTime(dur) : "0:00";
      el.seekSlider.value = dur ? (cur / dur) * 100 : 0;
    });
  
    el.audio.addEventListener("ended", () => {
      if (state.isLoop) {
        el.audio.currentTime = 0;
        el.audio.play();
        return;
      }
      nextTrack();
    });
  
    el.backToList.addEventListener("click", () => switchToView("list"));
  
    el.settingsBtn.addEventListener("click", () => {
      el.settingsMenu.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!el.settingsMenu.contains(e.target) && e.target !== el.settingsBtn) {
        el.settingsMenu.classList.remove("open");
      }
    });
  
    el.settingsMenu.querySelectorAll("button[data-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        document.documentElement.setAttribute("data-theme", theme);
      });
    });
  
    el.accentPicker.addEventListener("input", (e) => {
      const color = e.target.value;
      document.documentElement.style.setProperty("--accent", color);
      document.documentElement.setAttribute("data-theme", "custom");
    });
  
    el.addUrlBtn.addEventListener("click", () => {
        const title = el.urlTitle.value.trim() || "Без названия";
        const artist = el.urlArtist.value.trim() || "Неизвестный";
        const src = el.urlSrc.value.trim();
        if (!src) return;
      
        if (src.includes("soundcloud.com")) {
          addTrack({
            title,
            artist,
            external: { type: "soundcloud", url: src },
            cover: "https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14bdb.ico"
          });
        } else if (src.includes("music.youtube.com")) {
          addTrack({
            title,
            artist,
            external: { type: "ytmusic", url: src },
            cover: "https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png"
          });
        } else if (src.endsWith(".mp3")) {
          addTrack({ title, artist, src });
        } else {
          alert("Поддерживаются только .mp3, SoundCloud и YouTube Music");
        }
      
        el.urlTitle.value = "";
        el.urlArtist.value = "";
        el.urlSrc.value = "";
        saveState();
      });
  
    el.fileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        if (file.type !== "audio/mpeg" && !file.name.endsWith(".mp3")) continue;
        const objectUrl = URL.createObjectURL(file);
        addTrack({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Локальный файл",
          src: objectUrl,
          cover: "assets/Background.jpg",
        });
      }
      e.target.value = "";
    });
  }
  
  function addTrack(track) {
    const t = {
      title: track.title || "Без названия",
      artist: track.artist || "Неизвестный",
      src: track.src || null,
      cover: track.cover || "assets/Background.jpg",
      external: track.external || null,
    };
    state.tracks.push(t);
    renderTrackList();
    saveState();
  }
  
  function playIndex(index) {
    if (index < 0 || index >= state.tracks.length) return;
    state.currentIndex = index;
    const t = state.tracks[index];
  
    if (t.external) {
      if (t.external.type === "soundcloud") {
        window.open(t.external.url, "_blank");
      } else if (t.external.type === "ytmusic") {
        window.open(t.external.url, "_blank");
      }
      showNowPlaying(t);
      markActive();
      saveState();
      return;
    }
    el.audio.src = t.src;
    el.audio.play().then(() => {
      state.isPlaying = true;
      updateUI();
      showNowPlaying(t);
      saveState();
    }).catch(() => {
      state.isPlaying = false;
      updateUI();
      showNowPlaying(t);
    });
  
    el.playerCover.src = t.cover;
    el.playerTitle.textContent = t.title;
    el.playerArtist.textContent = t.artist;
  
    markActive();
  }
  
  function togglePlayPause() {
    if (!el.audio.src) {
      if (state.tracks.length) playIndex(0);
      return;
    }
    if (el.audio.paused) {
      el.audio.play();
      state.isPlaying = true;
    } else {
      el.audio.pause();
      state.isPlaying = false;
    }
    updateUI();
  }
  
  function prevTrack() {
    if (!state.tracks.length) return;
    const next = (state.currentIndex - 1 + state.tracks.length) % state.tracks.length;
    playIndex(next);
  }
  
  function nextTrack() {
    if (!state.tracks.length) return;
    const next = (state.currentIndex + 1) % state.tracks.length;
    playIndex(next);
  }
  
  function showNowPlaying(t) {
    el.nowBar.classList.remove("hidden");
    el.npCover.src = t.cover;
    el.npTitle.textContent = t.title;
    el.npArtist.textContent = t.artist;
  }
  
  function switchToView(name) {
    if (name === "list") {
      el.listView.classList.add("active");
      el.playerView.classList.remove("active");
    } else {
      el.playerView.classList.add("active");
      el.listView.classList.remove("active");
    }
  }
  
  function updateUI() {
    if (el.audio.paused) {
      el.playPauseBtn.classList.add("play-btn");
      el.playPauseBtn.classList.remove("pause-btn");
  
      el.npPlayPause.classList.add("play-btn");
      el.npPlayPause.classList.remove("pause-btn");
    } else {
      el.playPauseBtn.classList.add("pause-btn");
      el.playPauseBtn.classList.remove("play-btn");
  
      el.npPlayPause.classList.add("pause-btn");
      el.npPlayPause.classList.remove("play-btn");
    }
  }
  
  
  function markActive() {
    document.querySelectorAll(".track-item").forEach((li) => li.classList.remove("active"));
    if (state.currentIndex >= 0) {
      const active = el.trackList.querySelector(`.track-item[data-index="${state.currentIndex}"]`);
      if (active) active.classList.add("active");
    }
  }
  
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  function loadDuration(src) {
    return new Promise((resolve, reject) => {
      const a = new Audio();
      a.src = src;
      a.preload = "metadata";
      a.addEventListener("loadedmetadata", () => {
        if (isFinite(a.duration)) resolve(a.duration);
        else reject();
      });
      a.addEventListener("error", reject);
    });
  }
  
  function formatTime(s) {
    s = Math.floor(s || 0);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function deleteTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;
  
    const wasPlaying = index === state.currentIndex;
  
    state.tracks.splice(index, 1);
  
    if (wasPlaying) {
      el.audio.pause();
      el.audio.src = "";
      el.scContainer.innerHTML = "";
      el.scContainer.classList.add("hidden");
      el.nowBar.classList.add("hidden");
      state.currentIndex = -1;
      state.isPlaying = false;
    } else if (index < state.currentIndex) {
      state.currentIndex -= 1;
    }
  
    renderTrackList();
    updateUI();
    saveState();
  }
  