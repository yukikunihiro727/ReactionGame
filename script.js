// https://yukikunihiro727.github.io/ReactionGame/

let scores = [];	//反応時間保存
let challengeCount = 0;		//回数保存

//定数(調整できるようhtmlから取得)
const gameArea = document.getElementById("gameArea");
const result = document.getElementById("result");
const rankingBtn = document.getElementById("rankingBtn");
const rankingArea = document.getElementById("rankingArea");
//const refreshBtn = document.getElementById("refreshBtn");
const nameModal = document.getElementById("nameModal");

const playerNameInput = document.getElementById("playerNameInput");

const saveBtn = document.getElementById("saveBtn");

const cancelBtn = document.getElementById("cancelBtn");

let averageScore = 0;
let startTime;
let waiting = false;
let ready = false;
let timerId = null;

gameArea.addEventListener("pointerdown", handleGameAreaClick);

document.addEventListener("keydown", (e) => {
    //名前入力画面が開いている間はゲーム操作しない
    if (nameModal.style.display === "flex") {
        return;
    }
		
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleGameAreaClick();
    }
});

rankingBtn.addEventListener("click", loadRanking);

function handleGameAreaClick() {
	
    // 名前入力画面が開いている間はゲーム操作しない
    if (nameModal.style.display === "flex") {
        return;
    }
		
    if (!waiting && !ready) {
        startGame();
        return;
    }

    react();
}


//ゲーム開始
function startGame() {
    result.textContent = "";

	gameArea.style.background = "#ff9800"; // 待機中：オレンジ
	gameArea.style.borderColor = "#f57c00";
	gameArea.style.color = "white";
	gameArea.textContent = "緑に変わるまで待ってください...";

    waiting = true;
    ready = false;

    if (timerId !== null) {
        clearTimeout(timerId);
    }

    const delay = Math.random() * 3000 + 2000;

    timerId = setTimeout(() => {
        gameArea.style.background = "#00c853";
        gameArea.style.borderColor = "#00e676";
        gameArea.textContent = "プッシュ！";

        startTime = performance.now();

        waiting = false;
        ready = true;
    }, delay);
}

//処理
function react() {
    if (waiting) {
        result.textContent = "フライング！";

        gameArea.style.background = "#d50000";
        gameArea.style.borderColor = "#ff1744";
        gameArea.textContent = "早すぎます。ClickまたはSpaceで再挑戦";

        waiting = false;
        ready = false;

        if (timerId !== null) {
            clearTimeout(timerId);
        }

        return;
    }

    if (ready) {
        const reactionTime = Math.round(performance.now() - startTime);

        scores.push(reactionTime);
        challengeCount++;

        if (challengeCount < 3) {
            result.innerHTML =
                `反応時間：${reactionTime} ms<br>
                ${challengeCount}/3 回終了<br>
                あと ${3 - challengeCount} 回`;

            gameArea.style.background = "#e53935";
            gameArea.style.borderColor = "#9c2756";
            gameArea.textContent = "ClickまたはSpaceで次の測定";
        } else {
            const average = Math.round(
                scores.reduce((a, b) => a + b, 0) / 3
            );

            result.innerHTML =
                `3回平均：${average} ms<br>
                ${getRank(average)}`;

				averageScore = average;

				playerNameInput.value = "";

				nameModal.style.display = "flex";

			scores = [];
			challengeCount = 0;

			gameArea.style.background = "white";
			gameArea.style.borderColor = "#cccccc";
			gameArea.style.color = "black";

			gameArea.textContent = "ClickまたはSpaceで再挑戦";
        }

        ready = false;
    }
}

//ランク取得
function getRank(time) {
    if (time < 50) return "Not Human";
    if (time < 100) return "🏆 GOD";
    if (time < 150) return "🥇 Excellent";
    if (time < 200) return "🥈 Great";
    if (time < 250) return "🥉 VeryGood";
    if (time < 300) return "👍 Good";
    return "😊 Normal";
}

//スコア保存(非同期処理)
async function saveScore(name, reactionTime) {
    try {
        const response = await fetch(
            "https://q4793y84vc.execute-api.ap-northeast-1.amazonaws.com/score",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    reactionTime: reactionTime
                })
            }
        );
		
		//処理が終わるまで待つ
        const data = await response.json();
        console.log(data);

    } catch (error) {
        console.error("保存エラー:", error);
    }
}

//ランキング読み込み
async function loadRanking() {
	rankingArea.innerHTML =
	        "<h2>ランキング取得中...</h2>";
			
    const response = await fetch(
        "https://q4793y84vc.execute-api.ap-northeast-1.amazonaws.com/ranking"
    );

    const ranking = await response.json();

    let html = `
        <h2>🏆 ランキング TOP10</h2>

        <table class="ranking-table">
            <tr>
                <th>順位</th>
                <th>名前</th>
                <th>平均反応時間</th>
            </tr>
    `;

    ranking.forEach((item, index) => {
        let medal = "";

        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";

        html += `
            <tr>
                <td>${medal} ${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.reactionTime} ms</td>
            </tr>
        `;
    });

    html += "</table>";

    rankingArea.innerHTML = html;
}

saveBtn.addEventListener("click", () => {

    const playerName =
        playerNameInput.value.trim();

    if(playerName !== ""){

        saveScore(
            playerName,
            averageScore
        );
    }

    nameModal.style.display = "none";
});

cancelBtn.addEventListener("click", () => {

    nameModal.style.display = "none";
});