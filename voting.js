const VOTE_KEY = 'spoonify-votes';

function getVotes() {
  return JSON.parse(localStorage.getItem(VOTE_KEY)) || {};
}

function saveVotes(votes) {
  localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
}

function renderVotingResults() {
  const votes = getVotes();
  const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
  const resultsDiv = document.getElementById('voting-results');
  resultsDiv.innerHTML = '';
  ['Poha', 'Paneer Butter Masala', 'Dal Tadka', 'Gulab Jamun'].forEach(dish => {
    const count = votes[dish] || 0;
    const percent = Math.round((count / total) * 100);
    const bar = document.createElement('div');
    bar.innerHTML = `<span class="voting-label">${dish}</span>
      <span class="voting-bar" style="width:${percent}%;background:#2196f3;">${count} (${percent}%)</span>`;
    resultsDiv.appendChild(bar);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('menu-voting-form');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const dish = form['vote-dish'].value;
      const votes = getVotes();
      votes[dish] = (votes[dish] || 0) + 1;
      saveVotes(votes);
      renderVotingResults();
      form.reset();
      alert('Thanks for voting!');
    };
    renderVotingResults();
  }
});
