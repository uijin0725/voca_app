* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
  display: flex;
}

/* ================================================= */
/* 1. 반응형 분기 클래스 */
/* ================================================= */
.mobile-only {
  display: none !important;
}

/* ================================================= */
/* 2. PC 기본 레이아웃 (데스크톱) */
/* ================================================= */
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100vh;
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.add-set-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.add-set-box input[type="text"] {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.upload-btn-label {
  text-align: center;
  background: #0ea5e9;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
}

#csvFileInput {
  display: none;
}

.set-list {
  list-style: none;
  overflow-y: auto;
  flex: 1;
}

.set-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  cursor: pointer;
  background: #f1f5f9;
  font-size: 14px;
}

.set-item.active {
  background: #0284c7;
  color: white;
  font-weight: bold;
}

.delete-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}

.set-item.active .delete-btn {
  color: white;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.top-nav {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 12px 24px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 18px;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: #64748b;
  font-weight: bold;
  transition: background-color 0.15s;
}

.tab-btn.active {
  background: #0284c7;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  width: 100%;
}

.current-set-title {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 16px;
}

.mode-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ================================================= */
/* 3. 모드별 컴포넌트 */
/* ================================================= */

/* 1) 단어장 카드 */
.card {
  width: 100%;
  max-width: 440px;
  min-height: 250px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  padding: 28px;
  line-height: 1.5;
  user-select: none;
  word-break: keep-all;
}

.status {
  margin-top: 14px;
  color: #64748b;
  font-size: 15px;
}

.btn-group {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 440px;
}

.btn-group button {
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: #0284c7;
  color: white;
  font-weight: 600;
}

.btn-group button:disabled {
  background: #cbd5e1 !important;
  cursor: not-allowed;
}

/* 2) 4지선다 퀴즈 */
.quiz-container {
  max-width: 480px;
  width: 100%;
}

.quiz-question-card {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  word-break: keep-all;
}

.options-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  width: 100%;
  padding: 16px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  line-height: 1.4;
  color: #334155;
  word-break: keep-all;
}

.option-btn:active {
  background: #e0f2fe;
  border-color: #0284c7;
}

/* 결과 창 & 오답 */
.result-container {
  max-width: 500px;
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.result-score {
  font-size: 24px;
  font-weight: bold;
  color: #0284c7;
  margin: 14px 0;
  text-align: center;
}

.wrong-list {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.wrong-item {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  line-height: 1.4;
}

.wrong-word {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
}

.wrong-answer {
  color: #ef4444;
}

.correct-answer {
  color: #10b981;
}

.action-btn {
  padding: 10px 20px;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #0284c7;
  color: white;
  font-weight: 500;
}

/* 3) 테이블 (시험 & 기록 공통) */
.exam-container, .record-container {
  max-width: 850px;
  width: 100%;
}

.data-table {
  width: 100%;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-collapse: collapse;
  overflow: hidden;
}

.data-table th, .data-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.data-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.exam-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.grade-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  font-weight: bold;
  cursor: pointer;
}

.grade-btn.btn-o.selected {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.grade-btn.btn-x.selected {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.exam-bottom-panel {
  position: sticky;
  bottom: 16px;
  background: #ffffff;
  padding: 14px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 14px;
  border: 1px solid #e2e8f0;
}

.record-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.delete-all-btn {
  background: #ef4444;
  padding: 6px 12px;
  font-size: 13px;
}

.no-data-msg {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  background: #ffffff;
  width: 100%;
  border-radius: 10px;
}

.view-wrong-btn {
  padding: 6px 10px;
  font-size: 12px;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* 모달 팝업 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  max-width: 440px;
}

/* ================================================= */
/* 4. 모바일 화면 전용 최적화 (가로 폭 768px 이하) */
/* ================================================= */
@media (max-width: 768px) {
  /* PC 전용 요소 완전 숨김 (사이드바, 시험 버튼) */
  .pc-only {
    display: none !important;
  }

  /* 모바일 전용 요소 활성화 */
  .mobile-only {
    display: block !important;
  }

  body {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .main-wrapper {
    height: auto;
    min-height: 100vh;
    overflow-y: visible;
  }

  /* 모바일 상단 바: 세트 선택 + 탭 3개 균등 배치 */
  .top-nav {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
    gap: 10px;
  }

  .mobile-set-selector select {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1.5px solid #0284c7;
    background: #ffffff;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
  }

  .nav-buttons {
    display: flex;
    width: 100%;
    gap: 6px;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 15px;
    border-radius: 8px;
  }

  /* 모바일 메인 영역 */
  .main-content {
    padding: 16px 14px 40px 14px;
  }

  /* 플래시카드 터치 최적화 */
  .card {
    min-height: 280px;
    font-size: 26px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
    padding: 20px;
  }

  .btn-group {
    max-width: 100%;
  }

  .btn-group button {
    padding: 14px;
    font-size: 17px;
    border-radius: 12px;
  }

  /* 퀴즈 모드 */
  .quiz-question-card {
    font-size: 22px;
    padding: 22px 16px;
  }

  .option-btn {
    padding: 16px 14px;
    font-size: 16px;
    border-radius: 12px;
  }

  /* 기록 모드 모바일 테이블 축소 */
  .data-table th, .data-table td {
    padding: 10px 8px;
    font-size: 13px;
  }
}
