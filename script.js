    const playlist = [
      { id: 1, title: 'Царица', artist: 'Anna Asti', duration: '3:35', src: 'source/Anna Asti - Царица.mp3', cover:'covers/carica.jpeg' },
      { id: 2, title: 'БИЗНЕС ВУМЕН', artist: 'Slava Marlow (feat. Aarne)', duration: '2:47', src: 'source/Slava Marlow - БИЗНЕС ВУМЕН (feat. Aarne).mp3', cover:'covers/bisneswomen.jpg'},
      { id: 3, title: 'Alors On Danse', artist: 'Stromae', duration: '3:27', src: 'source/Stromae - Alors On Danse.mp3', cover:'covers/Alors_on_danse.jpg' },
      { id: 4, title: 'Eva', artist: 'Винтаж (feat. Ева Польна)', duration: '4:10', src: 'source/Винтаж - Eva (feat. Ева Польна).mp3', cover:'covers/eva.jpg' }
    ];

    const audio = document.getElementById('audio');
    const tracksList = document.getElementById('tracksList');
    const nowTitle = document.getElementById('nowTitle');
    const nowArtist = document.getElementById('nowArtist');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const seekBar = document.getElementById('seekBar');
    const volumeBar = document.getElementById('volumeBar');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 0;
    let isReady = false;

    function loadTrack(index, autoplay = false) {
      currentIndex = index;
      const track = playlist[currentIndex];
      audio.src = track.src;
      nowTitle.textContent = track.title;
      nowArtist.textContent = track.artist;
      isReady = false;
      playPauseIcon.src = 'icons/play.svg';
      audio.load();
      if (autoplay) audio.play();
      const coverEl = document.getElementById('cover');
      if (track.cover) {
      coverEl.style.backgroundImage = `url(${track.cover})`;
      coverEl.style.backgroundSize = 'cover';
      coverEl.style.backgroundPosition = 'center';
      } else {
      coverEl.style.backgroundImage = '';
      coverEl.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))';
    }
    }

    function formatTime(sec) {
      if (isNaN(sec) || sec === Infinity) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' + s : s}`;
    }

    audio.addEventListener('loadedmetadata', () => {
      isReady = true;
      durationEl.textContent = formatTime(audio.duration);
      seekBar.value = 0;
    });

    audio.addEventListener('timeupdate', () => {
      currentTimeEl.textContent = formatTime(audio.currentTime);
      if (audio.duration) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    audio.addEventListener('ended', () => {
      nextTrack();
    });

    function togglePlay() {
      if (!isReady && audio.src) {
        audio.play();
        playPauseIcon.src = 'icons/pause.svg';
        return;
      }
      if (audio.paused) {
        audio.play();
        playPauseIcon.src = 'icons/pause.svg';
      } else {
        audio.pause();
        playPauseIcon.src = 'icons/play.svg';
      }
    }

    function prevTrack() {
      const nextIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      loadTrack(nextIndex, true);
    }

    function nextTrack() {
      const nextIndex = (currentIndex + 1) % playlist.length;
      loadTrack(nextIndex, true);
    }

    function randomTrack() {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
        loadTrack(nextIndex, true);
    }

document.getElementById('randomBtn').addEventListener('click', randomTrack);

    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    seekBar.addEventListener('input', (e) => {
      if (audio.duration) {
        const pct = e.target.value / 100;
        audio.currentTime = audio.duration * pct;
      }
    });

    volumeBar.addEventListener('input', (e) => {
      audio.volume = Number(e.target.value);
    });

function renderTracks() {
    tracksList.innerHTML = '';
    playlist.forEach((t, i) => {
      const el = document.createElement('div');
      el.className = 'track';
      el.innerHTML = `
  <div class="track__thumb">
  ${t.cover ? `<img src="${t.cover}" alt="${t.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : ''}
  </div>
  <div class="track__meta">
  <div class="track__title">${t.title}</div>
  <div class="track__artist">${t.artist}</div>
  </div>
  <div style="display:flex; align-items:center; gap:8px;">
  <div class="track__duration">${t.duration}</div>
  <!-- Кнопка скачивания -->
  <a href="${t.src}" download="${t.title}.mp3" class="icon-link" title="Скачать ${t.title}">
  <img class="icon" src="icons/download.svg" alt="Download"/>
  </a> </div>
`;
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        loadTrack(i, true);
      });
      tracksList.appendChild(el);
    });
  }

  renderTracks();
    loadTrack(0, false);
