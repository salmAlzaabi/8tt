// =============================================
// DETECTIVE GAME — APP LOGIC (النسخة النهائية)
// =============================================

// الحالة العامة
let currentCase = null;
let solvedCases = JSON.parse(localStorage.getItem('solvedCases') || '[]');

// إعداد محرك الصوت البشري
const synth = window.speechSynthesis;

// ---- إدارة الشاشات ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  screen.classList.add('active');
  window.scrollTo(0, 0);
}

// ---- الدخول للنظام ----
document.getElementById('enter-btn').addEventListener('click', () => {
  showScreen('dashboard-screen');
  updateDashboard();
});

// ---- تحديث لوحة التحكم ----
function updateDashboard() {
  document.getElementById('solved-count').textContent = solvedCases.length;
  solvedCases.forEach(caseId => {
    const card = document.getElementById(`card-${caseId}`);
    if (card) {
      card.classList.add('solved');
      const stamp = card.querySelector('.case-stamp');
      if (stamp) stamp.textContent = '✔ محلولة';
    }
  });
}

// ---- فتح قضية ----
function openCase(caseId) {
  currentCase = CASES[caseId];
  if (!currentCase) return;

  document.getElementById('case-header-title').textContent = currentCase.title;
  document.getElementById('case-header-type').textContent = currentCase.type;

  renderEvidence();
  renderSuspects();
  renderNotebook();
  resetSolveTab();

  document.getElementById('case-summary-text').textContent = currentCase.summary;
  document.getElementById('case-loc').textContent = "موقع الجريمة المذكور";
  document.getElementById('case-time').textContent = "وقت الضبط";

  showScreen('case-screen');
  switchTab('file', document.querySelector('.tab-btn.active'));
}

// ---- عرض الأدلة ----
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

// ---- نظام الاستجواب (صوت وكتابة) ----

function speakAndType(element, text) {
  // إلغاء أي صوت سابق ومسح النص
  synth.cancel();
  element.innerHTML = "";
  
  // إعداد الصوت البشري
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.9; // سرعة واقعية

  // تأثير الكتابة (تزامن الكلمات)
  let i = 0;
  const words = text.split(' ');
  
  function typeNextWord() {
    if (i < words.length) {
      element.innerHTML += words[i] + " ";
      i++;
      setTimeout(typeNextWord, 250); // سرعة ظهور الكلمات
    }
  }

  synth.speak(utterance);
  typeNextWord();
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
      <div class="interrogation-box hidden" style="margin-top:10px; padding:10px; background:#1a1a24; border-right:3px solid #c9a84c;">
         <p class="alibi-text" style="color:#e8e0d0; font-size:0.95rem;"></p>
      </div>
      <button class="btn-interrogate" style="margin-top:10px; cursor:pointer;">استجواب صوتي 🎤</button>
    `;

    const btn = div.querySelector('.btn-interrogate');
    const box = div.querySelector('.interrogation-box');
    const textTarget = div.querySelector('.alibi-text');

    btn.onclick = () => {
      box.classList.remove('hidden');
      speakAndType(textTarget, s.alibi);
    };

    container.appendChild(div);
  });
}

// ---- المفكرة وحل القضية ----
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
  const resultDiv = document.getElementById('solve-result');
  resultDiv.className = 'solve-result hidden';
  resultDiv.innerHTML = '';
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
  const body = document.getElementById('modal-body');
  body.innerHTML = `<div class="solution-scene">${currentCase.solution.scene}</div>`;
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
