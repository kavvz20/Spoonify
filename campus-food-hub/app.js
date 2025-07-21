// Animate menu cards in sequence on menu.html
if (window.location.pathname.endsWith('menu.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.menu-card-item');
    cards.forEach((card, i) => {
      card.style.setProperty('--card-delay', `${i * 0.08}s`);
    });
  });
}
if (window.location.pathname.endsWith('mealshare.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach((card, i) => {
      card.style.setProperty('--card-delay', `${i * 0.12}s`);
    });
    const mealItems = document.querySelectorAll('.meals-list-item');
    mealItems.forEach((item, i) => {
      item.style.setProperty('--card-delay', `${i * 0.08 + 0.3}s`);
    });
  });
}
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('waste.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach((card, i) => {
      card.style.setProperty('--card-delay', `${i * 0.12}s`);
    });
  });
}
if (window.location.pathname.endsWith('waste.html')) {
  function getTotalWaste() {
    return parseInt(localStorage.getItem('cfh_total_waste') || '0', 10);
  }
  function updateWasteLogForm() {
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    const form = document.getElementById('waste-log-form');
    const userMsg = document.getElementById('waste-log-user-msg');
    const wasteLogLabel = document.getElementById('waste-log-label');
    const wasteLogInput = document.getElementById('waste-portions');
    const wasteLogBtn = form ? form.querySelector('button[type="submit"]') : null;
    const wasteLogTotal = document.getElementById('waste-log-total');
    const userTotalWaste = document.getElementById('user-total-waste');
    const total = getTotalWaste();
    if (user && user.role === 'admin') {
      if (form) form.style.display = '';
      if (userMsg) userMsg.style.display = 'none';
      if (wasteLogTotal) wasteLogTotal.textContent = `Total wasted food: ${total} portions`;
      if (wasteLogLabel) wasteLogLabel.style.display = '';
      if (wasteLogInput) wasteLogInput.style.display = '';
      if (wasteLogBtn) wasteLogBtn.style.display = '';
    } else {
      if (form) form.style.display = '';
      if (wasteLogLabel) wasteLogLabel.style.display = 'none';
      if (wasteLogInput) wasteLogInput.style.display = 'none';
      if (wasteLogBtn) wasteLogBtn.style.display = 'none';
      if (wasteLogTotal) wasteLogTotal.textContent = `Total wasted food: ${total} portions`;
      if (userMsg) userMsg.style.display = 'none';
      if (userTotalWaste) userTotalWaste.textContent = `Total wasted food: ${total} portions`;
    }
  }
  document.addEventListener('DOMContentLoaded', updateWasteLogForm);
  window.addEventListener('storage', updateWasteLogForm);
}
if (window.location.pathname.endsWith('mealshare.html')) {
  function getMeals() {
    return JSON.parse(localStorage.getItem('cfh_meals') || '[]');
  }
  function setMeals(meals) {
    localStorage.setItem('cfh_meals', JSON.stringify(meals));
  }
  function renderMeals() {
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    const meals = getMeals();
    const list = document.getElementById('meals-list');
    list.innerHTML = '';
    meals.forEach((meal, i) => {
      const div = document.createElement('div');
      div.className = 'meals-list-item';
      div.innerHTML = `<strong>${meal.name || 'Anonymous'}</strong> - ${meal.location} at ${meal.time}`;
      if (user && (user.role === 'admin' || user.username === meal.username)) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Claim';
        cancelBtn.className = 'cancel-meal-btn';
        cancelBtn.onclick = () => {
          meals.splice(i, 1);
          setMeals(meals);
          renderMeals();
        };
        div.appendChild(cancelBtn);
      } else {
        const claimBtn = document.createElement('button');
        claimBtn.textContent = 'Claim';
        claimBtn.className = 'claim-meal-btn';
        claimBtn.onclick = () => {
          meals.splice(i, 1);
          setMeals(meals);
          renderMeals();
        };
        div.appendChild(claimBtn);
      }
      list.appendChild(div);
    });
  }
  document.addEventListener('DOMContentLoaded', renderMeals);
  window.addEventListener('storage', renderMeals);
}
if (window.location.pathname.endsWith('menu.html')) {
  function handleCancelMeal(mealType) {
    document.getElementById(`cancel-${mealType}-options`).style.display = '';
  }
  function handleOfferMeal(mealType) {
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    const mealNames = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner'
    };
    const meals = JSON.parse(localStorage.getItem('cfh_meals') || '[]');
    meals.push({
      name: user.username,
      username: user.username,
      location: 'Mess Hall',
      time: mealNames[mealType] || mealType
    });
    localStorage.setItem('cfh_meals', JSON.stringify(meals));
    document.getElementById(`cancel-${mealType}-options`).style.display = 'none';
    window.location.href = 'mealshare.html';
  }
  function handleJustCancel(mealType) {
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    const cancelled = JSON.parse(localStorage.getItem('cfh_cancelled_meals') || '{}');
    if (!cancelled[user.username]) cancelled[user.username] = {};
    cancelled[user.username][mealType] = true;
    localStorage.setItem('cfh_cancelled_meals', JSON.stringify(cancelled));
    document.getElementById(`cancel-${mealType}-options`).style.display = 'none';
    window.location.href = 'meal-cancel.html';
  }
  function updateCancelMealButtons() {
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    const isAdmin = user && user.role === 'admin';
    ['breakfast','lunch','dinner'].forEach(mealType => {
      const btn = document.getElementById(`cancel-${mealType}-btn`);
      const opts = document.getElementById(`cancel-${mealType}-options`);
      if (btn) btn.style.display = isAdmin ? 'none' : '';
      if (opts) opts.style.display = 'none';
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    ['breakfast','lunch','dinner'].forEach(mealType => {
      const btn = document.getElementById(`cancel-${mealType}-btn`);
      if (btn) btn.onclick = () => handleCancelMeal(mealType);
      const offerBtn = document.querySelector(`.offer-meal-btn[data-meal="${mealType}"]`);
      if (offerBtn) offerBtn.onclick = () => handleOfferMeal(mealType);
      const justCancelBtn = document.querySelector(`.just-cancel-btn[data-meal="${mealType}"]`);
      if (justCancelBtn) justCancelBtn.onclick = () => handleJustCancel(mealType);
    });
  });
  document.addEventListener('DOMContentLoaded', updateCancelMealButtons);
  window.addEventListener('storage', updateCancelMealButtons);
}
if (window.location.pathname.endsWith('admin.html')) {
  function renderCancelledMeals() {
    const cancelled = JSON.parse(localStorage.getItem('cfh_cancelled_meals') || '{}');
    const counts = { breakfast: 0, lunch: 0, dinner: 0 };
    const lists = { breakfast: [], lunch: [], dinner: [] };
    Object.entries(cancelled).forEach(([username, meals]) => {
      ['breakfast','lunch','dinner'].forEach(type => {
        if (meals[type]) {
          counts[type]++;
          lists[type].push(username);
        }
      });
    });
    ['breakfast','lunch','dinner'].forEach(type => {
      document.getElementById(`cancelled-${type}-count`).textContent = counts[type];
      if (type === 'breakfast') return;
      const listDiv = document.getElementById(`cancelled-${type}-list`);
      listDiv.innerHTML = '';
      lists[type].forEach(username => {
        const div = document.createElement('div');
        div.className = 'cancelled-meal-item';
        div.innerHTML = `<strong>${username}</strong> <button class='claim-cancelled-btn' data-user='${username}' data-meal='${type}'>Claim</button>`;
        listDiv.appendChild(div);
      });
    });
    document.querySelectorAll('.claim-cancelled-btn').forEach(btn => {
      btn.onclick = function() {
        const user = btn.getAttribute('data-user');
        const meal = btn.getAttribute('data-meal');
        if (cancelled[user]) {
          cancelled[user][meal] = false;
          localStorage.setItem('cfh_cancelled_meals', JSON.stringify(cancelled));
          renderCancelledMeals();
          alert(`Meal for ${user} (${meal}) claimed!`);
        }
      };
    });
  }
  document.addEventListener('DOMContentLoaded', renderCancelledMeals);
  window.addEventListener('storage', renderCancelledMeals);
}
// Dummy database for cancelled meals
const cancelledMealsDB = {
  breakfast: [
    { user: "Alice", reason: "Not hungry" },
    { user: "Bob", reason: "Early class" }
  ],
  lunch: [
    { user: "Charlie", reason: "Off campus" }
  ],
  dinner: [
    { user: "Dana", reason: "Fasting" },
    { user: "Eli", reason: "Sick" }
  ]
};

// Function to update the admin portal with dummy data
function updateCancelledMealsOverview() {
  const breakfastCount = document.getElementById('cancelled-breakfast-count');
  const lunchCount = document.getElementById('cancelled-lunch-count');
  const dinnerCount = document.getElementById('cancelled-dinner-count');
  if (breakfastCount) breakfastCount.textContent = cancelledMealsDB.breakfast.length;
  if (lunchCount) lunchCount.textContent = cancelledMealsDB.lunch.length;
  if (dinnerCount) dinnerCount.textContent = cancelledMealsDB.dinner.length;

  // List the users who cancelled lunch
  const lunchListDiv = document.getElementById('cancelled-lunch-list');
  if (lunchListDiv) {
    const lunchList = cancelledMealsDB.lunch.map(meal => `<li>${meal.user}: ${meal.reason}</li>`).join('');
    lunchListDiv.innerHTML = lunchList ? `<ul>${lunchList}</ul>` : '';
  }

  // List the users who cancelled dinner
  const dinnerListDiv = document.getElementById('cancelled-dinner-list');
  if (dinnerListDiv) {
    const dinnerList = cancelledMealsDB.dinner.map(meal => `<li>${meal.user}: ${meal.reason}</li>`).join('');
    dinnerListDiv.innerHTML = dinnerList ? `<ul>${dinnerList}</ul>` : '';
  }
}

// Run on page load only for admin.html
if (window.location.pathname.endsWith('admin.html')) {
  document.addEventListener('DOMContentLoaded', updateCancelledMealsOverview);
}
const isHome = window.location.pathname.endsWith('index.html');
const modal = document.getElementById('signin-modal');
const form = document.getElementById('signin-form');
const adminPasswordField = document.getElementById('admin-password-field');
const usernameField = document.getElementById('username-field');
const signinNavLink = document.getElementById('signin-nav-link');
function showModal() {
  if (modal) modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (!isHome) document.querySelector('main').style.display = 'none';
}
function hideModal() {
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  if (!isHome) document.querySelector('main').style.display = '';
}
// QR Modal logic
function showQRModal(user) {
  const qrModal = document.getElementById('qr-modal');
  const qrCanvas = document.getElementById('user-qr-canvas');
  if (qrModal && qrCanvas && user) {
    qrModal.style.display = 'flex';
    // Clear previous QR
    const ctx = qrCanvas.getContext('2d');
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    // Generate QR code with user info (e.g., username + role)
    // Use QRCode.js library
    // Remove any previous QRCode instance
    if (qrCanvas.qrInstance) {
      qrCanvas.qrInstance.clear();
      qrCanvas.qrInstance = null;
    }
    // Use QRCode.js to draw to canvas
    // QRCode.js expects a DOM element, so create a temp div
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    const qr = new QRCode(tempDiv, {
      text: JSON.stringify({ username: user.username, role: user.role }),
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.H
    });
    // Draw the generated QR image onto the canvas
    setTimeout(() => {
      const img = tempDiv.querySelector('img');
      if (img) {
        qrCanvas.width = 200;
        qrCanvas.height = 200;
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        ctx.drawImage(img, 0, 0, 200, 200);
      }
      tempDiv.remove();
    }, 200);
    // Close button
    const closeBtn = document.getElementById('close-qr-btn');
    if (closeBtn) {
      closeBtn.onclick = function() {
        qrModal.style.display = 'none';
      };
    }
  }
}

function updateShowQRLink() {
  const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
  const showQRLink = document.getElementById('show-qr-link');
  if (showQRLink) {
    if (user) {
      showQRLink.style.display = '';
      showQRLink.onclick = function(e) {
        e.preventDefault();
        showQRModal(user);
      };
    } else {
      showQRLink.style.display = 'none';
    }
  }
}

// Patch navbar sign-in link to show QR if signed in
function updateNavUser() {
  const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
  if (signinNavLink) {
    if (user) {
      signinNavLink.textContent = `${user.username} (${user.role}) | Sign Out`;
      signinNavLink.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('cfh_user');
        location.reload();
      };
    } else {
      signinNavLink.textContent = 'Sign In';
      signinNavLink.onclick = function(e) {
        e.preventDefault();
        showModal();
      };
    }
  }
  updateShowQRLink();
}

if (modal && form) {
  form.role.forEach(radio => {
    radio.addEventListener('change', e => {
      if (e.target.value === 'admin') {
        adminPasswordField.style.display = '';
      } else {
        adminPasswordField.style.display = 'none';
      }
    });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const role = form.role.value;
    const username = document.getElementById('signin-username').value.trim();
    if (!username) return;
    if (role === 'admin') {
      const password = document.getElementById('signin-password').value;
      if (username !== 'hackhungry' || password !== 'thapar') {
        alert('Incorrect admin username or password.');
        return;
      }
    }
    localStorage.setItem('cfh_user', JSON.stringify({ username, role }));
    hideModal();
    updateNavUser();
    location.reload();
  });
}
if (!isHome) {
  const user = localStorage.getItem('cfh_user');
  if (!user) {
    showModal();
  } else {
    hideModal();
  }
}
updateNavUser();
document.addEventListener('DOMContentLoaded', updateShowQRLink);
if (document.getElementById('hamburger-btn')) {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// Responsive navbar toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
});
