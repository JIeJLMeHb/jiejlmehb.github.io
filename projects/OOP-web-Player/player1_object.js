const playerObject = {
audio: null,
tracks: [
    {src: 'storage/Dead Blonde - Банкомат.mp3', cover: 'storage/Imagine Dragons.jpeg', title: 'Банкомат', artist: 'Dead Blonde'},
    {src: 'storage/Inna - UP.mp3', cover: 'storage/UP.jpeg', title: 'UP', artist: 'Inna'},
    {src: 'storage/Matrang - Медуза.mp3', cover: 'storage/Medusa.jpeg', title:'МЕДУЗА', artist: 'Matrang'}
],
index: 0,

init() {
    const requiredIds = [
    'track-list',
    'track-list-view',
    'player-view',
    'audio',
    'cover',
    'track-title',
    'track-artist',
    'back-btn',
    'play-btn',
    'prev-btn',
    'next-btn',
    'seek',
    'current-time',
    'duration',
    'volume'
    ];
    const missing = requiredIds.filter(id => !document.getElementById(id));
    if (missing.length) {
    console.error('Отсутствуют элементы в HTML:', missing);
    console.error('Убедись, что index.html содержит два экрана и список (id="track-list").');
    return;
    }

    this.audio = document.getElementById('audio');
    this.renderTrackList();
    this.bindEvents();
},

renderTrackList() {
    const list = document.getElementById('track-list');
    if (!list) {
    console.error('Не найден контейнер списка треков: #track-list');
    return;
    }
    list.innerHTML = '';
    this.tracks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'track-card';
    li.innerHTML = `<img src="${t.cover}" alt=""><h3>${t.title}</h3><p>${t.artist}</p>`;
    li.onclick = () => {
        this.index = i;
        this.load(i);
        this.showView('player');
        this.audio.play();
    };
    list.appendChild(li);
    });
},

bindEvents() {
    document.getElementById('back-btn').onclick = () => { this.showView('list'); this.audio.pause(); };
    document.getElementById('play-btn').onclick = () => { this.audio.paused ? this.audio.play() : this.audio.pause(); };
    document.getElementById('prev-btn').onclick = () => this.prev();
    document.getElementById('next-btn').onclick = () => this.next();
    document.getElementById('random-btn').onclick = () => this.randomize();
    document.getElementById('seek').oninput = e => { this.audio.currentTime = (e.target.value / 100) * this.audio.duration; };
    document.getElementById('volume').oninput = e => { this.audio.volume = e.target.value; };
    this.audio.ontimeupdate = () => this.updateProgress();
},

showView(name) {
    document.getElementById('track-list-view').classList.toggle('active', name === 'list');
    document.getElementById('player-view').classList.toggle('active', name === 'player');
},

load(i) {
    const t = this.tracks[i];
    this.audio.src = t.src;
    document.getElementById('cover').src = t.cover;
    document.getElementById('track-title').textContent = t.title;
    document.getElementById('track-artist').textContent = t.artist;
},

prev() {
    this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
    this.load(this.index);
    this.audio.play();
},

next() {
    this.index = (this.index + 1) % this.tracks.length;
    this.load(this.index);
    this.audio.play();
},

updateProgress() {
    const cur = this.audio.currentTime;
    const dur = this.audio.duration || 0;
    document.getElementById('seek').value = dur ? (cur / dur) * 100 : 0;
    document.getElementById('current-time').textContent = this.formatTime(cur);
    document.getElementById('duration').textContent = this.formatTime(dur);
},

formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
},

randomize() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * this.tracks.length);
    } while (newIndex === this.index && this.tracks.length > 1); 
    this.index = newIndex;
    this.load(this.index);
    this.audio.play();
}
};
document.addEventListener('DOMContentLoaded', () => playerObject.init());
