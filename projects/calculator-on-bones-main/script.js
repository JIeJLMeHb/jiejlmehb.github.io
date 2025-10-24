const config = {
    rods: [
      { label: "Единицы", base: 10, beads: 10 },
      { label: "Десятки", base: 10, beads: 10 },
      { label: "Сотни", base: 10, beads: 10 },
      { label: "Тысячи", base: 10, beads: 10 },
      { label: "Дес. тысяч", base: 10, beads: 10 },
      { label: "Сотни тысяч", base: 10, beads: 10 },
      { label: "Миллионы", base: 10, beads: 10 },
      { label: "Дес. мил.", base: 10, beads: 10 },
      { label: "4 костяшки", base: 10, beads: 4 },
      { label: "Ещё ряд", base: 10, beads: 10 },
      { label: "Ещё один", base: 10, beads: 10 },
      { label: "И ещё", base: 10, beads: 10 },
    ]
  };

  const rodsEl = document.getElementById('rods');
  const valueDisplay = document.getElementById('valueDisplay');
  const resetBtn = document.getElementById('reset');
  const state = config.rods.map(() => 0);

  function createRod(index, label, beadsCount) {
    const rod = document.createElement('div');
    rod.className = 'rod';
    rod.dataset.index = index;

    const rodLabel = document.createElement('div');
    rodLabel.className = 'rod-label';
    rodLabel.textContent = label;
    rod.appendChild(rodLabel);

    const divider = document.createElement('div');
    divider.className = 'divider';
    rod.appendChild(divider);

    const beads = [];
    for (let i = 0; i < beadsCount; i++) {
      const bead = document.createElement('div');
      bead.className = 'bead ' + (i < beadsCount/2 ? 'light' : 'dark');
      bead.dataset.rod = index;
      bead.dataset.index = i;
      rod.appendChild(bead);
      beads.push(bead);
    }

    layoutBeads(rod, beads, state[index]);
    rod.addEventListener('click', (e) => {
      const x = e.offsetX;
      const dividerX = rod.clientWidth * 0.5;
      const rodIdx = parseInt(rod.dataset.index, 10);
      if (x >= dividerX) {
        if (state[rodIdx] < beads.length) state[rodIdx]++;
      } else {
        if (state[rodIdx] > 0) state[rodIdx]--;
      }
      layoutBeads(rod, beads, state[rodIdx]);
      updateValue();
    });

    window.addEventListener('resize', () => layoutBeads(rod, beads, state[index]));
    return rod;
  }

  function layoutBeads(rod, beads, activeCount) {
    const rect = rod.getBoundingClientRect();
    const beadSize = 34;
    const gap = 4;
    const leftStart = 8;
    const rightStart = rect.width - beadSize - 8;

    for (let i = activeCount; i < beads.length; i++) {
      const bead = beads[i];
      const offset = (i - activeCount) * (beadSize + gap);
      bead.style.left = (leftStart + offset) + 'px';
    }
    
    for (let i = 0; i < activeCount; i++) {
      const bead = beads[i];
      const offset = (activeCount - 1 - i) * (beadSize + gap);
      bead.style.left = (rightStart - offset) + 'px';
    }
  }

  function updateValue() {
    let total = 0;
    let multiplier = 1;
    for (let i = 0; i < config.rods.length; i++) {
      total += state[i] * multiplier;
      multiplier *= config.rods[i].base;
    }
    valueDisplay.textContent = `Значение: ${total}`;
  }

  function build() {
    rodsEl.innerHTML = '';
    const fragments = [];
    for (let i = 0; i < config.rods.length; i++) {
      const rod = createRod(i, config.rods[i].label, config.rods[i].beads);
      fragments.push(rod);
    }
    fragments.forEach(el => rodsEl.appendChild(el));
    updateValue();
  }

  resetBtn.addEventListener('click', () => {
    const frame = document.querySelector('.frame');
    const rods = document.querySelector('.rods');
  
    frame.classList.add('tilted');
    rods.classList.add('slide-left');
  
    setTimeout(() => {
      for (let i = 0; i < state.length; i++) state[i] = 0;
      build();
  
      frame.classList.remove('tilted');
      rods.classList.remove('slide-left');
    }, 1200);
  });

  build();
  