class PlayerApp {
    constructor(block, tracks) {
        this.block = block;
        this.tracks = tracks;
        this.index = 0;

        this.listView = block.querySelector('.track-list-view');
        this.playerView = block.querySelector('.player-view');
        this.trackListEl = block.querySelector('.track-list');
        this.audio = block.querySelector('.audio');
        this.coverEl = block.querySelector('.cover');
        this.titleEl = block.querySelector('.track-title');
        this.artistEl = block.querySelector('.track-artist');
        this.playBtn = block.querySelector('.play-btn');
        this.prevBtn = block.querySelector('.prev-btn');
        this.nextBtn = block.querySelector('.next-btn');
        this.seekEl = block.querySelector('.seek');
        this.currentTimeEl = block.querySelector('.current-time');
        this.durationEl = block.querySelector('.duration');
        this.volumeEl = block.querySelector('.volume-range');
        this.backBtn = block.querySelector('.back-btn');
        this.randomBtn = block.querySelector('.random-btn');

        this.renderTrackList();
        this.bindEvents();
    }

    renderTrackList() {
        this.trackListEl.innerHTML = '';
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
        this.trackListEl.appendChild(li);
        });
    }

    bindEvents() {
        this.backBtn.onclick = () => { this.showView('list'); this.audio.pause(); };
        this.playBtn.onclick = () => { this.audio.paused ? this.audio.play() : this.audio.pause(); };
        this.prevBtn.onclick = () => this.prev();
        this.nextBtn.onclick = () => this.next();
        this.randomBtn.onclick = () => this.randomize();
        this.seekEl.oninput = e => { this.audio.currentTime = (e.target.value / 100) * this.audio.duration; };
        this.volumeEl.oninput = e => { this.audio.volume = e.target.value; };
        this.audio.ontimeupdate = () => this.updateProgress();
    }

    showView(name) {
        this.listView.classList.toggle('active', name === 'list');
        this.playerView.classList.toggle('active', name === 'player');
    }

    load(i) {
        const t = this.tracks[i];
        this.audio.src = t.src;
        this.coverEl.src = t.cover;
        this.titleEl.textContent = t.title;
        this.artistEl.textContent = t.artist;
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
        this.seekEl.value = dur ? (cur / dur) * 100 : 0;
        this.currentTimeEl.textContent = this.formatTime(cur);
        this.durationEl.textContent = this.formatTime(dur);
    }

    formatTime(sec) {
        if (!isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
const blocks = document.querySelectorAll('.player-block');

const tracks1 = [
    {src: 'storage/Dead Blonde - Банкомат.mp3', cover: 'storage/Imagine Dragons.jpeg', title: 'Банкомат', artist: 'Dead Blonde'},
    {src: 'storage/Inna - UP.mp3', cover: 'storage/UP.jpeg', title: 'UP', artist: 'Inna'},
    {src: 'storage/Matrang - Медуза.mp3', cover: 'storage/Medusa.jpeg', title:'МЕДУЗА', artist: 'Matrang'}
];
const tracks2 = [
    {src: 'storage/Imagine Dragons - thunder.mp3', cover: 'storage/Imagine Dragons.jpeg', title: 'Thunder', artist: 'Imagine Dragons'},
    {src: 'storage/Matrang - Медуза.mp3', cover: 'storage/Medusa.jpeg', title:'МЕДУЗА', artist: 'Matrang'},
    {src: 'storage/Inna - UP.mp3', cover: 'storage/UP.jpeg', title: 'UP', artist: 'Inna'}
];

new PlayerApp(blocks[0], tracks1);
new PlayerApp(blocks[1], tracks2);
});
