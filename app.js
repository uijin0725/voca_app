// ==========================================
// 1. Supabase 연동 설정
// ==========================================
const SUPABASE_URL = "https://dgqhoawgmbfaqbzgjexu.supabase.co";
const SUPABASE_KEY = "sb_publishable_41UG8gEXQxji7VsL7NBXkQ_vstt0RcE";

let supabaseClient = null;

try {
  if (typeof supabase !== "undefined") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error("Supabase 초기화 오류:", e);
}

// ==========================================
// 2. 상태 관리 변수
// ==========================================
let studySets = JSON.parse(localStorage.getItem("my_voca_sets")) || {
  "기본 예제": [
    { q: "apple", a: "사과" },
    { q: "banana", a: "바나나" },
    { q: "cherry", a: "체리" },
    { q: "grape", a: "포도" }
  ]
};
let historyRecords = JSON.parse(localStorage.getItem("my_voca_records")) || [];
let currentSetName = "";
let words = [];
let currentMode = "card";

let currentIndex = 0;
let isFlipped = false;

let quizQueue = [];
let quizIndex = 0;
let quizWrongs = [];

let examWords = [];
let examSubmitted = false;
let userGrades = [];

// DOM 요소 캐싱
const setListElement = document.getElementById("setList");
const mobileSetSelect = document.getElementById("mobileSetSelect");
const setNameInput = document.getElementById("setNameInput");
const csvFileInput = document.getElementById("csvFileInput");
const currentSetTitle = document.getElementById("currentSetTitle");

const cardModeView = document.getElementById("cardModeView");
const learnModeView = document.getElementById("learnModeView");
const resultModeView = document.getElementById("resultModeView");
const examModeView = document.getElementById("examModeView");
const recordModeView = document.getElementById("recordModeView");

const cardElement = document.getElementById("card");
const cardStatus = document.getElementById("cardStatus");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const quizQuestion = document.getElementById("quizQuestion");
const optionsGrid = document.getElementById("optionsGrid");
const quizStatus = document.getElementById("quizStatus");
const resultScore = document.getElementById("resultScore");
const wrongList = document.getElementById("wrongList");

const examTbody = document.getElementById("examTbody");
const correctHeader = document.getElementById("correctHeader");
const gradeHeader = document.getElementById("gradeHeader");
const submitExamBtn = document.getElementById("submitExamBtn");
const saveExamBtn = document.getElementById("saveExamBtn");
const resetExamBtn = document.getElementById("resetExamBtn");
const scoreText = document.getElementById("scoreText");

const recordTable = document.getElementById("recordTable");
const recordTbody = document.getElementById("recordTbody");
const noRecordMsg = document.getElementById("noRecordMsg");
const wrongModal = document.getElementById("wrongModal");
const modalWrongList = document.getElementById("modalWrongList");

// 앱 구동 시작
window.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  if (supabaseClient) {
    await loadSetsFromCloud();
    await loadRecordsFromCloud();
  } else {
    renderSetList();
    renderMobileSelect();
  }

  const keys = Object.keys(studySets);
  if (keys.length > 0) {
    selectSet(keys[0]);
  } else {
    currentSetTitle.innerText = "단어 세트를 CSV 파일로 등록해 주세요.";
    cardElement.innerText = "등록된 세트가 없습니다.";
    cardStatus.innerText = "0 / 0";
  }
}

// ------------------------------------------
// Supabase 클라우드 데이터 통신
// ------------------------------------------
async function loadSetsFromCloud() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from("voca_sets")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      studySets = {};
      data.forEach(row => {
        studySets[row.name] = row.words;
      });
      localStorage.setItem("my_voca_sets", JSON.stringify(studySets));
    }
    renderSetList();
    renderMobileSelect();
  } catch (err) {
    console.error("클라우드 단어 세트 로드 실패:", err.message);
  }
}

async function loadRecordsFromCloud() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from("voca_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      historyRecords = data.map(r => ({
        id: r.id,
        date: r.date_str,
        setName: r.set_name,
        type: r.type,
        score: r.score,
        rate: r.rate,
        wrongs: r.wrongs
      }));
      localStorage.setItem("my_voca_records", JSON.stringify(historyRecords));
    }
  } catch (err) {
    console.error("클라우드 기록 로드 실패:", err.message);
  }
}

// ------------------------------------------
// 모드 전환
// ------------------------------------------
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  cardModeView.style.display = "none";
  learnModeView.style.display = "none";
  resultModeView.style.display = "none";
  examModeView.style.display = "none";
  recordModeView.style.display = "none";

  if (mode === 'card') {
    document.getElementById("tabCard").classList.add("active");
    cardModeView.style.display = "flex";
    updateCard();
    updateButtons();
  } else if (mode === 'learn') {
    document.getElementById("tabLearn").classList.add("active");
    startLearnMode();
  } else if (mode === 'exam') {
    const tabExam = document.getElementById("tabExam");
    if (tabExam) tabExam.classList.add("active");
    startExamMode();
  } else if (mode === 'record') {
    document.getElementById("tabRecord").classList.add("active");
    startRecordMode();
  }
}

function selectSet(name) {
  if (!name) return;
  currentSetName = name;
  words = studySets[name] || [];
  currentIndex = 0;
  currentSetTitle.innerText = `현재 세트: ${name} (${words.length}단어)`;

  renderSetList();
  if (mobileSetSelect) mobileSetSelect.value = name;

  if (currentMode === 'card') {
    updateCard();
    updateButtons();
  } else if (currentMode === 'learn') {
    startLearnMode();
  } else if (currentMode === 'exam') {
    startExamMode();
  }
}

// ------------------------------------------
// 1) 단어장 모드
// ------------------------------------------
function updateCard() {
  if (!words || words.length === 0) {
    cardElement.innerText = "단어가 비어 있습니다.";
    cardStatus.innerText = "0 / 0";
    return;
  }
  isFlipped = false;
  cardElement.innerText = words[currentIndex].q;
  cardElement.style.color = "#1e293b";
  cardStatus.innerText = `${currentIndex + 1} / ${words.length}`;
}

function flipCard() {
  if (!words || words.length === 0) return;
  isFlipped = !isFlipped;
  if (isFlipped) {
    cardElement.innerText = words[currentIndex].a;
    cardElement.style.color = "#0284c7";
  } else {
    cardElement.innerText = words[currentIndex].q;
    cardElement.style.color = "#1e293b";
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCard();
    updateButtons();
  }
}

function nextCard() {
  if (currentIndex < words.length - 1) {
    currentIndex++;
    updateCard();
    updateButtons();
  }
}

function updateButtons() {
  prevBtn.disabled = (currentIndex === 0 || !words || words.length === 0);
  nextBtn.disabled = (!words || words.length === 0 || currentIndex === words.length - 1);
}

// ------------------------------------------
// 2) 학습(4지선다) 모드
// ------------------------------------------
function startLearnMode() {
  if (!words || words.length === 0) {
    alert("학습할 단어가 없습니다.");
    switchMode("card");
    return;
  }
  if (words.length < 4) {
    alert("4지선다 보기를 만들려면 단어가 최소 4개 이상이어야 합니다.");
    switchMode("card");
    return;
  }

  quizQueue = [...words].sort(() => Math.random() - 0.5);
  quizIndex = 0;
  quizWrongs = [];

  cardModeView.style.display = "none";
  resultModeView.style.display = "none";
  examModeView.style.display = "none";
  recordModeView.style.display = "none";
  learnModeView.style.display = "flex";

  renderQuizStep();
}

function renderQuizStep() {
  if (quizIndex >= quizQueue.length) {
    finishQuiz();
    return;
  }

  const current = quizQueue[quizIndex];
  quizQuestion.innerText = current.q;
  quizStatus.innerText = `${quizIndex + 1} / ${quizQueue.length}`;

  const otherPool = words.filter(w => w.q !== current.q).sort(() => Math.random() - 0.5);
  const choices = [current.a, otherPool[0].a, otherPool[1].a, otherPool[2].a].sort(() => Math.random() - 0.5);

  optionsGrid.innerHTML = "";
  choices.forEach(ans => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = ans;
    btn.onclick = () => {
      if (ans !== current.a) {
        quizWrongs.push({ q: current.q, selected: ans, correct: current.a });
      }
      quizIndex++;
      renderQuizStep();
    };
    optionsGrid.appendChild(btn);
  });
}

async function finishQuiz() {
  learnModeView.style.display = "none";
  resultModeView.style.display = "flex";

  const total = quizQueue.length;
  const correctCount = total - quizWrongs.length;
  resultScore.innerText = `점수: ${correctCount} / ${total}`;

  wrongList.innerHTML = "";
  if (quizWrongs.length === 0) {
    wrongList.innerHTML = "<div style='text-align:center; padding:16px; color:#10b981; font-weight:bold;'>모든 문제를 맞혔습니다!</div>";
  } else {
    quizWrongs.forEach(w => {
      const div = document.createElement("div");
      div.className = "wrong-item";
      div.innerHTML = `
        <div class="wrong-word">${w.q}</div>
        <div class="wrong-answer">내가 고른 답: ${w.selected}</div>
        <div class="correct-answer">정답: ${w.correct}</div>
      `;
      wrongList.appendChild(div);
    });
  }

  await saveRecordHandler("학습", currentSetName, correctCount, total, quizWrongs);
}

// ------------------------------------------
// 3) 시험 모드 (PC 전용)
// ------------------------------------------
function startExamMode() {
  if (!words || words.length === 0) {
    alert("시험 볼 단어가 없습니다.");
    switchMode("card");
    return;
  }

  examModeView.style.display = "flex";
  examSubmitted = false;
  examWords = [...words].sort(() => Math.random() - 0.5);
  userGrades = new Array(examWords.length).fill(null);

  correctHeader.style.display = "none";
  gradeHeader.style.display = "none";
  submitExamBtn.style.display = "inline-block";
  saveExamBtn.style.display = "none";
  resetExamBtn.style.display = "none";
  scoreText.innerText = "답안 작성 중...";

  examTbody.innerHTML = "";
  examWords.forEach((word, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td style="font-weight: 600;">${word.q}</td>
      <td><input type="text" class="exam-input" id="examInput_${idx}" placeholder="뜻 입력"></td>
      <td class="exam-ans-cell" style="display: none; color: #0284c7; font-weight: 500;">${word.a}</td>
      <td class="exam-grade-cell" style="display: none; text-align: center;">
        <div style="display: flex; gap: 4px; justify-content: center;">
          <button class="grade-btn btn-o" onclick="setGrade(${idx}, 'O')">O</button>
          <button class="grade-btn btn-x" onclick="setGrade(${idx}, 'X')">X</button>
        </div>
      </td>
    `;
    examTbody.appendChild(tr);
  });
}

function submitExam() {
  examSubmitted = true;
  document.querySelectorAll(".exam-input").forEach(i => {
    i.disabled = true;
    i.style.background = "#f8fafc";
  });

  correctHeader.style.display = "table-cell";
  gradeHeader.style.display = "table-cell";
  document.querySelectorAll(".exam-ans-cell").forEach(td => td.style.display = "table-cell");
  document.querySelectorAll(".exam-grade-cell").forEach(td => td.style.display = "table-cell");

  submitExamBtn.style.display = "none";
  saveExamBtn.style.display = "inline-block";
  resetExamBtn.style.display = "inline-block";

  updateExamScore();
}

function setGrade(idx, type) {
  if (!examSubmitted) return;
  userGrades[idx] = type;

  const tr = examTbody.children[idx];
  const btnO = tr.querySelector(".btn-o");
  const btnX = tr.querySelector(".btn-x");

  if (type === 'O') {
    btnO.classList.add("selected");
    btnX.classList.remove("selected");
  } else {
    btnX.classList.add("selected");
    btnO.classList.remove("selected");
  }
  updateExamScore();
}

function updateExamScore() {
  const total = examWords.length;
  const oCount = userGrades.filter(g => g === 'O').length;
  const xCount = userGrades.filter(g => g === 'X').length;
  const checked = oCount + xCount;
  const rate = checked > 0 ? ((oCount / checked) * 100).toFixed(1) : 0;

  scoreText.innerHTML = `맞음: <b>${oCount}</b> / ${total} (정답률: <b>${rate}%</b>) | 채점 진행: ${checked}/${total}`;
}

async function saveExamRecord() {
  const total = examWords.length;
  const oCount = userGrades.filter(g => g === 'O').length;
  const checked = userGrades.filter(g => g !== null).length;

  if (checked < total) {
    if (!confirm(`아직 채점하지 않은 문항이 있습니다. (${checked}/${total})\n이대로 저장할까요?`)) {
      return;
    }
  }

  const wrongs = [];
  userGrades.forEach((grade, idx) => {
    if (grade === 'X') {
      const userVal = document.getElementById(`examInput_${idx}`)?.value.trim() || "(미입력)";
      wrongs.push({ q: examWords[idx].q, selected: userVal, correct: examWords[idx].a });
    }
  });

  await saveRecordHandler("시험", currentSetName, oCount, total, wrongs);
  alert("시험 기록이 저장되었습니다.");
  saveExamBtn.disabled = true;
}

// ------------------------------------------
// 4) 기록 모드 및 모달
// ------------------------------------------
async function saveRecordHandler(type, setName, correct, total, wrongArr) {
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const rate = ((correct / total) * 100).toFixed(1);

  const newRec = {
    id: Date.now(),
    date: dateStr,
    setName: setName || "세트 미지정",
    type: type,
    score: `${correct} / ${total}`,
    rate: `${rate}%`,
    wrongs: wrongArr
  };

  historyRecords.unshift(newRec);
  localStorage.setItem("my_voca_records", JSON.stringify(historyRecords));

  if (supabaseClient) {
    try {
      await supabaseClient.from("voca_records").insert([
        {
          date_str: dateStr,
          set_name: setName || "세트 미지정",
          type: type,
          score: `${correct} / ${total}`,
          rate: `${rate}%`,
          wrongs: wrongArr
        }
      ]);
      await loadRecordsFromCloud();
    } catch (e) {
      console.error("클라우드 기록 저장 실패:", e);
    }
  }
}

function startRecordMode() {
  recordModeView.style.display = "flex";
  recordTbody.innerHTML = "";

  if (!historyRecords || historyRecords.length === 0) {
    recordTable.style.display = "none";
    noRecordMsg.style.display = "block";
    return;
  }

  recordTable.style.display = "table";
  noRecordMsg.style.display = "none";

  historyRecords.forEach(rec => {
    const tr = document.createElement("tr");
    const hasWrongs = rec.wrongs && rec.wrongs.length > 0;

    tr.innerHTML = `
      <td>${rec.date}</td>
      <td style="font-weight: 500;">${rec.setName}</td>
      <td><span>${rec.type}</span></td>
      <td><b>${rec.score}</b></td>
      <td style="color: #0284c7; font-weight: bold;">${rec.rate}</td>
      <td style="text-align: center;">
        ${hasWrongs 
          ? `<button class="view-wrong-btn" onclick="openWrongModal(${rec.id})">${rec.wrongs.length}개 보기</button>` 
          : `<span style="color: #10b981; font-size: 13px;">만점</span>`}
      </td>
    `;
    recordTbody.appendChild(tr);
  });
}

function openWrongModal(id) {
  const target = historyRecords.find(r => r.id === id);
  if (!target || !target.wrongs) return;

  modalWrongList.innerHTML = "";
  target.wrongs.forEach(w => {
    const div = document.createElement("div");
    div.className = "wrong-item";
    div.innerHTML = `
      <div class="wrong-word">${w.q}</div>
      <div class="wrong-answer">내가 적은 답: ${w.selected}</div>
      <div class="correct-answer">정답: ${w.correct}</div>
    `;
    modalWrongList.appendChild(div);
  });
  wrongModal.style.display = "flex";
}

function closeModal() {
  wrongModal.style.display = "none";
}

async function clearRecords() {
  if (!confirm("모든 기록을 삭제할까요?")) return;

  historyRecords = [];
  localStorage.removeItem("my_voca_records");

  if (supabaseClient) {
    try {
      await supabaseClient.from("voca_records").delete().neq("id", 0);
    } catch (e) {
      console.error("클라우드 삭제 오류:", e);
    }
  }

  startRecordMode();
}

// ------------------------------------------
// 세트 등록 (UTF-8 / CP949 자동 판별)
// ------------------------------------------
if (csvFileInput) {
  csvFileInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    let name = setNameInput.value.trim() || file.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();

    reader.onload = async function(evt) {
      const buffer = evt.target.result;
      let text = "";

      try {
        const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
        text = utf8Decoder.decode(buffer);
      } catch (err) {
        const eucDecoder = new TextDecoder("euc-kr");
        text = eucDecoder.decode(buffer);
      }

      const parsed = parseData(text);
      if (parsed.length === 0) {
        alert("단어를 읽을 수 없습니다. CSV 형식을 확인해 주세요.");
        return;
      }

      studySets[name] = parsed;
      localStorage.setItem("my_voca_sets", JSON.stringify(studySets));

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from("voca_sets")
            .upsert({ name: name, words: parsed }, { onConflict: "name" });

          if (error) throw error;
          await loadSetsFromCloud();
        } catch (err) {
          alert("클라우드 저장 실패: " + err.message);
        }
      }

      setNameInput.value = "";
      csvFileInput.value = "";
      renderSetList();
      renderMobileSelect();
      selectSet(name);
    };

    reader.readAsArrayBuffer(file);
  });
}

function renderSetList() {
  if (!setListElement) return;
  setListElement.innerHTML = "";
  Object.keys(studySets).forEach(name => {
    const li = document.createElement("li");
    li.className = `set-item ${name === currentSetName ? 'active' : ''}`;

    const span = document.createElement("span");
    span.innerText = name;
    span.style.flex = "1";
    span.onclick = () => selectSet(name);

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.innerHTML = "&times;";
    del.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm(`'${name}' 세트를 삭제할까요?`)) return;

      delete studySets[name];
      localStorage.setItem("my_voca_sets", JSON.stringify(studySets));

      if (supabaseClient) {
        try {
          await supabaseClient.from("voca_sets").delete().eq("name", name);
          await loadSetsFromCloud();
        } catch (err) {
          console.error("클라우드 삭제 실패:", err);
        }
      }

      const rem = Object.keys(studySets);
      if (rem.length > 0) selectSet(rem[0]);
      else {
        currentSetName = "";
        words = [];
        updateCard();
        renderSetList();
        renderMobileSelect();
      }
    };

    li.appendChild(span);
    li.appendChild(del);
    setListElement.appendChild(li);
  });
}

function renderMobileSelect() {
  if (!mobileSetSelect) return;
  mobileSetSelect.innerHTML = "";
  const keys = Object.keys(studySets);
  keys.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.innerText = name;
    if (name === currentSetName) opt.selected = true;
    mobileSetSelect.appendChild(opt);
  });
}

function parseData(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.trim().split(/\r?\n/);
  return lines.map(line => {
    if (line.includes("\t")) {
      const parts = line.split("\t");
      return { q: parts[0]?.trim(), a: parts[1]?.trim() };
    }
    const res = [];
    let inQuote = false;
    let entry = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuote = !inQuote;
      else if (c === ',' && !inQuote) {
        res.push(entry.trim());
        entry = "";
      } else {
        entry += c;
      }
    }
    res.push(entry.trim());
    if (res.length >= 2) {
      return {
        q: res[0].replace(/^"|"$/g, '').trim(),
        a: res.slice(1).join(", ").replace(/^"|"$/g, '').trim()
      };
    }
    return null;
  }).filter(item => item && item.q && item.a);
}
