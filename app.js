// =============================================
// DETECTIVE GAME — APP LOGIC
// مكتب التحقيقات الجنائية
// =============================================

// State
let currentCase = null;
let solvedCases = JSON.parse(localStorage.getItem('solvedCases') || '[]');

// ---- SCREEN MANAGEMENT ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  screen.classList.add('active');
  window.scrollTo(0, 0);
}

// ---- INTRO ----
document.getElementById('enter-btn').addEventListener('click', () => {
  showScreen('dashboard-screen');
  updateDashboard();
});

// ---- DASHBOARD ----
function updateDashboard() {
  document.getElementById('solved-count').textContent = solvedCases.length;

  solvedCases.forEach(caseId => {
    const card = document.getElementById(`card-${caseId}`);
    if (card) {
      card.classList.add('solved');
      card.querySelector('.case-stamp').textContent = '✔ محلولة';
    }
  });
}

// ---- OPEN CASE ----
function openCase(caseId) {
  currentCase = CASES[caseId];
  if (!currentCase) return;

  // Set header
  document.getElementById('case-header-title').textContent = currentCase.title;
  document.getElementById('case-header-type').textContent = currentCase.type;

  // Render tabs
  renderEvidence();
  renderSuspects();
  renderNotebook();
  resetSolveTab();

  // Summary info
  document.getElementById('case-summary-text').textContent = currentCase.summary;
  document.getElementById('case-loc').textContent = "موقع الجريمة المذكور";
  document.getElementById('case-time').textContent = "وقت الضبط";

  showScreen('case-screen');
  
  // Reset to first tab
  switchTab('file', document.querySelector('.tab-btn.active'));
}

// ---- RENDER EVIDENCE ----
function renderEvidence() {
  const container = document.getElementById('evidence-grid');
  container.innerHTML = '';

  currentCase.evidence.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'evidence-card';
    div.innerHTML = `
      <div class="evidence-icon">${ev.icon}</div>
      <h4>${ev.title}</h4>
      <p>${ev.desc}</p>
    `;
    container.appendChild(div);
  });
}

// ---- RENDER SUSPECTS ----
function renderSuspects() {
  const container = document.getElementById('suspects-list');
  container.innerHTML = '';

  currentCase.suspects.forEach(s => {
    const div = document.createElement('div');
    div.className = 'suspect-card';
    div.innerHTML = `
      <div class="suspect-avatar">${s.avatar}</div>
      <div class="suspect-meta">
        <h4>${s.name}</h4>
        <p>${s.role}</p>
      </div>
      <button class="btn-interrogate">استجواب</button>
    `;

    div.querySelector('.btn-interrogate').addEventListener('click', () => {
      // --- إضافة ميزة الصوت هنا فقط ---
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(s.alibi);
      msg.lang = 'ar-SA';
      window.speechSynthesis.speak(msg);
      // --------------------------------
      
      alert(`${s.name} يقول: ${s.alibi}`);
    });

    container.appendChild(div);
  });
}

// ---- RENDER NOTEBOOK ----
function renderNotebook() {
  const container = document.getElementById('notebook-entries');
  container.innerHTML = '';

  currentCase.notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-item';
    div.innerHTML = `
      <span class="note-bullet">⦿</span>
      ${note}
    `;
    container.appendChild(div);
  });
}

// ---- SOLVE LOGIC ----
function resetSolveTab() {
  document.getElementById('culprit-input').value = '';
  const resultDiv = document.getElementById('solve-result');
  resultDiv.className = 'solve-result hidden';
  resultDiv.innerHTML = '';
}

function checkSolution() {
  const input = document.getElementById('culprit-input').value.trim();
  const resultDiv = document.getElementById('solve-result');

  if (!input) return;

  const isCorrect = currentCase.answerHints.some(hint => input.includes(hint));

  if (isCorrect) {
    if (!solvedCases.includes(currentCase.id)) {
      solvedCases.push(currentCase.id);
      localStorage.setItem('solvedCases', JSON.stringify(solvedCases));
    }
    showSolutionModal();
  } else {
    showWrongFlash();
    resultDiv.className = 'solve-result wrong';
    resultDiv.innerHTML = `
      <h4>❌ اتهام خاطئ</h4>
      <p>الأدلة لا تدعم هذا الاستنتاج. راجع أقوال المشتبه بهم مجدداً.</p>
    `;
    resultDiv.classList.remove('hidden');
  }
}

// Allow Enter key
document.getElementById('culprit-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkSolution();
});

function showWrongFlash() {
  const flash = document.getElementById('wrong-flash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 2500);
}

function showSolutionModal() {
  const modal = document.getElementById('solution-modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `<div class="solution-scene">${currentCase.solution.scene}</div>`;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('solution-modal').classList.add('hidden');
  document.body.style.overflow = '';
  goBack();
}

function goBack() {
  showScreen('dashboard-screen');
  updateDashboard();
}

function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(`tab-${tabName}`);
  if (pane) pane.classList.add('active');
}
