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
    const stamp = document.getElementById(`stamp-${caseId}`);
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

  // Switch to case screen
  showScreen('case-screen');
  switchTab('evidence', document.querySelector('.tab-btn[data-tab="evidence"]'));
}

// ---- EVIDENCE ----
function renderEvidence() {
  const grid = document.getElementById('evidence-grid');
  grid.innerHTML = currentCase.evidence.map(e => `
    <div class="evidence-card">
      <div class="evidence-img">${e.icon}</div>
      <div class="evidence-body">
        <div class="evidence-num">${e.id}</div>
        <div class="evidence-title">${e.title}</div>
        <div class="evidence-desc">${e.desc}</div>
        <span class="evidence-tag">${e.tag}</span>
      </div>
    </div>
  `).join('');
}

// ---- SUSPECTS ----
function renderSuspects() {
  const list = document.getElementById('suspects-list');
  list.innerHTML = currentCase.suspects.map(s => `
    <div class="suspect-card">
      <div class="suspect-header" onclick="toggleSuspect('${s.id}', this)">
        <div class="suspect-avatar">${s.emoji}</div>
        <div class="suspect-info">
          <div class="suspect-name">${s.name}</div>
          <div class="suspect-role">${s.role}</div>
        </div>
        <div class="suspect-toggle">▼</div>
      </div>
      <div class="suspect-body" id="body-${s.id}">
        <div class="suspect-audio">
          <button class="audio-btn" onclick="playAudio('${s.id}')">▶ تشغيل التسجيل الصوتي</button>
          <span class="audio-note">ملف صوتي — محاكاة (لا يوجد تسجيل حقيقي)</span>
        </div>
        <div class="statement-label">STATEMENT — إفادة الاستجواب</div>
        <div class="statement-text">"${s.statement}"</div>
        ${s.contradiction ? `
          <div class="suspect-contradiction">
            <span>${s.contradiction}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function toggleSuspect(id, header) {
  const body = document.getElementById(`body-${id}`);
  const isOpen = body.classList.contains('open');

  // Close all
  document.querySelectorAll('.suspect-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.suspect-header').forEach(h => h.classList.remove('open'));

  if (!isOpen) {
    body.classList.add('open');
    header.classList.add('open');
  }
}

function playAudio(id) {
  // Simulate audio playback (no real audio)
  const btn = event.target;
  const origText = btn.textContent;
  btn.textContent = '⏹ يُشغَّل... (محاكاة)';
  btn.style.color = 'var(--gold)';
  btn.style.borderColor = 'var(--gold-dim)';
  setTimeout(() => {
    btn.textContent = origText;
    btn.style.color = '';
    btn.style.borderColor = '';
  }, 2500);
}

// ---- NOTEBOOK ----
function renderNotebook() {
  // Hints
  const hintsEl = document.getElementById('notebook-hints');
  hintsEl.innerHTML = `
    <div style="font-weight:700; color: var(--gold); margin-bottom: 0.75rem; font-size:0.9rem;">💡 أدلة للتفكير</div>
    ${currentCase.notebookHints.map(h => `
      <div class="hint-item">
        <span class="hint-icon">${h.icon}</span>
        <span>${h.text}</span>
      </div>
    `).join('')}
  `;

  // Connections
  const connEl = document.getElementById('connection-builder');
  connEl.innerHTML = currentCase.connections.map(c => `
    <div class="connection-item">
      <span class="conn-dot">🔗</span>
      <span>${c}</span>
    </div>
  `).join('');

  // Clear notes
  document.getElementById('personal-notes').value = '';
}

// ---- SOLVE ----
function resetSolveTab() {
  document.getElementById('culprit-input').value = '';
  document.getElementById('solve-result').className = 'solve-result hidden';
  document.getElementById('solve-result').innerHTML = '';
}

function checkSolution() {
  const input = document.getElementById('culprit-input').value.trim();
  if (!input) return;

  const correctAnswer = currentCase.answer.toLowerCase().trim();
  const inputLower = input.toLowerCase().trim();

  // Check against main answer and hints
  const allAnswers = [correctAnswer, ...(currentCase.answerHints || []).map(a => a.toLowerCase())];
  const isCorrect = allAnswers.some(ans => inputLower.includes(ans) || ans.includes(inputLower) || inputLower === ans);

  if (isCorrect) {
    // Show result
    const resultEl = document.getElementById('solve-result');
    resultEl.className = 'solve-result correct';
    resultEl.innerHTML = `
      <h3>✅ صحيح — الجاني هو: ${currentCase.answer}</h3>
      <p>ممتاز! لقد كشفت الحقيقة. شاهد مشهد الحل الكامل الآن.</p>
    `;

    // Mark solved
    if (!solvedCases.includes(currentCase.id)) {
      solvedCases.push(currentCase.id);
      localStorage.setItem('solvedCases', JSON.stringify(solvedCases));
    }

    // Show modal after brief delay
    setTimeout(() => showSolutionModal(), 800);
  } else {
    // Wrong
    showWrongFlash();
    const resultEl = document.getElementById('solve-result');
    resultEl.className = 'solve-result wrong';
    resultEl.innerHTML = `
      <h3>❌ اسم خاطئ</h3>
      <p>راجع الأدلة والاستجوابات مجدداً. هناك تناقض واضح لم تكتشفه بعد.</p>
    `;
  }
}

// Allow Enter key in solve input
document.getElementById('culprit-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkSolution();
});

// ---- WRONG FLASH ----
function showWrongFlash() {
  const flash = document.getElementById('wrong-flash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 2500);
}

// ---- SOLUTION MODAL ----
function showSolutionModal() {
  const modal = document.getElementById('solution-modal');
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div class="solution-scene">
      ${currentCase.solution.scene}
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('solution-modal').classList.add('hidden');
  document.body.style.overflow = '';
  goBack();
}

// ---- TAB SWITCHING ----
function switchTab(tabName, btn) {
  // Deactivate all
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  // Activate selected
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(`tab-${tabName}`);
  if (pane) pane.classList.add('active');
}

// ---- BACK ----
function goBack() {
  showScreen('dashboard-screen');
  updateDashboard();
  currentCase = null;
}

// ---- INIT ----
updateDashboard();
