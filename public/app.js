let achievements = [];
let categories = {};
let currentCategory;

// Laad achievements vanuit de server
async function loadAchievements(category) {
  if (!category) {
    updateEmptyTableHeader();
    renderEmptyAchievements();
    return;
  }

  const response = await fetch(`/api/achievements?category=${encodeURIComponent(category)}`);

  if (!response.ok) { // if status not between 200-299 -> not ok
    updateEmptyTableHeader();
    renderEmptyAchievements();
    return;
  }

  achievements = await response.json();
  updateTableHeader();
  renderAchievements();
}

// Render de lijst met achievements
function renderAchievements() {
  const tableBody = document.querySelector('#achievementsTable tbody');
  tableBody.replaceChildren(); // Make list empty by replacing them with noting

  achievements.forEach((achievement, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" data-index="${index}" ${achievement.completed ? 'checked' : ''}></td>
        <td>${achievement.name}</td>
        <td>${achievement.description}</td>
        <td>${achievement.points}</td>
      `;

      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => toggleCompleted(index));

      tableBody.appendChild(row);
  });
}

function renderEmptyAchievements() {
  const tableBody = document.querySelector('#achievementsTable tbody');
  tableBody.replaceChildren(); // Make list empty by replacing them with noting

  const row = document.createElement('tr');
  row.innerHTML = `
    <td></td>
    <td>No achievements found.</td>
    <td>Pick another option in the drop down menu to view other achievements.</td>
    <td></td>
  `;

  tableBody.appendChild(row);
}

function updateTableHeader() {
  const tableHeader = document.querySelector('#achievementsTable tr');

  let completed = 0;
  let totalCompleted = 0;

  let points = 0;
  let totalPoints = 0;

  achievements.forEach((achievement, index) => {
    if(achievement.completed == true) {
      completed++;
      points += achievement.points;
    }

    totalCompleted++;
    totalPoints += achievement.points;
  });


  tableHeader.innerHTML = `
    <th>Completed ${completed}/${totalCompleted}</th>
    <th>Name</th>
    <th>Description</th>
    <th>Points ${points}/${totalPoints}</th>
  `;
}

function updateEmptyTableHeader() {
  const tableHeader = document.querySelector('#achievementsTable tr');

  tableHeader.innerHTML = `
    <th>Completed</th>
    <th>Name</th>
    <th>Description</th>
    <th>Points</th>
  `;
}

// Toggle de completed state van een achievement
function toggleCompleted(index) {
  achievements[index].completed = !achievements[index].completed;

  updateTableHeader();
  saveProgress();
}

// Opslaan naar de server
async function saveProgress() {
  if (!currentCategory) {
    return;
  }

  const response = await fetch(`/api/achievements?category=${encodeURIComponent(currentCategory)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({category: currentCategory, achievements: achievements}),
  });

  const result = await response.json();
  console.log(result.message);
  // alert(result.message);
}

async function loadCategories() {
  const response = await fetch('/api/categories');
  categories = await response.json();
  renderCategories();
}

function renderCategories() {
  const dropDownMenu = document.querySelector('#categories');

  // Add event listener to menu
  dropDownMenu.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    loadAchievements(selectedValue);

    currentCategory = selectedValue;
  })
  
  for (const key in categories) {
    const option = document.createElement('option');
    option.value = key;
    option.innerHTML = categories[key];

    dropDownMenu.appendChild(option);
  }
}

// Initialisatie
loadAchievements();
loadCategories();
