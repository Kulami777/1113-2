let quizTable; // 用來儲存從 CSV 載入的 p5.Table 物件
let questions = []; // 儲存整理後的題目物件陣列
let currentQuestionIndex = 0;
let score = 0;
let quizState = 'QUIZ'; // 狀態: 'QUIZ' (測驗中), 'RESULT' (結果)
let totalPoints = 0;

// DOM 元素參考 (右上角下拉選單)
let infoDropdown = null;
let optScoreElem = null;
let optAnswerElem = null;
let optTimeElem = null;

// 記錄測驗開始時間 (ms)
let quizStartTime = 0;

// === 星星背景變數 ===
let stars = [];
let numStars = 100;

// === 特效變數 ===
let cursorTrail = []; 
let maxTrailLength = 30;
let selectedOption = null; 
let selectionEffectTime = 0; 
let selectionEffectColor; 

// === 結果動畫變數 ===
let resultAnimationTimer = 0;
let resultAnimationDuration = 180; 
let resultParticles = [];

// 全域儲存當前題目的選項顯示順序
// 全域儲存當前題目的選項顯示順序（支援 A-D）
let currentOptionOrder = ['A', 'B', 'C', 'D'];

/**
 * preload() - 載入外部資料
 */
function preload() {
    quizTable = loadTable('assets/quiz.csv', 'csv', 'header');
}

/**
 * setup() - 初始化設定
 */
function setup() {
    // === 【響應式修改 1】設定畫布為視窗大小 ===
    createCanvas(windowWidth, windowHeight); 
    // ===========================================
    
    rectMode(CENTER);
    
    // 準備題目資料
    if (quizTable && quizTable.getRowCount() > 0) {
        let rows = quizTable.getRows();
        for (let r = 0; r < rows.length; r++) {
            questions.push({
                question: rows[r].getString('question'),
                options: {
                    A: rows[r].getString('optionA'),
                    B: rows[r].getString('optionB'),
                    C: rows[r].getString('optionC'),
                    D: rows[r].getString('optionD')
                },
                correct: rows[r].getString('correct'),
                points: rows[r].getNum('points')
            });
            totalPoints += rows[r].getNum('points');
        }
    } else {
        console.error("無法載入 CSV 檔案或檔案內容為空。請檢查 assets/quiz.csv");
    }
    
    textAlign(CENTER, CENTER);
    
    // 隨機打亂題目順序
    questions = shuffle(questions, true); 
    
    // 初始化星星背景
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
    
    // 初始化第一個選項順序（包含 D）
    currentOptionOrder = shuffle(['A', 'B', 'C', 'D'], true);

    // 取得右上角下拉元素參考（如果存在）
    if (typeof document !== 'undefined') {
        infoDropdown = document.getElementById('infoDropdown');
        optScoreElem = document.getElementById('optScore');
        optAnswerElem = document.getElementById('optAnswer');
        optTimeElem = document.getElementById('optTime');
    }

    // 更新下拉顯示（初始）
    // 設定開始時間
    quizStartTime = millis();
    updateDropdown();
}

/**
 * 【響應式新增】處理視窗大小改變
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重新初始化星星位置，確保它們分散在新的畫布上
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

/**
 * draw() - 繪製畫面 (每幀執行)
 */
function draw() {
    background(34, 40, 49); 

    // 繪製星星背景
    for (let star of stars) {
        star.update();
        star.display();
    }

    drawCursorTrail();

    if (quizState === 'QUIZ') {
        displayQuiz();
    } else if (quizState === 'RESULT') {
        displayResult();
    }
    
    if (selectionEffectTime > 0) {
        selectionEffectTime--;
    }
}

/**
 * 繪製游標拖曳特效
 */
function drawCursorTrail() {
    cursorTrail.push(createVector(mouseX, mouseY));
    if (cursorTrail.length > maxTrailLength) {
        cursorTrail.splice(0, 1); 
    }

    noFill();
    for (let i = 0; i < cursorTrail.length; i++) {
        let p = cursorTrail[i];
        let size = map(i, 0, cursorTrail.length, 2, 10); 
        let alpha = map(i, 0, cursorTrail.length, 0, 150); 
        
        stroke(0, 173, 181, alpha); 
        strokeWeight(size / 3);
        point(p.x, p.y);
    }
}

/**
 * 繪製測驗畫面
 */
function displayQuiz() {
    if (currentQuestionIndex >= questions.length) {
        quizState = 'RESULT';
        return;
    }

    let q = questions[currentQuestionIndex];
    let x = width / 2;
    
    // === 【響應式修改 2】文字大小根據寬度縮放 ===
    let baseTextSize = map(width, 400, 1200, 18, 36, true);
    let optionTextSize = map(width, 400, 1200, 16, 24, true);
    // ============================================

    // 繪製題目
    fill(238, 238, 238); 
    textSize(baseTextSize);
    text(`第 ${currentQuestionIndex + 1} 題: ${q.question}`, x, height * 0.15); // 15% 高度

    // 繪製選項
    textSize(optionTextSize);
    
    // === 【亂數選項修改 1】使用當前的亂數順序陣列 ===
    let optionKeys = currentOptionOrder;
    // ================================================
    
    let rectW = width * 0.5; // 按鈕寬度佔畫布寬度 50%
    let rectH = height * 0.1; // 按鈕高度佔畫布高度 10%
    let startY = height * 0.3; // 從畫布 30% 高度開始排列選項
    let spacingY = height * 0.15; // 選項間隔 (15% 高度)

    for (let i = 0; i < optionKeys.length; i++) {
        let key = optionKeys[i];
        let originalKey = key; // 這是實際的 A, B, C
        
        let optionText = `${originalKey}. ${q.options[originalKey]}`;
        
        // === 【響應式修改 3】按鈕座標使用比例計算 ===
        let rectY = startY + i * spacingY;
        let rectX = width / 2;
        // ===========================================
        
        // 判斷滑鼠是否懸停在選項區塊上
        let isHovering = mouseX > rectX - rectW / 2 && mouseX < rectX + rectW / 2 &&
                         mouseY > rectY - rectH / 2 && mouseY < rectY + rectH / 2;

        // 選項區塊顏色邏輯
        if (selectedOption === originalKey && selectionEffectTime > 0) {
            let effectAlpha = map(selectionEffectTime, 0, 60, 255, 0);
            fill(selectionEffectColor, effectAlpha); 
        } else if (isHovering) {
            fill(0, 173, 181, 150); 
        } else {
            fill(57, 62, 70); 
        }
        
        // 繪製選項區塊
        noStroke();
        rect(rectX, rectY, rectW, rectH, 10);
        
        // 繪製選項文字
        fill(238, 238, 238);
        text(optionText, rectX, rectY);
    }
    
    // 每次畫面顯示題目時也同步更新下拉選單（保險）
    updateDropdown();
}

/**
 * 處理滑鼠點擊
 */
/**
 * 更新右上角下拉選單內容
 */
function updateDropdown() {
    if (typeof document === 'undefined') return;
    if (!optScoreElem || !optAnswerElem) return;

    // 更新分數文字
    optScoreElem.textContent = `目前分數: ${score} / ${totalPoints}`;

    // 更新正確答案顯示（顯示當前題目的正確選項，若測驗結束則顯示 '-'）
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
        let q = questions[currentQuestionIndex];
        if (q && q.correct) {
            optAnswerElem.textContent = `正確答案: ${q.correct}`;
        } else {
            optAnswerElem.textContent = `正確答案: -`;
        }
    } else {
        optAnswerElem.textContent = `正確答案: -`;
    }

    // 更新已用時間（若有 optTimeElem）
    if (optTimeElem) {
        let elapsed = millis() - quizStartTime;
        if (elapsed < 0) elapsed = 0;
        optTimeElem.textContent = `已用時間: ${formatTime(elapsed)}`;
    }
}

// format milliseconds to mm:ss 或 s 秒
function formatTime(ms){
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function mousePressed() {
    if (quizState === 'QUIZ' && currentQuestionIndex < questions.length) {
        let q = questions[currentQuestionIndex];
        
        // 使用當前的亂數順序來判斷點擊
        let optionKeys = currentOptionOrder; 

        let rectW = width * 0.5; 
        let rectH = height * 0.1; 
        let startY = height * 0.3; 
        let spacingY = height * 0.15; 
        
        for (let i = 0; i < optionKeys.length; i++) {
            let originalKey = optionKeys[i];
            
            let rectY = startY + i * spacingY;
            let rectX = width / 2;

            // === 【響應式修改 4】點擊判斷使用比例計算 ===
            let isClicked = mouseX > rectX - rectW / 2 && mouseX < rectX + rectW / 2 &&
                            mouseY > rectY - rectH / 2 && mouseY < rectY + rectH / 2;
            // ===========================================

            if (isClicked) {
                selectedOption = originalKey;
                selectionEffectTime = 60; 

                // 檢查答案並設定特效顏色 (答對綠色 / 答錯紅色)
                if (originalKey === q.correct) { // 答案判斷始終使用原始的 A, B, C
                    score += q.points;
                    selectionEffectColor = color(0, 200, 0); 
                } else {
                    selectionEffectColor = color(255, 50, 50); 
                }
                // 立即更新下拉（分數或答案狀態變化）
                updateDropdown();

                // 進入下一題 (延遲一下讓特效顯示)
                setTimeout(() => {
                    currentQuestionIndex++;
                    selectedOption = null; 
                    
                    // === 【亂數選項修改 2】換題時，重新打亂選項順序（包含 D） ===
                    currentOptionOrder = shuffle(['A', 'B', 'C', 'D'], true);
                    // ================================================
                    // 換題後更新下拉以顯示新題目的正確答案
                    updateDropdown();
                }, 500); 
                
                return;
            }
        }
    } else if (quizState === 'RESULT') {
        // 點擊畫布重新開始測驗
        currentQuestionIndex = 0;
        score = 0;
        resultAnimationTimer = 0;
        resultParticles = [];
        
        questions = shuffle(questions, true); 
        currentOptionOrder = shuffle(['A', 'B', 'C', 'D'], true); // 重新開始也打亂選項（包含 D）
        // 重置開始時間
        quizStartTime = millis();
        quizState = 'QUIZ';
    }
}


/**
 * 繪製結果畫面
 */
function displayResult() {
    let finalScore = (score / totalPoints) * 100;
    
    drawResultAnimation(finalScore);
    
    let baseTextSize = map(width, 400, 1200, 24, 48, true);

    let message = '';
    let color_result;

    if (finalScore >= 60) {
        message = `恭喜你！總分: ${score} / ${totalPoints} (${finalScore.toFixed(0)}%) \n表現非常出色！`;
        color_result = color(0, 173, 181); 
    } else {
        message = `再接再厲！總分: ${score} / ${totalPoints} (${finalScore.toFixed(0)}%) \n沒關係，下次會更好！`;
        color_result = color(255, 90, 90); 
    }

    fill(color_result);
    textSize(baseTextSize);
    text(message, width / 2, height / 2);
    
    // 增加一個重新開始的提示 
    textSize(baseTextSize * 0.5);
    fill(238, 238, 238, 180);
    text('點擊畫布重新開始測驗', width / 2, height - height * 0.1);
}

/**
 * 處理結果動畫的粒子系統
 */
function drawResultAnimation(finalScore) {
    if (resultAnimationTimer < resultAnimationDuration) {
        resultAnimationTimer++;
        
        let particleCount = finalScore >= 60 ? 5 : 2; 
        for (let i = 0; i < particleCount; i++) {
            resultParticles.push(new Particle(width / 2, height / 2, finalScore));
        }
    }
    
    for (let i = resultParticles.length - 1; i >= 0; i--) {
        resultParticles[i].update();
        resultParticles[i].display();
        if (resultParticles[i].isFinished()) {
            resultParticles.splice(i, 1);
        }
    }
}

/**
 * 粒子類別 (用於結果畫面動畫)
 */
class Particle {
    constructor(x, y, score) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        let speed = map(score, 0, 100, 1, 4);
        this.vel.mult(random(speed, speed + 2));
        this.lifespan = 255;
        this.r = random(4, 12);
        
        if (score >= 60) {
            this.color = color(0, 173, 181); 
        } else {
            this.color = color(255, 90, 90); 
        }
    }

    update() {
        this.pos.add(this.vel);
        this.lifespan -= 5;
    }

    display() {
        noStroke();
        fill(this.color, this.lifespan);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

/**
 * 星星類別 (用於背景裝飾)
 */
class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(1, 3);
        this.brightness = 0;
        this.speed = random(0.01, 0.05);
        this.phase = random(TWO_PI); 
    }

    update() {
        this.brightness = map(sin(frameCount * this.speed + this.phase), -1, 1, 100, 255);
    }

    display() {
        noStroke();
        fill(255, this.brightness); 
        ellipse(this.x, this.y, this.size, this.size);
    }
}


/**
 * mouseMoved() - 處理滑鼠移動時的游標樣式
 */
function mouseMoved() {
    cursor(ARROW); // 預設箭頭

    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height && quizState === 'QUIZ') {
        let optionKeys = currentOptionOrder; // 使用亂數順序
        let isOverOption = false;

        let rectW = width * 0.5; 
        let rectH = height * 0.1; 
        let startY = height * 0.3; 
        let spacingY = height * 0.15; 
        
        for (let i = 0; i < optionKeys.length; i++) {
            let rectY = startY + i * spacingY;
            let rectX = width / 2;
            
            if (mouseX > rectX - rectW / 2 && mouseX < rectX + rectW / 2 &&
                mouseY > rectY - rectH / 2 && mouseY < rectY + rectH / 2) {
                isOverOption = true;
                break;
            }
        }
        if (isOverOption) {
            cursor(HAND); 
        }
    }
}