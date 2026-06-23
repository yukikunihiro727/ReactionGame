// https://yukikunihiro727.github.io/ReactionGame/

let scores = [];
let challengeCount = 0;

//定数
const gameArea = document.getElementById("gameArea");
const result = document.getElementById("result");
const rankingBtn = document.getElementById("rankingBtn");
const rankingArea = document.getElementById("rankingArea");
const refreshBtn = document.getElementById("refreshBtn");

let startTime;
let waiting = false;
let ready = false;
let timerId = null;

gameArea.addEventListener("pointerdown", handleGameAreaClick);

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleGameAreaClick();
    }
});

rankingBtn.addEventListener("click", loadRanking);
refreshBtn.addEventListener(
    "click",
    loadRanking
);

function handleGameAreaClick() {
    if (!waiting && !ready) {
        startGame();
        return;
    }

    react();
}

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

function react() {
    if (waiting) {
        result.textContent = "フライング！";

        gameArea.style.background = "#d50000";
        gameArea.style.borderColor = "#ff1744";
        gameArea.textContent = "早すぎます。\nClickまたはSpaceで再挑戦";

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

            const playerName = prompt(
				"名前を入力してください（ランキングに保存しない場合は'キャンセル'を押してください");
			

            if (playerName) {
                saveScore(playerName, average);
            }

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

function getRank(time) {
    if (time < 50) return "Not Human";
    if (time < 100) return "🏆 GOD";
    if (time < 150) return "🥇 Excellent";
    if (time < 200) return "🥈 Great";
    if (time < 250) return "🥉 VeryGood";
    if (time < 300) return "👍 Good";
    return "😊 Normal";
}

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

        const data = await response.json();
        console.log(data);

    } catch (error) {
        console.error("保存エラー:", error);
    }
}

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