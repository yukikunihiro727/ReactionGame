//https://yukikunihiro727.github.io/ReactionGame/

const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const result = document.getElementById("result");

let startTime;
let waiting = false;
let ready = false;
let timerId = null;

startBtn.addEventListener("click", startGame);

//クリック・タップ対応
gameArea.addEventListener("pointerdown", react);

//キーボード対応
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        react();
    }
});

function startGame() {
    result.textContent = "";
    gameArea.style.background = "white";
    gameArea.textContent = "待機中...押さないで！";

    waiting = true;
    ready = false;

    if (timerId !== null) {
        clearTimeout(timerId);
    }

    const delay = Math.random() * 3000 + 2000;

    timerId = setTimeout(() => {
        gameArea.style.background = "lime";
        gameArea.textContent = "今だ！クリック・タップ・キー入力！";

        startTime = performance.now();

        waiting = false;
        ready = true;
    }, delay);
}

function react() {
    if (waiting) {
        result.textContent = "フライング！";

        gameArea.style.background = "red";
        gameArea.textContent = "早すぎます";

        waiting = false;
        ready = false;

        if (timerId !== null) {
            clearTimeout(timerId);
        }

        return;
    }

    if (ready) {
		const reactionTime = Math.round(performance.now() - startTime);

		result.innerHTML =
		    `反応時間：${reactionTime} ms<br>${getRank(reactionTime)}`;

		const playerName = prompt("名前を入力してください");

		if (playerName) {
		    saveScore(playerName, reactionTime);
		}

        gameArea.style.background = "white";
        gameArea.textContent = "もう一度挑戦できます";

        ready = false;
    }
}

function getRank(time){

	if(time < 50)
		return "Not Human";
    if(time < 100)
        return "🏆 GOD";
    if(time < 150)
        return "🥇 Excellent";
    if(time < 200)
        return "🥈 Great";
    if(time < 250)
        return "🥉 VeryGood";
	if(time < 300)
		return "👍　Good";
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

const rankingBtn = document.getElementById("rankingBtn");
const rankingArea = document.getElementById("rankingArea");

rankingBtn.addEventListener("click", loadRanking);

async function loadRanking() {
    const response = await fetch(
        "https://q4793y84vc.execute-api.ap-northeast-1.amazonaws.com/ranking"
    );

    const ranking = await response.json();

    let html = "<h2>ランキング TOP10</h2>";
    html += "<ol>";

    ranking.forEach(item => {
        html += `<li>${item.name}：${item.reactionTime} ms</li>`;
    });

    html += "</ol>";

    rankingArea.innerHTML = html;
}