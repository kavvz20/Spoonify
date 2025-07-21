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

    // Group admin unused portions
    const adminUnused = meals.filter(m => m.fromWaste);
    const otherMeals = meals.filter(m => !m.fromWaste);

    // Show admin unused portions as a single entry with count
    if (adminUnused.length > 0) {
      const div = document.createElement('div');
      div.className = 'meals-list-item';
      div.innerHTML = `<strong>Admin (Unused Portion)</strong> - Mess Hall<br>
        <span>Available portions: <b id="admin-unused-count">${adminUnused.length}</b></span>`;
      const claimBtn = document.createElement('button');
      claimBtn.textContent = 'Claim Portion';
      claimBtn.className = 'claim-meal-btn';
      claimBtn.onclick = () => {
        // Remove one unused portion meal
        const idx = meals.findIndex(m => m.fromWaste);
        if (idx !== -1) {
          meals.splice(idx, 1);
          setMeals(meals);

          // --- Decrement total wasted food ---
          let totalWaste = parseInt(localStorage.getItem('cfh_total_waste') || '0', 10);
          if (totalWaste > 0) {
            totalWaste -= 1;
            localStorage.setItem('cfh_total_waste', totalWaste);
          }
          // --- End decrement ---

          renderMeals();
          // Notify other tabs/pages
          window.dispatchEvent(new Event('storage'));
        }
      };
      div.appendChild(claimBtn);
      list.appendChild(div);
    }

    // Render other meals as usual
    otherMeals.forEach((meal, i) => {
      const div = document.createElement('div');
      div.className = 'meals-list-item';
      div.innerHTML = `<strong>${meal.name || 'Anonymous'}</strong> - ${meal.location} at ${meal.time}`;
      const claimBtn = document.createElement('button');
      claimBtn.textContent = 'Claim';
      claimBtn.className = 'claim-meal-btn';
      claimBtn.onclick = () => {
        const idx = meals.findIndex((m, idx2) => !m.fromWaste && idx2 === i);
        if (idx !== -1) {
          meals.splice(idx, 1);
          setMeals(meals);
          renderMeals();
        }
      };
      div.appendChild(claimBtn);
      list.appendChild(div);
    });

    // If no meals at all
    if (meals.length === 0) {
      list.innerHTML = "<div>No available meals right now.</div>";
    }
  }
  document.addEventListener('DOMContentLoaded', renderMeals);
  window.addEventListener('storage', renderMeals);
}
if (window.location.pathname.endsWith('menu.html')) {
  function handleCancelMeal(mealType) {
    document.getElementById(`cancel-${mealType}-options`).style.display = '';
  }
  document.addEventListener('DOMContentLoaded', () => {
    ['breakfast','lunch','dinner'].forEach(mealType => {
      const btn = document.getElementById(`cancel-${mealType}-btn`);
      if (btn) btn.onclick = () => handleCancelMeal(mealType);
    });
  });
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
  if (window.modal) window.modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  if (window.modal) window.modal.style.display = 'none';
  document.body.style.overflow = '';
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

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all DOM-dependent variables after DOM is ready
  window.modal = document.getElementById('signin-modal');
  window.form = document.getElementById('signin-form');
  window.adminPasswordField = document.getElementById('admin-password-field');
  window.signinNavLink = document.getElementById('signin-nav-link');
  window.usernameField = document.getElementById('username-field');
  const main = document.querySelector('main');

  // Enforce sign-in protection
  function enforceSignIn() {
    const user = localStorage.getItem('cfh_user');
    if (!user) {
      if (window.modal) window.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (main) main.style.display = 'none';
    } else {
      if (window.modal) window.modal.style.display = 'none';
      document.body.style.overflow = '';
      if (main) main.style.display = '';
    }
  }

  enforceSignIn();
  updateNavUser();

  // Attach form logic
  if (window.modal && window.form) {
    const radios = window.form.querySelectorAll('input[name="role"]');
    radios.forEach(radio => {
      radio.addEventListener('change', e => {
        if (e.target.value === 'admin') {
          if (window.adminPasswordField) window.adminPasswordField.style.display = '';
        } else {
          if (window.adminPasswordField) window.adminPasswordField.style.display = 'none';
        }
      });
    });
    window.form.addEventListener('submit', e => {
      e.preventDefault();
      const role = window.form.role.value;
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
      if (window.modal) window.modal.style.display = 'none';
      document.body.style.overflow = '';
      if (main) main.style.display = '';
      updateNavUser();
      enforceSignIn();
    });
  }

  // Patch sign-out to always enforce sign-in
  if (window.signinNavLink) {
    window.signinNavLink.addEventListener('click', function(e) {
      const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
      if (user) {
        // Sign out
        e.preventDefault();
        localStorage.removeItem('cfh_user');
        updateNavUser();
        enforceSignIn();
      }
    });
  }
});
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

// --- Menu Feedback (Breakfast, Lunch, Dinner) ---
if (window.location.pathname.endsWith('menu.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    // For each meal type
    ['breakfast', 'lunch', 'dinner'].forEach(function(meal) {
      const ratingButtons = document.querySelectorAll('.rating-buttons[data-meal="' + meal + '"] button');
      let selectedRating = null;
      // Restore previous rating if exists
      const feedback = JSON.parse(localStorage.getItem('menu_feedback_' + meal) || 'null');
      if (feedback && feedback.rating) {
        ratingButtons.forEach(btn => {
          if (parseInt(btn.getAttribute('data-rating')) === feedback.rating) {
            btn.classList.add('selected');
            selectedRating = feedback.rating;
          }
        });
        // Restore suggestion
        const suggestionInput = document.querySelector('.menu-suggestion[data-meal="' + meal + '"]');
        if (suggestionInput && feedback.suggestion) {
          suggestionInput.value = feedback.suggestion;
        }
      }
      ratingButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          ratingButtons.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedRating = parseInt(btn.getAttribute('data-rating'));
        });
      });
    });
    // Handle form submit
    const form = document.getElementById('menu-feedback-form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      ['breakfast', 'lunch', 'dinner'].forEach(function(meal) {
        const ratingBtn = document.querySelector('.rating-buttons[data-meal="' + meal + '"] button.selected');
        const suggestionInput = document.querySelector('.menu-suggestion[data-meal="' + meal + '"]');
        const rating = ratingBtn ? parseInt(ratingBtn.getAttribute('data-rating')) : null;
        const suggestion = suggestionInput ? suggestionInput.value.trim() : '';
        if (rating) {
          localStorage.setItem('menu_feedback_' + meal, JSON.stringify({ rating, suggestion }));
        }
      });
      alert('Thank you for your feedback!');
      form.reset();
      // Remove selected class after reset
      document.querySelectorAll('.rating-buttons button').forEach(btn => btn.classList.remove('selected'));
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const offerForm = document.getElementById('offer-meal-form');
  const mealsList = document.getElementById('meals-list');

  offerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('offer-name').value.trim() || 'Anonymous';
    const time = document.getElementById('offer-time').value;
    const location = document.getElementById('offer-location').value.trim();

    // Simple validation
    if (!time || !location) {
      alert('Please fill in all required fields.');
      return;
    }

    // Create meal entry
    const mealDiv = document.createElement('div');
    mealDiv.className = 'meal-entry';
    mealDiv.innerHTML = `
      <strong>Offered by:</strong> ${name}<br>
      <strong>Pickup Time:</strong> ${time}<br>
      <strong>Location:</strong> ${location}<br>
      <button class="cancel-meal-btn">Cancel</button>
    `;

    // Add cancel functionality
    mealDiv.querySelector('.cancel-meal-btn').addEventListener('click', function() {
      mealDiv.remove();
    });

    // Add to list
    mealsList.prepend(mealDiv);

    // Reset form
    offerForm.reset();
  });
});

// Add this inside your waste log form submit handler (for waste.html)
const wasteLogForm = document.getElementById('waste-log-form');
if (wasteLogForm) {
  wasteLogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('cfh_user') || 'null');
    if (user && user.role === 'admin') {
      const input = document.getElementById('waste-portions');
      const value = parseInt(input.value, 10) || 0;
      let totalWaste = parseInt(localStorage.getItem('cfh_total_waste') || '0', 10);
      totalWaste += value;
      localStorage.setItem('cfh_total_waste', totalWaste);

      // --- Add unused portions as available meals ---
      if (value > 0) {
        const meals = JSON.parse(localStorage.getItem('cfh_meals') || '[]');
        const now = new Date();
        for (let i = 0; i < value; i++) {
          meals.push({
            name: "Admin (Unused Portion)",
            username: user.username,
            location: "Mess Hall", // You can customize or prompt for location
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            fromWaste: true
          });
        }
        localStorage.setItem('cfh_meals', JSON.stringify(meals));
      }
      // --- End block ---

      input.value = '';
    }
    location.reload(); // Refresh the site after logging waste
  });
}

// Dummy waste data for the last 7 days (portions wasted per day)
const wasteData = [
  { date: 'Mon', wasted: 12 },
  { date: 'Tue', wasted: 8 },
  { date: 'Wed', wasted: 15 },
  { date: 'Thu', wasted: 6 },
  { date: 'Fri', wasted: 10 },
  { date: 'Sat', wasted: 5 },
  { date: 'Sun', wasted: 7 }
];

// Calculate total meals saved (assume 100 portions per day, saved = not wasted)
const totalMealsSaved = wasteData.reduce((sum, day) => sum + (100 - day.wasted), 0);

// Render bar chart
function renderWasteChart() {
  const chartDiv = document.getElementById('waste-stats-chart');
  chartDiv.innerHTML = `
    <div style="display:flex;align-items:end;height:120px;gap:8px;">
      ${wasteData.map(day => `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#e74c3c;width:24px;height:${day.wasted * 2}px;border-radius:4px 4px 0 0;"></div>
          <span style="font-size:12px;">${day.date}</span>
        </div>
      `).join('')}
    </div>
    <div style="font-size:12px;color:#888;margin-top:4px;">Red bars = wasted portions</div>
  `;
  document.getElementById('total-meals-saved').textContent = totalMealsSaved;
}

// Call on page load
document.addEventListener('DOMContentLoaded', renderWasteChart);

// --- Dashboard Feedback Display ---
if (window.location.pathname.endsWith('index.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    let totalRating = 0;
    let ratingCount = 0;

    ['breakfast', 'lunch', 'dinner'].forEach(function(meal) {
      const feedback = JSON.parse(localStorage.getItem('menu_feedback_' + meal) || 'null');
      const feedbackDiv = document.getElementById('stat-' + meal + '-feedback');
      
      if (feedbackDiv) {
        if (feedback && feedback.rating) {
          // Add to average calculation
          totalRating += feedback.rating;
          ratingCount++;
          
          // Display individual feedback
          let stars = '⭐'.repeat(feedback.rating);
          let suggestion = feedback.suggestion ? ' — ' + feedback.suggestion : '';
          feedbackDiv.textContent = stars + suggestion;
        } else {
          feedbackDiv.textContent = '-';
        }
      }
    });

    // Calculate and display overall rating in "Today's Menu Rating"
    const overallRatingDiv = document.getElementById('stat-menu-rating');
    if (overallRatingDiv) {
      if (ratingCount > 0) {
        const averageRating = totalRating / ratingCount;
        const roundedRating = Math.round(averageRating);
        let stars = '⭐'.repeat(roundedRating);
        // Show stars and the average value
        overallRatingDiv.innerHTML = `${stars} <span style="font-size: 0.8em; color: var(--text-dark);">(${averageRating.toFixed(1)}/5)</span>`;
      } else {
        overallRatingDiv.textContent = '-';
      }
    }
  });
}

