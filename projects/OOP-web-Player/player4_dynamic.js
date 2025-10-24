class PlayerApp {
    constructor() {
        this.tracks = [];
        this.index = 0;
        this.audio = document.getElementById('audio');
        this.bindEvents();
    }

    renderTrackList() {
        const list = document.getElementById('track-list');
        list.innerHTML = '';
        this.tracks.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = 'track-card';
        li.innerHTML = `<img src="${t.cover}"><h3>${t.title}</h3><p>${t.artist}</p>`;
        li.onclick = () => {
            this.index = i;
            this.load(i);
            this.showView('player');
            this.audio.play();
        };
        list.appendChild(li);
        });
    }

    bindEvents() {
        document.getElementById('back-btn').onclick = () => {
        this.showView('list');
        this.audio.pause();
        };
        document.getElementById('play-btn').onclick = () => {
        this.audio.paused ? this.audio.play() : this.audio.pause();
        };
        document.getElementById('prev-btn').onclick = () => this.prev();
        document.getElementById('next-btn').onclick = () => this.next();
        document.getElementById('random-btn').onclick = () => this.randomize();
        document.getElementById('seek').oninput = e => {
        this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
        };
        document.getElementById('volume').oninput = e => {
        this.audio.volume = e.target.value;
        };
        this.audio.ontimeupdate = () => this.updateProgress();

        const modal = document.getElementById('modal');
        const modalContent = modal.querySelector('.modal-content');
        const createBtn = document.getElementById('create-player-btn');
        const closeBtn = document.getElementById('close-modal');
        const addTrackBtn = document.getElementById('add-track-btn');
        let fileInput = document.getElementById('track-file');
        let srcInput = document.getElementById('track-src');
        let coverInput = document.getElementById('track-cover');
        let titleInput = document.getElementById('track-title');
        let artistInput = document.getElementById('track-artist');

        createBtn.onclick = () => modal.classList.remove('hidden');
        closeBtn.onclick = () => modal.classList.add('hidden');
        modal.onclick = e => { if (e.target === modal) modal.classList.add('hidden'); };
        modalContent.onclick = e => e.stopPropagation();

        addTrackBtn.onclick = () => {
        let src = srcInput.value.trim();
        if (fileInput.files.length > 0) {
            src = URL.createObjectURL(fileInput.files[0]);
        }
        let track = {
            src: src || 'storage/Dead Blonde - Банкомат.mp3',
            cover: coverInput.value || 'storage/Imagine Dragons.jpeg',
            title: titleInput.value || 'Без названия',
            artist: artistInput.value || 'Неизвестный'
        };


        this.tracks.push(track);
        this.renderTrackList();

        fileInput.value = '';
        srcInput.value = '';
        coverInput.value = '';
        titleInput.value = '';
        artistInput.value = '';
        modal.classList.add('hidden');
        };
    }

    showView(name) {
        document.getElementById('track-list-view').classList.toggle('active', name === 'list');
        document.getElementById('player-view').classList.toggle('active', name === 'player');
    }

    load(i) {
        const t = this.tracks[i];
        this.audio.src = t.src;
        document.getElementById('cover').src = t.cover;
        document.getElementById('track-title').textContent = t.title;
        document.getElementById('track-artist').textContent = t.artist;
    }

    prev() {
        this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
        this.load(this.index);
        this.audio.play();
    }

    next() {
        this.index = (this.index + 1) % this.tracks.length;
        this.load(this.index);
        this.audio.play();
    }

    randomize() {
        if (this.tracks.length === 0) return;
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.tracks.length);
        } while (newIndex === this.index && this.tracks.length > 1);
    
        this.index = newIndex;
        this.load(this.index);
        this.audio.play();
    }    

    updateProgress() {
        const cur = this.audio.currentTime, dur = this.audio.duration || 0;
        document.getElementById('seek').value = dur ? (cur / dur) * 100 : 0;
        document.getElementById('current-time').textContent = this.formatTime(cur);
        document.getElementById('duration').textContent = this.formatTime(dur);
    }

    formatTime(sec) {
        if (!isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
new PlayerApp();
});
