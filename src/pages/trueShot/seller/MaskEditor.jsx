import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import pencilIcon from "../../../assets/icons/trueshot_pencil_fill.svg";
import eraserIcon from "../../../assets/icons/trueshot_eraser.svg";
import { canvasToBoxes } from "../../../utils/maskBoxes.js";

// 화면 기준 붓 굵기(px) - 사진 해상도에 맞춰 바꿔서 그림
const BRUSH_SIZE = 20;

const TOOLS = [
  { id: "draw", label: "그리기", icon: pencilIcon },
  { id: "erase", label: "지우기", icon: eraserIcon },
];

const StyledEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 16px 12px;
`;

// 사진 영역 (9:16, 어두운 배경 가운데에 사진을 맞춰 넣음)
const StyledStage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 333.3 / 592.53;
  overflow: hidden;
  background: #1b1b1b;
`;

// 사진 + 그 위에 가림 캔버스를 겹침 (사진 비율 그대로)
const StyledCanvasWrap = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  width: ${({ $wide }) => ($wide ? "100%" : "auto")};
  height: ${({ $wide }) => ($wide ? "auto" : "100%")};

  img,
  canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  canvas {
    cursor: crosshair;
    touch-action: none;
  }
`;

const StyledTools = styled.div`
  display: flex;
  gap: 13px;
`;

// 그리기 / 지우기 (선택된 쪽은 연보라 + 진한 글씨)
const StyledTool = styled.button`
  display: flex;
  flex: 1 0 0;
  gap: 12px;
  justify-content: center;
  align-items: center;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid #cac0f2;
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#e4deff" : "#dedbe5")};
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: ${({ $selected }) => ($selected ? "#191919" : "#4e4a57")};
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 600)};
  line-height: normal;
  cursor: pointer;
`;

// 아이콘을 글씨색으로 칠함 (선택 여부에 따라 검정·회색)
const StyledToolIcon = styled.span`
  width: 30px;
  height: 30px;
  background: currentColor;
  /* 작은 SVG는 빌드 시 data URL로 들어와서 따옴표로 감싸야 함 */
  mask: url("${({ $icon }) => $icon}") center / contain no-repeat;
`;

// 찍은 사진의 개인정보를 직접 더 가리는 화면 (그리기: 검정 붓 / 지우기: 그린 부분을 지움)
// photo: 서버가 자동으로 가린 미리보기 사진 주소 (GET /s/{token}/preview/{n})
// onDone(boxes): 판매자가 칠한 영역을 사각형 목록(0~1 비율, 최대 300개)으로 넘김. 서버가 사진 위에 덧칠함
// busy: 저장 요청 중이면 버튼 비활성
export default function MaskEditor({ photo, buttonLabel, onDone, busy = false }) {
  const canvasRef = useRef(null);
  const lastPointRef = useRef(null);
  const [size, setSize] = useState(null);
  const [tool, setTool] = useState("draw");

  // 사진 원래 크기에 맞춰 가림 캔버스 준비
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setSize({ width: image.width, height: image.height });
    };
    image.src = photo;
  }, [photo]);

  // 화면 좌표 → 사진 좌표
  const toCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      scale: canvas.width / rect.width,
    };
  };

  const drawLine = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = tool === "draw" ? "source-over" : "destination-out";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = BRUSH_SIZE * to.scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = toCanvasPoint(e);
    lastPointRef.current = point;
    drawLine(point, point);
  };

  const handlePointerMove = (e) => {
    if (!lastPointRef.current) return;
    const point = toCanvasPoint(e);
    drawLine(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    lastPointRef.current = null;
  };

  // 칠한 영역 → 서버로 보낼 사각형 목록 (사진 원래 크기 기준 비율)
  const handleDone = () => {
    onDone(canvasToBoxes(canvasRef.current));
  };

  return (
    <StyledEditor>
      <StyledStage>
        {size && (
          <StyledCanvasWrap $ratio={`${size.width} / ${size.height}`} $wide={size.width / size.height > 333.3 / 592.53}>
            <img src={photo} alt="찍은 사진" />
            <canvas
              ref={canvasRef}
              width={size.width}
              height={size.height}
              aria-label="개인정보 가리기 영역"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </StyledCanvasWrap>
        )}
      </StyledStage>

      <StyledTools role="radiogroup" aria-label="가리기 도구">
        {TOOLS.map(({ id, label, icon }) => (
          <StyledTool
            key={id}
            type="button"
            role="radio"
            aria-checked={tool === id}
            $selected={tool === id}
            onClick={() => setTool(id)}
          >
            <StyledToolIcon $icon={icon} />
            {label}
          </StyledTool>
        ))}
      </StyledTools>

      <MainButton type="button" disabled={!size || busy} onClick={handleDone}>
        {buttonLabel}
      </MainButton>
    </StyledEditor>
  );
}
