// EduTest — Onlayn Imtihon Tizimi uchun umumiy JavaScript

// 1. Bootstrap Tooltip va Popover komponentlarini faollashtirish
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el);
});
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
    new bootstrap.Popover(el);
});

// 2. Boshlang'ich test savollari bazasi
const defaultQuestions = [
    {
        id: 1,
        subject: "Veb tizimlar",
        question: "Bootstrap 5 grid tizimi ekran kengligini nechta teng ustunga bo'ladi?",
        options: ["12 ta ustun", "8 ta ustun", "16 ta ustun"],
        correct: 0
    },
    {
        id: 2,
        subject: "Veb tizimlar",
        question: "Qaysi Bootstrap klassi jadval qatoriga kursor borganda rangini o'zgartiradi?",
        options: [".table-bordered", ".table-hover", ".table-sm"],
        correct: 1
    },
    {
        id: 3,
        subject: "Veb tizimlar",
        question: "Konteynerli menyu hosil qilish uchun qaysi klasslar birgalikda ishlatiladi?",
        options: [".navbar va .container", ".carousel va .alert", ".badge va .table"],
        correct: 0
    },
    {
        id: 4,
        subject: "Axborot tizimlari",
        question: "Axborot tizimlarini ishlab chiqishda talablarni tahlil qilish bosqichining maqsadi nima?",
        options: ["Faqat dizayn rangini tanlash", "Tizim funksiyalari va foydalanuvchi ehtiyojlarini aniqlash", "Serverni o'chirish"],
        correct: 1
    },
    {
        id: 5,
        subject: "Axborot tizimlari",
        question: "Onlayn imtihon tizimida natijalarni saqlash nimani ta'minlaydi?",
        options: ["Talaba ballari va hisobot ma'lumotlari saqlanishini", "Faqat shrift o'zgarishini", "Brauzer yopilishini"],
        correct: 0
    },
    {
        id: 6,
        subject: "Ma'lumotlar bazasi",
        question: "SQL tilida jadvaldan ma'lumotlarni tanlab olish operatori qaysi?",
        options: ["INSERT", "SELECT", "DELETE"],
        correct: 1
    },
    {
        id: 7,
        subject: "Ma'lumotlar bazasi",
        question: "Jadvaldagi har bir yozuvni yagona tarzda identifikatsiya qiluvchi kalit nima deyiladi?",
        options: ["Primary Key", "Foreign Key", "Index Key"],
        correct: 0
    }
];

let questions = JSON.parse(localStorage.getItem("edutest_questions_full")) || defaultQuestions;
let results = JSON.parse(localStorage.getItem("edutest_results_full")) || [
    {
        name: "Xolnazarova Farangiz",
        group: "304-guruh",
        subject: "Veb tizimlar",
        score: 3,
        total: 3,
        percent: 100,
        date: "22.11.2026"
    }
];

let currentStudent = null;
let activeQuestions = [];
let timerInterval = null;
let timeLeft = 300;

function saveData() {
    localStorage.setItem("edutest_questions_full", JSON.stringify(questions));
    localStorage.setItem("edutest_results_full", JSON.stringify(results));
}

function selectSubject(subjectName) {
    const selectEl = document.getElementById("subjectSelect");
    const badgeEl = document.getElementById("activeSubjectBadge");
    if (selectEl) selectEl.value = subjectName;
    if (badgeEl) badgeEl.textContent = "Fan: " + subjectName;
}

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}

function startTimer() {
    const timerEl = document.getElementById("timerDisplay");
    if (!timerEl) return;
    clearInterval(timerInterval);
    timeLeft = 300;
    timerEl.textContent = formatTime(timeLeft);

    timerInterval = setInterval(function () {
        timeLeft--;
        timerEl.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishExam(true);
        }
    }, 1000);
}

// Bosh sahifadagi imtihon formasi
const studentForm = document.getElementById("studentStartForm");
if (studentForm) {
    studentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!studentForm.checkValidity()) {
            e.stopPropagation();
            studentForm.classList.add("was-validated");
            return;
        }
        studentForm.classList.add("was-validated");

        const name = document.getElementById("studentFullName").value.trim();
        const group = document.getElementById("studentGroupInput").value.trim();
        const subject = document.getElementById("subjectSelect").value;

        currentStudent = { name, group, subject };
        document.getElementById("activeSubjectBadge").textContent = `Fan: ${subject} (${name})`;
        document.getElementById("examResultAlert").classList.add("d-none");

        const filtered = questions.filter(q => q.subject === subject);
        activeQuestions = filtered.length > 0 ? filtered : questions;
        document.getElementById("questionCountBadge").textContent = `Savollar: ${activeQuestions.length}`;

        const quizContainer = document.getElementById("quizContainer");
        quizContainer.innerHTML = activeQuestions.map((q, idx) => `
      <div class="savol-karta p-3 mb-3 shadow-sm">
        <p class="fw-bold mb-2 text-navy">${idx + 1}. ${q.question}</p>
        ${q.options.map((opt, oIdx) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="q_${q.id}" id="q_${q.id}_${oIdx}" value="${oIdx}">
            <label class="form-check-label" for="q_${q.id}_${oIdx}">
              ${String.fromCharCode(65 + oIdx)}) ${opt}
            </label>
          </div>
        `).join("")}
      </div>
    `).join("");

        document.getElementById("submitExamBtn").disabled = false;
        startTimer();
    });
}

function finishExam(isAuto) {
    if (!currentStudent || activeQuestions.length === 0) return;
    clearInterval(timerInterval);

    let score = 0;
    activeQuestions.forEach(q => {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (selected && Number(selected.value) === q.correct) {
            score++;
        }
    });

    const total = activeQuestions.length;
    const percent = Math.round((score / total) * 100);
    const today = new Date().toLocaleDateString("uz-UZ");

    results.unshift({
        name: currentStudent.name,
        group: currentStudent.group,
        subject: currentStudent.subject,
        score,
        total,
        percent,
        date: today
    });
    saveData();

    const alertBox = document.getElementById("examResultAlert");
    if (alertBox) {
        alertBox.className = `alert ${percent >= 60 ? "alert-success" : "alert-warning"} mt-3 mb-0`;
        alertBox.innerHTML = `
      <i class="bi bi-award-fill me-2"></i>
      <strong>${isAuto ? "Vaqt tugadi! " : "Imtihon yakunlandi! "}</strong>
      ${currentStudent.name} (${currentStudent.group}): <b>${score}/${total}</b> ball (<b>${percent}%</b>).
      <a href="natijalar.html" class="alert-link ms-2">Natijalar jadvalini ko'rish →</a>
    `;
    }
    const btn = document.getElementById("submitExamBtn");
    if (btn) btn.disabled = true;
}

// Natijalar jadvalini chizish (natijalar.html)
function renderResultsTable() {
    const tbody = document.getElementById("resultsTableBody");
    if (!tbody) return;

    if (results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">Hozircha natijalar mavjud emas.</td></tr>`;
        return;
    }

    tbody.innerHTML = results.map((r, i) => {
        const passed = r.percent >= 60;
        return `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-semibold">${r.name}</td>
        <td><span class="badge bg-light text-dark border">${r.group}</span></td>
        <td>${r.subject}</td>
        <td>${r.score} / ${r.total}</td>
        <td><strong>${r.percent}%</strong></td>
        <td>${r.date}</td>
        <td>
          <span class="badge ${passed ? "bg-success" : "bg-danger"}">
            ${passed ? "O'tdi" : "Qayta topshirish"}
          </span>
        </td>
      </tr>
    `;
    }).join("");
}

function clearAllResults() {
    if (confirm("Barcha natijalarni o'chirishni tasdiqlaysizmi?")) {
        results = [];
        saveData();
        renderResultsTable();
    }
}

// Savollar ro'yxatini chizish va yangi savol qo'shish (qollanma.html)
function renderQuestionBankList() {
    const listEl = document.getElementById("questionBankList");
    if (!listEl) return;

    listEl.innerHTML = questions.map(q => `
    <li class="list-group-item d-flex justify-content-between align-items-start gap-2">
      <div class="ms-2 me-auto">
        <div class="fw-bold">${q.question}</div>
        <small class="text-muted">To'g'ri javob: ${q.options[q.correct]}</small>
      </div>
      <span class="badge bg-primary rounded-pill">${q.subject}</span>
    </li>
  `).join("");
}

const addQForm = document.getElementById("addQuestionForm");
if (addQForm) {
    addQForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!addQForm.checkValidity()) {
            e.stopPropagation();
            addQForm.classList.add("was-validated");
            return;
        }

        const subject = document.getElementById("newSubject").value;
        const question = document.getElementById("newQuestionText").value.trim();
        const opt0 = document.getElementById("opt0").value.trim();
        const opt1 = document.getElementById("opt1").value.trim();
        const opt2 = document.getElementById("opt2").value.trim();
        const correct = Number(document.getElementById("correctOpt").value);

        questions.push({
            id: Date.now(),
            subject,
            question,
            options: [opt0, opt1, opt2],
            correct
        });

        saveData();
        renderQuestionBankList();
        addQForm.reset();
        addQForm.classList.remove("was-validated");

        const savedAlert = document.getElementById("adminSaveAlert");
        if (savedAlert) {
            savedAlert.classList.remove("d-none");
            setTimeout(() => savedAlert.classList.add("d-none"), 3000);
        }
    });
}

renderResultsTable();
renderQuestionBankList();