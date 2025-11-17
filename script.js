/*
  script.js - 各章題庫與檢查邏輯（前端單檔）
  此檔會在每個頁面載入時檢查 DOM，並在對應容器渲染題目。
  各頁面不重複題目與內容。
*/

document.addEventListener('DOMContentLoaded', () => {
  injectDynamicBackground(); // 注入動態背景
  injectUserDataDropdown(); // 注入「我的資料」下拉選單
});

document.addEventListener('DOMContentLoaded', () => {
  // 注入浮動導覽員助手（所有頁面）
  injectFloatingNavigator();

  // 記錄訪問頁面
  const visited = (sessionStorage.getItem('visitedPages') || '').split(',').filter(Boolean);
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (!visited.includes(currentPage)) {
    visited.push(currentPage);
    sessionStorage.setItem('visitedPages', visited.join(','));
  }

  if (document.getElementById('quiz-root')) {
    renderQuiz();
    document.getElementById('checkQuiz').addEventListener('click', checkQuiz);
  }

  if (document.getElementById('vocab-form')) {
    renderVocab();
    document.getElementById('checkVocab').addEventListener('click', checkVocab);
  }

  if (document.getElementById('reading-root')) {
    renderReading();
    document.getElementById('checkReading').addEventListener('click', checkReading);
  }
});

/* -------------------- 第一章：文法（單選 x10） -------------------- */
const grammarQuestions = [
  {q: "Q1. The manager asked everyone to arrive ______ 8:30 for the morning meeting.",
   opts: {A:'in',B:'at',C:'on',D:'by'}, ans: 'B'},
  {q: "Q2. Our company plans to ______ its new product line next month.",
   opts: {A:'launch',B:'inform',C:'discuss',D:'prevent'}, ans: 'A'},
  {q: "Q3. The meeting has been postponed ______ further notice.",
   opts: {A:'unless',B:'until',C:'since',D:'despite'}, ans: 'B'},
  {q: "Q4. Please make sure that all documents are ______ before you submit them.",
   opts: {A:'reviewing',B:'review',C:'reviewed',D:'reviews'}, ans: 'C'},
  {q: "Q5. Due to the heavy rain, the outdoor concert was ______ canceled.",
   opts: {A:'recently',B:'originally',C:'eventually',D:'temporarily'}, ans: 'C'},
  {q: "Q6. The new intern was praised for her ability to handle tasks ______.",
   opts: {A:'efficiently',B:'efficiency',C:'efficient',D:"efficiency’s"}, ans: 'A'},
  {q: "Q7. Customers who purchase more than $50 will receive a free ______.",
   opts: {A:'sample',B:'service',C:'advice',D:'permission'}, ans: 'A'},
  {q: "Q8. The hotel offers complimentary breakfast for all ______ guests.",
   opts: {A:'register',B:'registers',C:'registration',D:'registered'}, ans: 'D'},
  {q: "Q9. Because of the new policy, employees must submit their reports ______ the deadline.",
   opts: {A:'above',B:'beyond',C:'before',D:'over'}, ans: 'C'},
  {q: "Q10. Mr. Chen was promoted to sales manager ______ his outstanding performance.",
   opts: {A:'because',B:'due to',C:'although',D:'even though'}, ans: 'B'}
];

/* -------------------- 新增：Quiz（Moodle 與線上學習平台基礎） -------------------- */
const quizQuestions = [
  {q: 'What is Moodle mainly used for?', opts: {A:'Watching movies', B:'Online learning and course management', C:'Playing games', D:'Social networking'}, ans: 'B'},
  {q: 'Which of the following is NOT a feature of Moodle?', opts: {A:'Discussion forums', B:'Quizzes', C:'Video streaming platform', D:'Assignments'}, ans: 'C'},
  {q: 'Teachers can use Moodle to:', opts: {A:'Manage grades', B:'Sell products', C:'Make 3D animations', D:'Play music'}, ans: 'A'},
  {q: 'Moodle courses are organized using:', opts: {A:'Timelines only', B:'Workshops only', C:'Sections and activities', D:'Spreadsheets'}, ans: 'C'},
  {q: 'Which role typically has the most control over a Moodle course?', opts: {A:'Student', B:'Guest', C:'Teacher', D:'Observer'}, ans: 'C'},
  {q: 'Which activity allows teachers to give quizzes in Moodle?', opts: {A:'Forum', B:'Quiz', C:'Book', D:'Glossary'}, ans: 'B'},
  {q: 'Moodle is an example of which type of software?', opts: {A:'Operating system', B:'Learning Management System', C:'Database engine', D:'Graphic editor'}, ans: 'B'},
  {q: 'Which of the following helps students collaborate in Moodle?', opts: {A:'Discussion forums', B:'Anti-virus', C:'Video codecs', D:'Printer settings'}, ans: 'A'},
  {q: 'A teacher wants to collect assignments from students. Which Moodle tool should they use?', opts: {A:'Assignment', B:'Chat', C:'Calendar', D:'Profile'}, ans: 'A'},
  {q: 'Which of these can be used to track student progress in Moodle?', opts: {A:'Gradebook', B:'Wallpaper', C:'File explorer', D:'Image editor'}, ans: 'A'}
];

function renderQuiz(){
  const root = document.getElementById('quiz-root');
  if (root) renderQuizInto(root, 'quiz_');
}

function checkQuiz(){
  const root = document.getElementById('quiz-root');
  if (root) checkQuizGeneric('quiz_', root, 'quiz-result');
}

// Generic render function for quizzes into any container with a namePrefix for inputs
function renderQuizInto(rootElement, namePrefix){
  rootElement.innerHTML = '';
  quizQuestions.forEach((item, idx) => {
    const qBox = document.createElement('div'); qBox.className='question';
    const title = document.createElement('div'); title.className='q-title';
    title.textContent = `${idx+1}. ${item.q}`; qBox.appendChild(title);
    const opts = document.createElement('div'); opts.className='options';
    Object.keys(item.opts).forEach(key => {
      const label = document.createElement('label'); label.className='option-item';
      const radio = document.createElement('input'); radio.type='radio'; radio.name = `${namePrefix}${idx}`; radio.value = key; label.appendChild(radio);
      const span = document.createElement('span'); span.textContent = `${key}. ${item.opts[key]}`; label.appendChild(span);
      opts.appendChild(label);
    });
    qBox.appendChild(opts);
    rootElement.appendChild(qBox);
  });
}

// Generic check function for quiz rendered into a rootElement. namePrefix must match renderQuizInto
function checkQuizGeneric(namePrefix, rootElement, resultId){
  let score = 0;
  const qNodes = Array.from(rootElement.querySelectorAll('.question'));
  quizQuestions.forEach((item, idx) => {
    const sel = rootElement.querySelector(`input[name=${namePrefix}${idx}]:checked`);
    const qNode = qNodes[idx];
    if (!qNode) return;
    qNode.classList.remove('correct','wrong');
    const oldfb = qNode.querySelector('.feedback'); if (oldfb) oldfb.remove();
    if (sel && sel.value === item.ans){
      score++;
      qNode.classList.add('correct');
    } else {
      qNode.classList.add('wrong');
      let fb = document.createElement('div'); fb.className='feedback'; fb.textContent = `正確答案：${item.ans}. ${item.opts[item.ans]}`; qNode.appendChild(fb);
    }
  });
  const existing = document.getElementById(resultId); if (existing) existing.remove();
  const res = document.createElement('div'); res.id = resultId; res.className='result'; res.innerHTML = `<strong>得分：</strong> ${score} / ${quizQuestions.length}`;
  // if rootElement is inside a modal/container, append to nearest .container or body
  const container = rootElement.closest('.container') || document.querySelector('.container') || document.body;
  container.appendChild(res);

  // 檢查分數是否達到獎勵門檻 (60%)
  if (score / quizQuestions.length >= 0.6) {
    showRewardAnimation();
  }
  saveScoreHistory('第一章：選擇題', score, quizQuestions.length);
}

function renderGrammar(){
  const root = document.getElementById('grammar-root');
  root.innerHTML = '';
  grammarQuestions.forEach((item, idx) => {
    const qBox = document.createElement('div');
    qBox.className = 'question';

    const title = document.createElement('div');
    title.className = 'q-title';
    title.textContent = `${idx+1}. ${item.q}`;
    qBox.appendChild(title);

    const opts = document.createElement('div');
    opts.className = 'options';
    Object.keys(item.opts).forEach(key => {
      const label = document.createElement('label');
      label.className = 'option-item';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `g_${idx}`;
      radio.value = key;
      label.appendChild(radio);
      const span = document.createElement('span');
      span.textContent = `${key}. ${item.opts[key]}`;
      label.appendChild(span);
      opts.appendChild(label);
    });
    qBox.appendChild(opts);
    root.appendChild(qBox);
  });
}

function checkGrammar(){
  let score = 0;
  grammarQuestions.forEach((item, idx) => {
    const sel = document.querySelector(`input[name=g_${idx}]:checked`);
    const qNode = document.getElementsByClassName('question')[idx];
    // 清除先前標記
    qNode.classList.remove('correct','wrong');
    // 顯示結果
    if (sel && sel.value === item.ans){
      score += 1;
      qNode.classList.add('correct');
    } else {
      qNode.classList.add('wrong');
      // 顯示正確答案小提示
      let fb = qNode.querySelector('.feedback');
      if (!fb){
        fb = document.createElement('div'); fb.className='feedback muted';
        qNode.appendChild(fb);
      }
      fb.textContent = `正確答案：${item.ans}. ${item.opts[item.ans]}`;
    }
  });

  // 顯示總分
  const existing = document.getElementById('grammar-result');
  if (existing) existing.remove();
  const res = document.createElement('div');
  res.id = 'grammar-result';
  res.className = 'result';
  res.innerHTML = `<strong>得分：</strong> ${score} / ${grammarQuestions.length}`;
  document.querySelector('.container').appendChild(res);

  // 檢查分數是否達到獎勵門檻 (60%)
  if (score / grammarQuestions.length >= 0.6) {
    showRewardAnimation();
    // 儲存分數紀錄
    saveScoreHistory('第一章：選擇題', score, grammarQuestions.length);
    saveScoreHistory('第一章：選擇題', score, grammarQuestions.length);
  }
}

/* -------------------- 第二章：拼字（填寫 x10） -------------------- */
// Vocabulary for Chapter 2: E-learning Vocabulary (user-provided list)
const vocabQuestions = [
  {num:1, hint:'平台', answer:'platform'},
  {num:2, hint:'作業', answer:'assignment'},
  {num:3, hint:'測驗', answer:'quiz'},
  {num:4, hint:'帳號', answer:'account'},
  {num:5, hint:'上傳', answer:'upload'},
  {num:6, hint:'討論區', answer:'forum'},
  {num:7, hint:'教師', answer:'teacher'},
  {num:8, hint:'學生', answer:'student'},
  {num:9, hint:'課程', answer:'course'},
  {num:10, hint:'成績', answer:'grade'}
];
let currentVocabIndex = 0;
let vocabScore = 0;
let vocabChecked = false; // whether current word has been checked (to toggle Next)

function renderVocab(){
  const container = document.getElementById('vocab-form');
  container.innerHTML = '';

  // top info
  const info = document.createElement('div'); info.className = 'q-title';
  info.id = 'vocab-hint';
  container.appendChild(info);

  const wrapper = document.createElement('div'); wrapper.className = 'tiles-wrapper';

  const slotsContainer = document.createElement('div'); slotsContainer.className = 'slots-container'; slotsContainer.id = 'slots-container';
  wrapper.appendChild(slotsContainer);

  const tilesContainer = document.createElement('div'); tilesContainer.className = 'tiles-container'; tilesContainer.id = 'tiles-container';
  wrapper.appendChild(tilesContainer);

  container.appendChild(wrapper);

  const smallControls = document.createElement('div'); smallControls.className = 'small-controls';
  const resetBtn = document.createElement('button'); resetBtn.className = 'btn small'; resetBtn.type='button'; resetBtn.textContent = '重設';
  resetBtn.addEventListener('click', () => { setupVocabFor(currentVocabIndex); });
  smallControls.appendChild(resetBtn);

  const revealBtn = document.createElement('button'); revealBtn.className = 'btn small ghost'; revealBtn.type='button'; revealBtn.textContent = '揭示答案';
  revealBtn.addEventListener('click', () => { revealVocabAnswer(); });
  smallControls.appendChild(revealBtn);

  // Next button (hidden until user checks)
  const nextBtn = document.createElement('button'); nextBtn.className='btn small'; nextBtn.type='button'; nextBtn.id='vocabNextBtn'; nextBtn.textContent='Next'; nextBtn.style.display='none';
  nextBtn.addEventListener('click', () => { goToNextVocab(); });
  smallControls.appendChild(nextBtn);

  container.appendChild(smallControls);

  // navigation hint
  updateVocabUI();
  setupVocabFor(currentVocabIndex);
}

function updateVocabUI(){
  const info = document.getElementById('vocab-hint');
  const item = vocabQuestions[currentVocabIndex];
  info.textContent = `${item.num}. ${item.hint} （拼字長度: ${item.answer.length}）`;
  // reset check button text
  const btn = document.getElementById('checkVocab'); if (btn) { btn.textContent = 'Check'; }
  vocabChecked = false;
}

function setupVocabFor(index){
  const item = vocabQuestions[index];
  const slotsContainer = document.getElementById('slots-container');
  const tilesContainer = document.getElementById('tiles-container');
  slotsContainer.innerHTML = '';
  tilesContainer.innerHTML = '';

  const letters = item.answer.split('');
  // scramble
  const scrambled = shuffleArray(letters.slice());

  // create slots
  letters.forEach((ltr, i) => {
    const slot = document.createElement('div'); slot.className = 'slot'; slot.dataset.index = i;
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', slotDropHandler);
    // allow clicking to remove tile
    slot.addEventListener('click', () => { if (slot.firstChild) moveTileToContainer(slot.firstChild); });
    slotsContainer.appendChild(slot);
  });

  // create tiles
  scrambled.forEach((ltr, i) => {
    const tile = document.createElement('div'); tile.className = 'tile'; tile.draggable = true;
    tile.id = `tile_${index}_${i}`; tile.dataset.letter = ltr; tile.textContent = ltr;
    tile.addEventListener('dragstart', tileDragStart);
    tile.addEventListener('click', () => { moveTileToFirstEmptySlot(tile); });
    tilesContainer.appendChild(tile);
  });

  // allow drop back to tiles container
  tilesContainer.addEventListener('dragover', e => e.preventDefault());
  tilesContainer.addEventListener('drop', e => {
    e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const tile = document.getElementById(id); if (tile) tilesContainer.appendChild(tile);
  });

  // clear any previous result
  const existing = document.getElementById('vocab-result'); if (existing) existing.remove();
}

function tileDragStart(e){ e.dataTransfer.setData('text/plain', e.target.id); }

function slotDropHandler(e){
  e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); const tile = document.getElementById(id); if (!tile) return;
  const slot = e.currentTarget;
  // if slot has child, move it back
  if (slot.firstChild){ moveTileToContainer(slot.firstChild); }
  slot.appendChild(tile);
}

function moveTileToContainer(tile){ const tilesContainer = document.getElementById('tiles-container'); tilesContainer.appendChild(tile); }

function moveTileToFirstEmptySlot(tile){ const slots = Array.from(document.querySelectorAll('.slot')); const empty = slots.find(s => !s.firstChild); if (empty){ empty.appendChild(tile); } }

function revealVocabAnswer(){
  const item = vocabQuestions[currentVocabIndex];
  const slots = Array.from(document.querySelectorAll('.slot'));
  // clear slots and place correct letters
  slots.forEach((s, i) => {
    // remove existing tile if any
    if (s.firstChild) moveTileToContainer(s.firstChild);
  });
  // create temporary tiles for correct answer and append in order
  const tilesContainer = document.getElementById('tiles-container');
  // remove any existing correct-display tiles
  item.answer.split('').forEach((ltr, i) => {
    const temp = document.createElement('div'); temp.className='tile'; temp.textContent = ltr; temp.draggable = false;
    const slot = document.querySelector(`.slot[data-index='${i}']`);
    if (slot) slot.appendChild(temp);
  });
}

function checkVocab(){
  // evaluate current word when Check pressed; Next is handled by separate next button
  const item = vocabQuestions[currentVocabIndex];
  const slots = Array.from(document.querySelectorAll('.slot'));
  let user = slots.map(s => s.firstChild ? s.firstChild.dataset.letter || s.firstChild.textContent : '').join('');
  // mark slots
  slots.forEach(s => s.classList.remove('correct','wrong'));
  const existing = document.getElementById('vocab-result'); if (existing) existing.remove();
  if (user.toLowerCase() === item.answer.toLowerCase()){
    // correct
    slots.forEach(s => s.classList.add('correct'));
    vocabScore++;
    vocabChecked = true;
    // show partial result
    const res = document.createElement('div'); res.id='vocab-result'; res.className='result correct'; res.innerHTML = `<strong>本題正確！</strong> 目前得分：${vocabScore} / ${vocabQuestions.length}`;
    document.querySelector('.container').appendChild(res);
  } else {
    // wrong
    slots.forEach(s => s.classList.add('wrong'));
    vocabChecked = false;
    const res = document.createElement('div'); res.id='vocab-result'; res.className='result wrong'; res.innerHTML = `<strong>答案不正確。</strong> 本題正確拼字為：${item.answer}`;
    document.querySelector('.container').appendChild(res);
  }
  // show Next button so user can proceed
  const nextBtn = document.getElementById('vocabNextBtn'); if (nextBtn) nextBtn.style.display = 'inline-block';
}

function goToNextVocab(){
  currentVocabIndex++;
  const nextBtn = document.getElementById('vocabNextBtn');
  const checkBtn = document.getElementById('checkVocab');
  if (currentVocabIndex >= vocabQuestions.length){
    // show final score
    const existing = document.getElementById('vocab-result'); if (existing) existing.remove();
    const res = document.createElement('div'); res.id='vocab-result'; res.className='result'; res.innerHTML = `<strong>完成！總分：</strong> ${vocabScore} / ${vocabQuestions.length}`;
    document.querySelector('.container').appendChild(res);
    if (nextBtn) nextBtn.style.display = 'none';
    if (checkBtn) checkBtn.disabled = true;

    // 在此處檢查最終分數是否達到獎勵門檻
    if (vocabScore / vocabQuestions.length >= 0.6) {
      showRewardAnimation();
    }
    // 儲存分數紀錄
    saveScoreHistory('第二章：拼字練習', vocabScore, vocabQuestions.length);
    saveScoreHistory('第二章：拼字練習', vocabScore, vocabQuestions.length);
  } else {
    // move to next
    updateVocabUI();
    setupVocabFor(currentVocabIndex);
    if (nextBtn) nextBtn.style.display = 'none';
    if (checkBtn) checkBtn.disabled = false;
  }
}

// Utility: shuffle array (Fisher-Yates)
function shuffleArray(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* -------------------- 第三章：閱讀理解（段落 + 每篇 3 題） -------------------- */
const readingPassages = [
  {
    passage: `Maria works at a small software company. Every morning she reviews the project schedule and meets with her team to set priorities. Last month, the company launched a new mobile app that has received positive feedback from users. Maria plans to continue improving the user interface based on customer suggestions.`,
    questions: [
      {q:'Why does Maria meet with her team each morning?', opts:{A:'To hire new staff',B:'To set priorities',C:'To count inventory',D:'To plan vacations'}, ans:'B'},
      {q:'What did the company launch last month?', opts:{A:'A marketing campaign',B:'A new office',C:'A mobile app',D:'A training course'}, ans:'C'},
      {q:'What will Maria do based on customer suggestions?', opts:{A:'Hire more staff',B:'Improve the interface',C:'Close the app',D:'Change the team'}, ans:'B'}
    ]
  },
  {
    passage: `The city library recently introduced extended hours to accommodate students who study late. The library also added more study spaces and upgraded its Wi-Fi network. As a result, visitor numbers have increased, especially in the evenings.`,
    questions: [
      {q:'Why did the library extend its hours?', opts:{A:'To renovate',B:'To accommodate students',C:'To reduce costs',D:'To hire staff'}, ans:'B'},
      {q:'What improvement was NOT mentioned?', opts:{A:'More study spaces',B:'Upgraded Wi-Fi',C:'New books',D:'Extended hours'}, ans:'C'},
      {q:'When did visitor numbers increase?', opts:{A:'Mornings',B:'Afternoons',C:'Evenings',D:'Weekends'}, ans:'C'}
    ]
  }
];

function renderReading(){
  const root = document.getElementById('reading-root'); root.innerHTML='';
  readingPassages.forEach((p, pidx) => {
    const box = document.createElement('div'); box.className='question';
    const para = document.createElement('p'); para.textContent = p.passage; box.appendChild(para);
    p.questions.forEach((qq, qidx) => {
      const qNum = pidx*3 + qidx + 1;
      const qBox = document.createElement('div'); qBox.className='options';
      const title = document.createElement('div'); title.className='q-title';
      title.textContent = `${qNum}. ${qq.q}`;
      box.appendChild(title);
      Object.keys(qq.opts).forEach(key => {
        const label = document.createElement('label'); label.className='option-item';
        const radio = document.createElement('input'); radio.type='radio';
        radio.name = `r_${pidx}_${qidx}`; radio.value = key; label.appendChild(radio);
        const span = document.createElement('span'); span.textContent = `${key}. ${qq.opts[key]}`; label.appendChild(span);
        box.appendChild(label);
      });
    });
    root.appendChild(box);
  });
}

function checkReading(){
  let total = 0, correct = 0;
  readingPassages.forEach((p, pidx) => {
    p.questions.forEach((qq, qidx) => {
      total++;
      const sel = document.querySelector(`input[name=r_${pidx}_${qidx}]:checked`);
      // 找對應的 visible question block to mark
      // We'll use order: for each passage we appended the question blocks sequentially
      const qBlockIndex = pidx; // top-level question index
      // Determine the specific label block by searching for the q-title matching text
      const titles = Array.from(document.getElementsByClassName('q-title'));
      const titleText = `${pidx*3 + qidx + 1}. ${qq.q}`;
      const titleEl = titles.find(t => t.textContent === titleText);
      const parent = titleEl ? titleEl.closest('.question') : null;
      if (parent){
        // remove previous marks
        parent.classList.remove('correct','wrong');
      }
      if (sel && sel.value === qq.ans){
        correct++;
        if (parent) parent.classList.add('correct');
      } else {
        if (parent) parent.classList.add('wrong');
        // display small feedback under parent
        if (parent){
          let fb = parent.querySelector('.feedback');
          if (!fb){ fb = document.createElement('div'); fb.className='feedback'; parent.appendChild(fb); }
          fb.textContent = `本題正確答案：${qq.ans}. ${qq.opts[qq.ans]}`;
        }
      }
    });
  });

  const existing = document.getElementById('reading-result'); if (existing) existing.remove();
  const res = document.createElement('div'); res.id = 'reading-result'; res.className='result';
  res.innerHTML = `<strong>得分：</strong> ${correct} / ${total}`;
  document.querySelector('.container').appendChild(res);

  // 檢查分數是否達到獎勵門檻 (60%)
  if (correct / total >= 0.6) {
    showRewardAnimation();
  }
  saveScoreHistory('第三章：閱讀理解', correct, total);
  // 儲存分數紀錄
  saveScoreHistory('第三章：閱讀理解', correct, total);
}

/**
 * 網站導覽員助手系統
 * 位於右下角，提供章節導航、隨機提示、主題切換等功能
 */

const navigatorHelpers = {
  tips: [
    '💡 提示：每章都有不同的題目類型。',
    '💡 提示：答案會自動儲存到瀏覽器中。',
    '💡 提示：你可以隨時返回首頁重新選擇章節。',
    '💡 提示：仔細閱讀每道題目，別著急！',
    '💡 提示：分數會在你完成所有題目後顯示。',
    '💡 提示：你可以嘗試多次，沒有時間限制。',
    '💡 提示：主題切換可以改變整個網站的風格。'
  ],
  greetings: [
    '👋 嗨！我是你的學習助手。有什麼我可以幫助的嗎？', //
    '😊 歡迎回來！準備好挑戰新的題目了嗎？', //
    '📚 讓我們一起學習英文吧！', //
    '🎯 你可以快速導航到任何章節。', //
    '⭐ 加油！你正在進步中。' //
  ],
  chapters: [
    { name: '首頁', url: 'index.html', emoji: '🏠' }, //
    { name: '第一章：選擇題', url: 'quiz.html', emoji: '❓' },
    { name: '第二章：拼字練習', url: 'vocabulary.html', emoji: '✏️' },
    { name: '第二章：拼字練習', url: 'vocabulary.html', emoji: '✏️' },
    { name: '第三章：閱讀理解', url: 'reading.html', emoji: '📖' }
  ]
};

// 導覽員主選單按鈕定義
const navigatorMainMenuButtons = [
  { text: '📍 章節導航', action: 'showChapters' },
  { text: '💡 隨機提示', action: 'showTip' },
  { text: '💣 清除紀錄', action: 'clearData' },
  { text: '🌙 切換主題', action: 'toggleTheme' },
  { text: '📊 查看進度', action: 'showProgress' }
];

function injectFloatingNavigator(){
  if (document.getElementById('navigatorBtn')) return;

  // 取得隨機問候語
  const randomGreeting = navigatorHelpers.greetings[Math.floor(Math.random() * navigatorHelpers.greetings.length)];

  // 主容器
  const container = document.createElement('div');
  container.id = 'navigator-container';
  container.className = 'navigator-container';

  // 浮動按鈕
  const btn = document.createElement('button');
  btn.id = 'navigatorBtn';
  btn.className = 'navigator-btn';
  btn.title = '網站導覽員';
  btn.innerHTML = '🤖';
  
  // 聊天框
  const chatBox = document.createElement('div');
  chatBox.id = 'navigator-chat';
  chatBox.className = 'navigator-chat';

  // 聊天頭部
  const chatHead = document.createElement('div');
  chatHead.className = 'navigator-chat-head';
  chatHead.innerHTML = `
    <div class="navigator-chat-title">TOEIC 學習助手</div>
    <button class="navigator-close-btn" aria-label="關閉">×</button>
  `;

  // 聊天內容
  const chatContent = document.createElement('div');
  chatContent.className = 'navigator-chat-content';
  chatContent.id = 'navigator-chat-content';

  // 初始問候
  const greetingMsg = document.createElement('div');
  greetingMsg.className = 'navigator-message assistant-message';
  greetingMsg.innerHTML = `<span>${randomGreeting}</span>`;
  chatContent.appendChild(greetingMsg);

  // 聊天菜單
  const menu = document.createElement('div');
  menu.className = 'navigator-menu';
  menu.id = 'navigator-menu';
  buildMainMenu(menu); // 使用新函式建立主選單

  chatContent.appendChild(menu);

  // 組合聊天框
  chatBox.appendChild(chatHead);
  chatBox.appendChild(chatContent);
  container.appendChild(btn);
  container.appendChild(chatBox);

  document.body.appendChild(container);

  // 事件監聽
  btn.addEventListener('click', () => {
    chatBox.classList.toggle('open');
  });

  document.querySelector('.navigator-close-btn').addEventListener('click', () => {
    chatBox.classList.remove('open');
  });

  // 點擊外部關閉
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      chatBox.classList.remove('open');
    }
  });
}

/**
 * 建立導覽員的主選單
 * @param {HTMLElement} menuContainer - 用於放置選單按鈕的容器
 */
function buildMainMenu(menuContainer) {
  menuContainer.innerHTML = ''; // 清空當前選單
  navigatorMainMenuButtons.forEach(btnInfo => {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'navigator-menu-btn';
    menuBtn.textContent = btnInfo.text;
    menuBtn.addEventListener('click', () => handleNavigatorAction(btnInfo.action));
    menuContainer.appendChild(menuBtn);
  });
}

function handleNavigatorAction(action){
  const content = document.getElementById('navigator-chat-content');
  
  switch(action){
    case 'showChapters':
      showChapterMenu(content);
      break;
    case 'showTip':
      showRandomTip(content);
      break;
    case 'clearData':
      clearAllData(content);
      break;
    case 'toggleTheme':
      toggleWebsiteTheme();
      break;
    case 'showProgress':
      showProgressInfo(content);
      break;
  }
}

function showChapterMenu(content){
  const menu = content.querySelector('.navigator-menu');
  menu.innerHTML = ''; // 清空主選單

  const title = document.createElement('div');
  title.className = 'navigator-message assistant-message';
  title.innerHTML = '<span>📚 選擇你要前往的章節：</span>';
  menu.appendChild(title); // 將標題加入選單容器中

  navigatorHelpers.chapters.forEach(chapter => {
    const btn = document.createElement('button');
    btn.className = 'navigator-menu-btn chapter-btn';
    btn.innerHTML = `${chapter.emoji} ${chapter.name}`;
    btn.addEventListener('click', () => {
      window.location.href = chapter.url;
    });
    menu.appendChild(btn);
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'navigator-menu-btn';
  backBtn.textContent = '← 返回主選單';
  backBtn.style.marginTop = '8px';
  backBtn.addEventListener('click', () => {
    buildMainMenu(menu); // 重新建立主選單，而不是刷新頁面
  });
  menu.appendChild(backBtn);

  content.scrollTop = content.scrollHeight;
}

function clearAllData(content){
  localStorage.removeItem('scoreHistory');
  sessionStorage.removeItem('visitedPages');

  updateUserDataDropdown();
}

function showRandomTip(content){
  const tip = navigatorHelpers.tips[Math.floor(Math.random() * navigatorHelpers.tips.length)];
  
  const tipMsg = document.createElement('div');
  tipMsg.className = 'navigator-message assistant-message';
  tipMsg.innerHTML = `<span>${tip}</span>`;
  
  // 將提示訊息顯示在聊天內容的頂部，並移除舊的提示
  const oldTip = content.querySelector('.assistant-tip-message');
  if (oldTip) oldTip.remove();
  tipMsg.classList.add('assistant-tip-message');
  content.prepend(tipMsg);
  
  content.scrollTop = content.scrollHeight;
}

/**
 * 注入動態背景效果（粒子動畫）
 * 在 body 中創建一個 canvas 或 div 來繪製粒子
 */
function injectDynamicBackground() {
  if (document.getElementById('particle-container')) return;

  const container = document.createElement('div');
  container.id = 'particle-container';
  document.body.prepend(container); // 使用 prepend 確保在 body 的最前面

  const particleCount = 50; // 粒子數量

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    
    // 隨機大小
    const sizeClass = 'p' + (Math.floor(Math.random() * 3) + 1);
    particle.classList.add('particle', sizeClass);
    
    // 隨機起始位置 (left)
    particle.style.left = `${Math.random() * 100}%`;
    
    // 隨機動畫時間 (10s - 30s)
    const duration = Math.random() * 20 + 10;
    particle.style.animationDuration = `${duration}s`;
    
    // 隨機動畫延遲 (0s - 20s)
    const delay = Math.random() * 20;
    particle.style.animationDelay = `${delay}s`;

    // 隨機水平移動距離
    particle.style.setProperty('--x-end', `${(Math.random() - 0.5) * 200}px`);

    container.appendChild(particle);
  }
}

/* ========== 機器人獎勵動畫系統 ========== */

/**
 * 顯示機器人鼓掌獎勵動畫。
 * 動畫會持續 3 秒，然後自動淡出。
 */
function showRewardAnimation() {
  // 如果動畫已存在，則不重複觸發
  if (document.getElementById('robotAnimation')) return;

  // 1. 創建動畫的 HTML 結構
  const animationContainer = document.createElement('div');
  animationContainer.id = 'robotAnimation';
  animationContainer.className = 'reward-animation-overlay';
  animationContainer.innerHTML = `
    <div class="reward-content">
      <div class="reward-robot">🤖</div>
      <div class="reward-text">
        <strong>Great job!</strong> The robot is proud of you!
      </div>
    </div>
  `;

  // 2. 將動畫元素添加到 body
  document.body.appendChild(animationContainer);

  // 3. 觸發顯示動畫 (使用 setTimeout 確保 CSS transition 生效)
  setTimeout(() => {
    animationContainer.classList.add('show');
  }, 10); // 短暫延遲

  // 4. 設置 3 秒後自動移除
  setTimeout(() => {
    animationContainer.classList.remove('show');
    // 在淡出動畫結束後從 DOM 中移除元素
    setTimeout(() => {
      animationContainer.remove();
    }, 300); // 需與 CSS transition 時間一致
  }, 3000);
}

/* ========== 「我的資料」下拉選單系統 ========== */

/**
 * 注入「我的資料」下拉選單到頁面中
 */
function injectUserDataDropdown() {
  if (document.getElementById('userDataDropdown')) return;

  const dropdownContainer = document.createElement('div');
  dropdownContainer.id = 'userDataDropdown';
  dropdownContainer.className = 'user-data-dropdown';

  dropdownContainer.innerHTML = `
    <button id="userDataBtn" class="user-data-btn">我的資料 ▼</button>
    <div id="userDataContent" class="user-data-content">
      <div class="data-section">
        <h4>歷史分數</h4>
        <ul id="scoreHistoryList"><li>尚無紀錄</li></ul>
      </div>
      <div class="data-section">
        <h4>完成章節</h4>
        <ul id="completedChaptersList"><li>尚無紀錄</li></ul>
      </div>
      <div class="data-section">
        <h4>平均分數</h4>
        <p id="averageScore">尚無紀錄</p>
      </div>
    </div>
  `;

  document.body.appendChild(dropdownContainer);

  // 事件監聽
  const btn = document.getElementById('userDataBtn');
  const content = document.getElementById('userDataContent');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    content.classList.toggle('show');
    if (content.classList.contains('show')) {
      updateUserDataDropdown(); // 展開時更新資料
    }
  });

  // 點擊外部關閉
  document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target)) {
      content.classList.remove('show');
    }
  });

  // 初始載入一次資料
  updateUserDataDropdown();
}

// 檔案名到完整章節名稱的映射
const chapterDisplayNameMap = {
  'index.html': '首頁',
  'quiz.html': '第一章：選擇題',
  'vocabulary.html': '第二章：拼字練習',
  'reading.html': '第三章：閱讀理解',
};
/**
 * 更新「我的資料」下拉選單的內容
 */
function updateUserDataDropdown() {
  const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];

  const scoreList = document.getElementById('scoreHistoryList');
  const chapterList = document.getElementById('completedChaptersList');
  const avgScoreElem = document.getElementById('averageScore');

  const studentName = localStorage.getItem('studentName') || '我的資料';
  document.getElementById('userDataBtn').textContent = `${studentName} ▼`;

  // 1. 更新歷史分數
  if (scoreHistory.length > 0) {
    scoreList.innerHTML = scoreHistory.map(item => `<li>${item.chapter}: ${item.score}/${item.total}</li>`).join('');
  } else {
    scoreList.innerHTML = '<li>尚無紀錄</li>';
  }

  // 2. 更新完成章節 (從分數歷史記錄中提取，確保是真正「完成」的)
  const completedChapters = [...new Set(scoreHistory.map(item => item.chapter))];

  if (completedChapters.length > 0) {
    chapterList.innerHTML = completedChapters.map(chapter => `<li>✅ ${chapter}</li>`).join('');
  } else {
    chapterList.innerHTML = '<li>尚無紀錄</li>';
  }
  // 3. 計算並更新平均分數
  if (scoreHistory.length > 0) {
    const totalPercentage = scoreHistory.reduce((acc, item) => acc + (item.score / item.total), 0);
    const averagePercentage = (totalPercentage / scoreHistory.length) * 100;
    avgScoreElem.textContent = `${averagePercentage.toFixed(1)}%`;
  } else {
    avgScoreElem.textContent = '尚無紀錄';
  }
}

/**
 * 儲存單次測驗分數到 localStorage
 * @param {string} chapter - 章節名稱
 * @param {number} score - 獲得分數
 * @param {number} total - 總分
 */
function saveScoreHistory(chapter, score, total) {
  const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
  scoreHistory.unshift({ chapter, score, total, date: new Date().toISOString() }); // unshift 將最新紀錄放在最前面
  localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory.slice(0, 10))); // 最多儲存最近 10 筆
  updateUserDataDropdown(); // 即時更新
}

function toggleWebsiteTheme(){
  const root = document.documentElement;
  const isDark = root.style.getPropertyValue('--bg') === '#0f1720';
  
  if(isDark){
    // 切換到亮色模式
    root.style.setProperty('--bg', '#f5f5f5');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--text', '#1a1a1a');
    root.style.setProperty('--muted', '#666666');
    document.body.style.background = 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)';
    localStorage.setItem('theme', 'light');
  } else {
    // 切換回暗色模式
    root.style.setProperty('--bg', '#0f1720');
    root.style.setProperty('--card', '#1f2933');
    root.style.setProperty('--text', '#ecf0f1');
    root.style.setProperty('--muted', '#9aa5ad');
    document.body.style.background = 'linear-gradient(180deg, #071019 0%, #0f1720 100%)';
    localStorage.setItem('theme', 'dark');
  }

  const menu = document.querySelector('.navigator-menu');
  const themeMsg = document.createElement('div');
  themeMsg.className = 'navigator-message assistant-message';
  themeMsg.innerHTML = '<span>🌙 主題已切換！</span>';
  document.getElementById('navigator-chat-content').insertBefore(themeMsg, menu);
  
  const content = document.getElementById('navigator-chat-content');
  content.scrollTop = content.scrollHeight;
}

function showProgressInfo(content){
  const menu = content.querySelector('.navigator-menu');
  
  let progressMsg = '📊 <strong>你的學習進度：</strong><br>';
  progressMsg += '✅ 已訪問頁面: ' + (sessionStorage.getItem('visitedPages') || '無').split(',').filter(Boolean).length + ' 頁<br>';
  progressMsg += '📝 總練習次數: ' + (sessionStorage.getItem('practiceCount') || '0') + ' 次';
  
  const progress = document.createElement('div');
  progress.className = 'navigator-message assistant-message';
  progress.innerHTML = `<span>${progressMsg}</span>`;
  content.insertBefore(progress, menu);
  
  content.scrollTop = content.scrollHeight;
}
