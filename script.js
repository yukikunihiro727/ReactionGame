const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const result = document.getElementById("result");

let startTime;
let waiting = false;
let ready = false;

startBtn.addEventListener("click", startGame);

function startGame() {

    result.textContent = "";

    gameArea.style.background = "white";
    gameArea.textContent = "待機中...押さないで！";

    waiting = true;
    ready = false;

    const delay = Math.random() * 3000 + 2000;

    setTimeout(() => {

        gameArea.style.background = "lime";
        gameArea.textContent = "クリック！";

        startTime = Date.now();

        waiting = false;
        ready = true;

    }, delay);
}

gameArea.addEventListener("click", () => {

    if(waiting){
        result.textContent = "フライング！";
        waiting = false;
        return;
    }

    if(ready){

        const reactionTime = Date.now() - startTime;

        result.innerHTML =
            `反応時間：${reactionTime} ms<br>${getRank(reactionTime)}`;

        gameArea.style.background = "white";
        gameArea.textContent = "もう一度挑戦できます";

        ready = false;
    }
});

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