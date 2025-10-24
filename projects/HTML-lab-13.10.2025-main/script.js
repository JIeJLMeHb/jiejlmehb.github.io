let users = JSON.parse(localStorage.getItem("usersDB")) || {};
let currentUser = null;

function showBlock(id) {
  document.querySelectorAll('.block').forEach(b => b.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (!u || !p) { alert("Введите логин и пароль"); return; }

  if (u === "admin" && p === "admin123") {
    currentUser = u;
    renderAdminUsers();
    showBlock('adminPanel');
    return;
  }

  if (users[u] && users[u] === p) {
    currentUser = u;
    document.getElementById('welcomeText').innerText =
      `Добро пожаловать, ${u}! Хотите заново пройти анкетирование?`;
    document.getElementById('welcomeQuestion').style.display = 'block';
  } else {
    users[u] = p;
    localStorage.setItem("usersDB", JSON.stringify(users));
    currentUser = u;
    document.getElementById("userTitle").innerText = currentUser;
    showBlock('block2');
  }
}

function restartSurvey(answer) {
  if (answer) {
    document.getElementById("userTitle").innerText = currentUser;
    showBlock('block2');
  } else {
    alert("Хорошо, анкетирование пропущено.");
  }
}

function submitSurvey() {
  const form = document.getElementById('surveyForm');
  const data = new FormData(form);
  let allFilled = true;
  let resultsHTML = "<ul>";

  for (let [key, value] of data.entries()) {
    if (!value.trim()) { allFilled = false; break; }
    resultsHTML += `<li>${key}: ${value}</li>`;
  }
  resultsHTML += "</ul>";

  if (!allFilled) {
    alert("Пожалуйста, заполните все поля анкеты!");
    return;
  }

  document.getElementById('results').innerHTML = resultsHTML;
  document.getElementById("userTitleResults").innerText = currentUser;
  showBlock('block3');
}

function renderAdminUsers() {
  const container = document.getElementById("adminUsers");
  if (!Object.keys(users).length) {
    container.innerHTML = "<p>База пуста</p>";
    return;
  }
  let html = "<table border='1' cellpadding='6'><tr><th>Username</th><th>Password</th><th>Действие</th></tr>";
  for (let u in users) {
    html += `<tr>
               <td>${u}</td>
               <td>${users[u]}</td>
               <td><button onclick="deleteUser('${u}')">Удалить</button></td>
             </tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

function deleteUser(username) {
  if (confirm(`Удалить пользователя ${username}?`)) {
    delete users[username];
    localStorage.setItem("usersDB", JSON.stringify(users));
    renderAdminUsers();
  }
}

function clearDB() {
  if (confirm("Очистить всю базу пользователей?")) {
    users = {};
    localStorage.removeItem("usersDB");
    renderAdminUsers();
  }
}
