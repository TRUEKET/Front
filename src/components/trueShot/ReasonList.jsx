import styled from "styled-components";
import checkIcon from "../../assets/icons/trueshot_check.svg";
import xIcon from "../../assets/icons/trueshot_x.svg";

const StyledReasons = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
  margin: 0;
  padding: 0;
  list-style: none;
  color: #191919;
  font-size: 14px;
  font-weight: 500;
`;

// 초록 체크(13x10 자리) + 문구
const StyledReason = styled.li`
  display: flex;
  gap: 8px;
  align-items: center;

  img {
    display: block;
    flex-shrink: 0;
    margin: -1px -1px -1.5px;
  }
`;

// 빨간 X(13.6x13.07) + 문구 (피그마 기준 간격 12px)
const StyledFailReason = styled.li`
  display: flex;
  gap: 12px;
  align-items: center;

  img {
    display: block;
    flex-shrink: 0;
  }
`;

// 점 표시 안내 줄
const StyledNote = styled.li`
  margin-left: 21px;
  list-style: disc;
`;

// 트루샷 성공·실패 이유 목록
// reasons: [{ passed, text }] (통과 초록 체크 / 실패 빨간 X), notes: 점 표시 안내 줄, gap: 줄 간격
export default function ReasonList({ reasons = [], notes = [], gap = 12 }) {
  return (
    <StyledReasons $gap={gap}>
      {reasons.map(({ passed, text }) =>
        passed ? (
          <StyledReason key={text}>
            <img src={checkIcon} alt="통과" />
            {text}
          </StyledReason>
        ) : (
          <StyledFailReason key={text}>
            <img src={xIcon} alt="실패" />
            {text}
          </StyledFailReason>
        ),
      )}
      {notes.map((text) => (
        <StyledNote key={text}>{text}</StyledNote>
      ))}
    </StyledReasons>
  );
}
