import styled from "styled-components";

// 화면 하단에 작게 고정 (반투명 검정 바탕, 흰 글씨) — 판매자 주소에 ?debug=1을 붙였을 때만 보이는 확인용 표시
const StyledPanel = styled.pre`
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: 8px;
  z-index: 200;
  margin: 0;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.72);
  color: #ffffff;
  font-family: ui-monospace, Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  pointer-events: none;
`;

const PROBLEM_TEXT = { NO_HANDS: "손 없음", LOW_VICTORY: "브이 점수 부족" };

// 마지막 2차 손 인식 결과 (info: SellerSession의 handDebug, 없으면 대기 문구)
export default function HandDebugPanel({ info }) {
  if (!info) return <StyledPanel>[hand] 2차 사진을 찍으면 손 인식 결과가 여기에 나와요</StyledPanel>;

  const { diagnostics = {}, remainMs, analysis, problem, action } = info;
  const hands = analysis?.hands ?? [];
  const status = diagnostics.skipped
    ? "건너뜀(남은 시간 부족)"
    : diagnostics.timedOut
      ? `시간 초과(${diagnostics.waitedMs}ms)`
      : diagnostics.error
        ? `오류: ${diagnostics.error}`
        : "정상";

  const lines = [
    `[hand] 모델 ${diagnostics.modelMs ?? "-"}ms · 인식 ${diagnostics.recognizeMs ?? "-"}ms${diagnostics.tiled ? " (조각 재인식)" : ""} · ${status}`,
    `촬영 시 남은 시간 ${remainMs === null || remainMs === undefined ? "-" : `${(remainMs / 1000).toFixed(1)}s`} · 이미지 ${analysis?.imageWidth}x${analysis?.imageHeight}`,
    `손 ${hands.length}개: ${hands.map((hand) => `${hand.gesture} ${hand.confidence}`).join(", ") || "-"}`,
    `확인 ${problem ? PROBLEM_TEXT[problem] : "통과"} → ${action}`,
  ];
  return <StyledPanel>{lines.join("\n")}</StyledPanel>;
}
