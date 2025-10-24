async function loadProjects() {
    try {
      const response = await fetch("projects.json");
      const projects = await response.json();
  
      const container = document.getElementById("projects");
  
      projects.forEach(proj => {
        const card = document.createElement("a");
        card.href = proj.path;
        card.className = "card";
        card.innerHTML = `
          <h3>${proj.title}</h3>
          <p>${proj.description}</p>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error("Ошибка загрузки проектов:", error);
    }
  }
  
  loadProjects();
  