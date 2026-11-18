// 판매자가 칠한 가림 영역(캔버스) → 서버로 보낼 사각형 목록
// 서버 형식: { x, y, width, height } (사진 왼쪽 위 원점, 가로·세로를 1로 나눈 비율), 최대 300개
// 칠한 픽셀을 격자 칸으로 묶어 가로로 이어진 칸을 한 줄로, 같은 폭의 줄이 위아래로 이어지면 한 사각형으로 합침
// 300개를 넘으면 칸을 2배로 키워 다시 합침 (칠한 부분은 항상 덮고, 조금 넓게 가려질 수 있음)

export const MAX_MASK_BOXES = 300;

// 칸 크기 기준: 사진 긴 변의 1/200 (1000px 사진이면 5px)
const BASE_CELLS = 200;

// 칸마다 칠한 픽셀이 있는지
const toFilledCells = (alpha, width, height, cell) => {
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const filled = new Uint8Array(cols * rows);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = Math.floor(y / cell) * cols;
    for (let x = 0; x < width; x += 1) {
      if (alpha[(y * width + x) * 4 + 3] > 0) filled[rowOffset + Math.floor(x / cell)] = 1;
    }
  }
  return { filled, cols, rows };
};

// 칸 → 사각형 (칸 단위 { c0, c1, r0, r1 })
const mergeCells = ({ filled, cols, rows }) => {
  const boxes = [];
  let open = new Map();
  for (let r = 0; r < rows; r += 1) {
    const next = new Map();
    let c = 0;
    while (c < cols) {
      if (!filled[r * cols + c]) {
        c += 1;
        continue;
      }
      const c0 = c;
      while (c < cols && filled[r * cols + c]) c += 1;
      const key = `${c0}-${c - 1}`;
      const box = open.get(key);
      if (box) {
        box.r1 = r;
        next.set(key, box);
      } else {
        const created = { c0, c1: c - 1, r0: r, r1: r };
        boxes.push(created);
        next.set(key, created);
      }
    }
    open = next;
  }
  return boxes;
};

// 소수 넷째 자리에서 내림 (반올림하면 x + width가 1을 살짝 넘어 서버가 '이미지 바깥'으로 거절할 수 있음)
const floor4 = (value) => Math.floor(value * 10000) / 10000;

// canvas: 사진 원래 크기로 만든 가림 캔버스 (칠한 부분만 불투명)
export function canvasToBoxes(canvas, maxBoxes = MAX_MASK_BOXES) {
  const { width, height } = canvas;
  if (!width || !height) return [];
  const alpha = canvas.getContext("2d").getImageData(0, 0, width, height).data;

  let cell = Math.max(1, Math.ceil(Math.max(width, height) / BASE_CELLS));
  for (;;) {
    const boxes = mergeCells(toFilledCells(alpha, width, height, cell));
    if (boxes.length <= maxBoxes) {
      return boxes.map(({ c0, c1, r0, r1 }) => {
        const left = c0 * cell;
        const top = r0 * cell;
        const right = Math.min((c1 + 1) * cell, width);
        const bottom = Math.min((r1 + 1) * cell, height);
        return {
          x: floor4(left / width),
          y: floor4(top / height),
          width: floor4((right - left) / width),
          height: floor4((bottom - top) / height),
        };
      });
    }
    cell *= 2;
  }
}
