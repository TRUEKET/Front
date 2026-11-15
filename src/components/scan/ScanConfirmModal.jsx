import { useEffect } from "react";
import styled from "styled-components";
import MainButton from "../common/MainButton.jsx";

// 화면 전체를 덮는 반투명 배경
const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.25);
`;

// 화면 가운데 뜨는 확인창 (폭 358, 좌우 16px 여백)
const StyledDialog = styled.div`
  position: absolute;
  top: calc(50% + 1.5px);
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: calc(min(100%, 390px) - 32px);
  box-sizing: border-box;
  padding: 12px 16px;
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
  transform: translate(-50%, -50%);
`;

const StyledMessage = styled.p`
  margin: 0;
  padding: 30px 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  text-align: center;
`;

// 닫기(테두리 있음)와 확인 버튼(테두리 없음) 폭을 똑같이 반씩 나눔
const StyledActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

// 판독 화면들에서 쓰는 확인창 (뒤로 가기 재확인, 등록 재확인 등 문구와 확인 버튼 글자만 바꿔 씀)
export default function ScanConfirmModal({ message, confirmLabel, onClose, onConfirm }) {
  // 확인창이 떠 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <StyledOverlay onClick={onClose}>
      <StyledDialog role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <StyledMessage>{message}</StyledMessage>
        <StyledActions>
          <MainButton variant="outline" type="button" onClick={onClose}>
            닫기
          </MainButton>
          <MainButton type="button" onClick={onConfirm}>
            {confirmLabel}
          </MainButton>
        </StyledActions>
      </StyledDialog>
    </StyledOverlay>
  );
}
