// =============================================
// DETECTIVE GAME — APP LOGIC (النسخة الأصلية مع الصوت)
// =============================================

let currentCase = null;
let solvedCases = JSON.parse(localStorage.getItem('solvedCases') || '[]');

// محرك الصوت
const synth = window.speechSynthesis;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

document.getElementById('enter-btn').addEventListener('click', () => {
  showScreen('dashboard-screen');
  updateDashboard();
});

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

function openCase(caseId) {
  currentCase = CASES[caseId];
  if (!currentCase) return;

  document.getElementById('case-header-title').textContent = currentCase.title;
  document.getElementById('case-header-type').textContent = currentCase.type;

  renderEvidence();
  renderSuspects(); // هذه الدالة الآن تدعم الصوت
  renderNotebook();
  resetSolveTab();

  document.getElementById('case-summary-text').textContent = currentCase.summary;
  document.getElementById('case-loc').textContent = "مسرح الجريمة";
  document.getElementById('case-time').textContent = "وقت البلاغ";

  showScreen('case-screen');
  switchTab('file', document.querySelector('.tab-btn.active'));
}

function renderEvidence() {
  const container = document.getElementById('evidence-grid');
  container.innerHTML = '';
  currentCase.evidence.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'evidence-card';
    div.innerHTML = `<div class="evidence-icon">${ev.icon}</div><h4>${ev.title}</h4><p>${ev.desc}</p>`;
    container.appendChild(div);
  });
}

// دالة النطق البشري
function speak(text) {
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.9;
  synth.speak(utterance);
}

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
    
    // عند الضغط على استجواب: ينطق الصوت ويظهر التنبيه الأصلي
    div.querySelector('.btn-interrogate').addEventListener('click', () => {
      speak(s.alibi);
      alert(`${s.name} يقول: ${s.alibi}`);
    });
    
    container.appendChild(div);
  });
}

function renderNotebook() {
  const container = document.getElementById('notebook-entries');
  container.innerHTML = '';
  currentCase.notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-item';
    div.innerHTML = `<span class="note-bullet">⦿</span> ${note}`;
    container.appendChild(div);
  });
}

function resetSolveTab() {
  document.getElementById('culprit-input').value = '';
  document.getElementById('solve-result').className = 'solve-result hidden';
}

function checkSolution() {
  const input = document.getElementById('culprit-input').value.trim();
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
  }
}

function showWrongFlash() {
  const flash = document.getElementById('wrong-flash');
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 2500);
}

function showSolutionModal() {
  const modal = document.getElementById('solution-modal');
  document.getElementById('modal-body').innerHTML = `<div class="solution-scene">${currentCase.solution.scene}</div>`;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('solution-modal').classList.add('hidden');
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
