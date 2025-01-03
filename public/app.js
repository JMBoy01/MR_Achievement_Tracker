let achievements = [];
let categories = {};
let currentCategory;

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

function renderAchievements() {
  const tableBody = document.querySelector('#achievementsTable tbody');
  tableBody.replaceChildren(); // Make list empty by replacing them with noting

  achievements.forEach((achievement, index) => {
      const row = document.createElement('tr');
      
      generateRowHTML(row, index, achievement);

      tableBody.appendChild(row);
  });
}

function renderEmptyAchievements() {
  const tableBody = document.querySelector('#achievementsTable tbody');
  tableBody.replaceChildren(); // Make list empty by replacing them with noting

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>
      <div>
        <p><strong>No achievements found.</strong></p>
        <p>Pick another option in the drop down menu to view other achievements.</p>
      </div>
    </td>
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
    <th>Achievement - Completed: ${completed}/${totalCompleted}</th>
    <th>Points - Collected: ${points}/${totalPoints}</th>
  `;
}

function updateEmptyTableHeader() {
  const tableHeader = document.querySelector('#achievementsTable tr');

  tableHeader.innerHTML = `
    <th>Achievement</th>
    <th>Points</th>
  `;
}

function updateAchievement(index) {
  const tableBody = document.querySelector('#achievementsTable tbody');
  const row = tableBody.querySelector(`tr:nth-child(${index + 1})`);

  const achievement = achievements[index];

  if (!row) return;

  generateRowHTML(row, index, achievement);
}

function generateRowHTML(row, index, achievement) {
  row.innerHTML = `
    <td>
      <div style="display: flex;">
        <div style="padding-right: 10px;">
          <img src="./images/${currentCategory}_${achievement.points}.png" alt="achievement_img" style="width: 80px; height: 80px;" onerror="this.style.display='none';">
        </div>
        <div>
          <p><strong>${achievement.name}</strong></p>
          <p>${achievement.description}</p>
        </div>
        <div style="margin-left: auto; display: flex; align-items: center;">
          <img src="./images/checkbox_${achievement.completed ? "true" : "false"}.png" alt="checkbox_img" style="width: 30px; height: 30px;" onerror="this.style.display='none';">
        </div>
      </div>
    </td>
    <td>
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0;">
        <img src="./images/points.png" alt="points_img" style="width: 30px; height: 30px;" onerror="this.style.display='none';">
        <p style="margin-top: 0; margin-bottom: 0; color: #757782"><strong>${achievement.points}</strong></p>
      </div>
    </td>
  `;

  // Add event listener to checkbox
  const checkboxImg = row.querySelector('img[alt="checkbox_img"]');
  checkboxImg.addEventListener('click', () => toggleCompleted(index));

  // Play animation by adding or removing css class from the class list of the row
  if (achievement.completed) {
    row.classList.add("rowBackgroundAnimation");
  }
  else {
    row.classList.remove("rowBackgroundAnimation");
  }
}

function toggleCompleted(index) {
  achievements[index].completed = !achievements[index].completed;

  updateTableHeader();
  updateAchievement(index);
  saveProgress();
}

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

loadAchievements();
loadCategories();
