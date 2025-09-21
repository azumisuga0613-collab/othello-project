// 8方向ベクトル
const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

let isOddTurn = true;

// toastr 設定
toastr.options = { tapToDismiss: false, timeOut: 0, extendedTimeOut: 0 };

$(function () {
  createBoard();
  $(".square").click(clickSquareEvent);
  $("#btn-initialize").click(initializeEvent);
  initializeEvent();
});

// --- 盤面生成 ---
function createBoard() {
  const board = $("#board").empty();
  for (let r = 0; r < 8; r++) {
    const rowDiv = $("<div>").addClass("board-row");
    for (let c = 0; c < 8; c++) {
      rowDiv.append(
        $("<button>").addClass("btn btn-outline-dark square")
          .attr({ "data-row": r, "data-col": c })
      );
    }
    board.append(rowDiv);
  }
}

function clickSquareEvent() {
  let sq = $(this);
  if (!canSelect(sq)) return;

  toastr.remove();
  putPiece(sq, getTurnString());
  flipPieces(sq.data("row"), sq.data("col"));
  changeTurn();

  if (isGameEnd()) return toastEndMessage("ゲーム終了！");
  if (isPass()) {
    toastr.error(getTurnString() + "には選択できるマスがありません。");
    changeTurn();
    if (isPass()) return toastEndMessage("選択できるマスがなくなりました。");
    setTimeout(() => toastr.info(getTurnString() + "の番です。"), 1000);
    return;
  }
  toastr.info(getTurnString() + "の番です。");
}

function initializeEvent() {
  toastr.remove();
  $(".square").text("").removeAttr("data-owner").removeClass("selected");
  isOddTurn = true;
  [[3,3,"black"], [3,4,"white"], [4,3,"white"], [4,4,"black"]].forEach(([r,c,o])=>{
    putPiece(getTargetSquare(r,c), o);
  });
  changeTurn();
  toastr.info(getTurnString() + "の番です。");
}

function putPiece(sq, owner) {
  sq.text("●").attr("data-owner", owner).addClass("selected");
}

function getTurnString() { return isOddTurn ? "black" : "white"; }

function changeTurn() {
  isOddTurn = !isOddTurn;
  $(".square").each((_,e)=>{
    const sq = $(e);
    sq.toggleClass("can-select", canSelect(sq));
  });
}

// --- 反転処理 ---
function flipPieces(row, col) {
  const current = getTurnString();
  for (let [dr, dc] of directions) {
    const toFlip = [];
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const sq = getTargetSquare(r, c);
      const owner = sq.attr("data-owner");
      if (!owner) break;
      if (owner === current) {
        toFlip.forEach(s => putPiece(s, current));
        break;
      }
      toFlip.push(sq);
      r += dr; c += dc;
    }
  }
}

// --- 置ける判定 ---
function canSelect(square) {
  if (square.hasClass("selected")) return false;
  const row = square.data("row"), col = square.data("col"), current = getTurnString();
  for (let [dr, dc] of directions) {
    let r = row + dr, c = col + dc, hasOpponent = false;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const sq = getTargetSquare(r, c), owner = sq.attr("data-owner");
      if (!owner) break;
      if (owner === current) { if (hasOpponent) return true; break; }
      hasOpponent = true;
      r += dr; c += dc;
    }
  }
  return false;
}

function getTargetSquare(r, c) {
  return $(`[data-row=${r}][data-col=${c}]`);
}

function isGameEnd() { return $(".square.selected").length === 64; }

function toastEndMessage(msg) {
  let b = $("[data-owner=black]").length, w = $("[data-owner=white]").length;
  let judge = `black:${b}<br/>white:${w}<br/>`;
  let result = b===w?"引き分け":(b<w?"whiteの勝利":"blackの勝利");
  toastr.success(`${msg}<br/>${judge}${result}`);
}

function isPass() { return $(".square.can-select").length === 0; }
