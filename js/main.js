const platform = document.querySelector(".platform");
const ball = document.querySelector(".ball");
const playingField = document.querySelector(".main");
const start = document.querySelector(".start");
const containerBlocks = document.querySelector(".container-blocks");
const score = document.querySelector(".score");
const hearts = document.querySelectorAll(".heart");

let countScore = 0;
let countHeartLost = null;
let blocks = null;

const ROWS_BLOCK = 10;
const COLUMNS_BLOCK = 10;
let SPEED_BALL = 3;

/**----------RUN--------------------------------------------------------------------**/
start.addEventListener("click", () => {
  start.style.display = "none";
  run();
  return false;
});

function run() {
  //reset visual
  if (countHeartLost === 3) {
    countScore = 0;
    score.innerHTML = "Score: 0";
    for (let hert of hearts) {
      hert.style.display = "block";
    }
    start.innerHTML = "Click For Start!";
    start.style.color = "black";
  }
  //init
  if (countHeartLost === null || countHeartLost === 3) {
    deleteBlocks();
    createBlocks();
    countHeartLost = 0;
    blocks = document.querySelectorAll(".block");
  }
  actionBall();
  document.addEventListener("mousemove", movePlatform);
}

/**-----------BLOCKS----------------------------------------------------------------**/
function createBlocks() {
  containerBlocks.style.gridTemplateColumns = `repeat(${COLUMNS_BLOCK}, auto)`;
  containerBlocks.style.gridTemplateRows = `repeat(${ROWS_BLOCK}, 1.5vw)`;
  let countBlocks = COLUMNS_BLOCK * ROWS_BLOCK;
  for (let i = 0; i < countBlocks; i++) {
    let block = document.createElement("div");
    block.classList.add("block");
    containerBlocks.appendChild(block);
  }
}

function deleteBlocks() {
  if (blocks === null) return;
  for (let block of blocks) {
    block.parentNode.removeChild(block);
  }
}

/**----------MOVE-PLATFORM----------------------------------------------------------**/

const rectPlayingField = playingField.getBoundingClientRect();

function movePlatform(event) {
  let halfWidthPlatform = platform.offsetWidth / 2.0;
  if (
    event.clientX - halfWidthPlatform > rectPlayingField.left &&
    event.clientX + halfWidthPlatform < rectPlayingField.right
  ) {
    platform.style.left = event.clientX - platform.offsetWidth / 2.0 + "px";
  }
}

/**----------ACTION-BALL------------------------------------------------------------**/
let rectBall = ball.getBoundingClientRect();
let initBallX = rectBall.left;
let initBallY = rectBall.top;
let y = initBallY;
let x = initBallX;
let shiftX = Math.random() > 0.5 ? SPEED_BALL : -SPEED_BALL;
let shiftY = SPEED_BALL;
let initPlatformX = platform.getBoundingClientRect().left;

function actionBall() {
  y += shiftY;
  x += shiftX;
  ball.style.top = y + "px";
  ball.style.left = x + "px";

  [shiftX, shiftY] = ballCollidedWalls(x, y, shiftX, shiftY);
  [shiftX, shiftY] = ballCollidedBlocks(x, y, shiftX, shiftY);
  shiftY = ballCollidedPlatform(x, y, shiftY, platform.getBoundingClientRect());

  let animationFrameID = requestAnimationFrame(actionBall);
  //if ball fell
  if (y + rectBall.height + 2 >= rectPlayingField.bottom) {
    getAllInitPosition(animationFrameID);
    countHeartLost++;
    for (let hert of hearts) {
      if (hert.style.display !== "none") {
        hert.style.display = "none";
        break;
      }
    }
    if (countHeartLost === 3) {
      start.innerHTML = "YOU LOSE!";
      start.style.color = "red";
    }
    return;
  }
  //if dastroy all blocks
  if (countScore / 10 === ROWS_BLOCK * COLUMNS_BLOCK) {
    getAllInitPosition(animationFrameID);
    countHeartLost = 3;
    start.innerHTML = "YOU WIN!";
    start.style.color = "green";
    return;
  }
}

//**------------------ASSIST-METHOD-------------------------------------------------**/
function ballCollidedPlatform(x, y, shiftY, rectPlatform) {
  if (
    y + rectBall.height >= rectPlatform.top &&
    y + rectBall.height <= rectPlatform.bottom &&
    x + rectBall.width / 2.0 >= rectPlatform.left &&
    x + rectBall.width / 2.0 <= rectPlatform.right
  ) {
    shiftY *= -1;
  }
  return shiftY;
}

/**______________________________________________________________________ */
function getAllInitPosition(animationFrameID) {
  cancelAnimationFrame(animationFrameID);
  ball.style.left = initBallX + "px";
  ball.style.top = initBallY + "px";
  y = initBallY;
  x = initBallX;
  shiftX = Math.random() > 0.5 ? SPEED_BALL : -SPEED_BALL;
  shiftY = SPEED_BALL;
  document.removeEventListener("mousemove", movePlatform);
  platform.style.left = initBallX - platform.offsetWidth / 2.0 + "px";
  start.style.display = "flex";
}

/**______________________________________________________________________ */
function deleteBlock(block) {
  countScore += 10;
  score.innerHTML = `Score: ${countScore}`;
  block.style.position = "relative";
  block.style.top = "100vh";
}

/**______________________________________________________________________ */
function ballCollidedWalls(x, y, shiftX, shiftY, animationFrameID) {
  //top
  if (y <= 0) {
    shiftY *= -1;
  }
  //left right
  if (
    x <= rectPlayingField.left ||
    x + rectBall.width >= rectPlayingField.right
  ) {
    shiftX *= -1;
  }
  return [shiftX, shiftY];
}

/**______________________________________________________________________ */
function ballCollidedBlocks(x, y, shiftX, shiftY) {
  for (let block of blocks) {
    let rectBlock = block.getBoundingClientRect();
    //top bottom border ball
    if (
      x + rectBall.width / 2.0 >= rectBlock.left &&
      x + rectBall.width / 2.0 <= rectBlock.right
    ) {
      if (
        (y >= rectBlock.top && y <= rectBlock.bottom) ||
        (y + rectBall.height >= rectBlock.top &&
          y + rectBall.height <= rectBlock.bottom)
      ) {
        console.log("top/bottom border");
        deleteBlock(block);
        shiftY *= -1;
        break;
      }
    }
    //leftright ball
    if (
      y + rectBall.height / 2.0 >= rectBlock.top &&
      y + rectBall.height / 2.0 <= rectBlock.bottom
    ) {
      if (
        (x >= rectBlock.left && x <= rectBlock.right) ||
        (x + rectBall.width >= rectBlock.left &&
          x + rectBall.width <= rectBlock.right)
      ) {
        console.log("left/right border");
        deleteBlock(block);
        shiftX *= -1;
        break;
      }
    }
    //left top corner ball
    if (
      x >= rectBlock.left &&
      x <= rectBlock.right &&
      y >= rectBlock.top &&
      y <= rectBlock.bottom
    ) {
      deleteBlock(block);

      if (shiftY < 0 && shiftX < 0) {
        console.log("if up and left");
        shiftX *= -1;
        shiftY *= -1;
      }
      if (shiftY < 0 && shiftX > 0) {
        console.log("if up and right");
        shiftY *= -1;
      }
      if (shiftY > 0 && shiftX < 0) {
        console.log("if down and left");
        shiftX *= -1;
      }
      break;
    }
    //right top corner ball
    if (
      x + rectBall.width >= rectBlock.left &&
      x + rectBall.width <= rectBlock.right &&
      y >= rectBlock.top &&
      y <= rectBlock.bottom
    ) {
      deleteBlock(block);

      if (shiftY < 0 && shiftX < 0) {
        console.log("if up and left");
        shiftY *= -1;
      }
      if (shiftY < 0 && shiftX > 0) {
        console.log("if up and right");
        shiftY *= -1;
        shiftX *= -1;
      }
      if (shiftY > 0 && shiftX < 0) {
        console.log("if down and right");
        shiftX *= -1;
      }
      break;
    }
    //right bottom corner ball
    if (
      x + rectBall.width >= rectBlock.left &&
      x + rectBall.width <= rectBlock.right &&
      y + rectBall.height >= rectBlock.top &&
      y + rectBall.height <= rectBlock.bottom
    ) {
      deleteBlock(block);

      if (shiftY < 0 && shiftX > 0) {
        console.log("if up and right");
        shiftX *= -1;
      }
      if (shiftY > 0 && shiftX > 0) {
        console.log("if down and right");
        shiftY *= -1;
        shiftX *= -1;
      }
      if (shiftY > 0 && shiftX < 0) {
        console.log("if down and left");
        shiftY *= -1;
      }
      break;
    }
    //left bottom corner ball
    if (
      x >= rectBlock.left &&
      x <= rectBlock.right &&
      y + rectBall.height >= rectBlock.top &&
      y + rectBall.height <= rectBlock.bottom
    ) {
      deleteBlock(block);

      if (shiftY < 0 && shiftX < 0) {
        console.log("if up and left");
        shiftX *= -1;
      }
      if (shiftY > 0 && shiftX < 0) {
        console.log("if down and left");
        shiftY *= -1;
        shiftX *= -1;
      }
      if (shiftY > 0 && shiftX > 0) {
        console.log("if down and right");
        shiftY *= -1;
      }
      break;
    }
  }
  return [shiftX, shiftY];
}
