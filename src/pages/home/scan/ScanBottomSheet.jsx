import { useEffect } from "react";
import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";

// 화면 전체를 덮는 반투명 배경
const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.25);
`;

// 화면 아래에 붙는 시트 (폭 358, 위쪽 모서리만 둥글게, 화면 위에서 topGap만큼 띄우고 넘치면 시트 안에서 스크롤)
const StyledSheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => `${$gap}px`};
  width: calc(min(100%, 390px) - 32px);
  max-height: ${({ $topGap }) => `calc(100dvh - ${$topGap}px)`};
  box-sizing: border-box;
  padding: 12px 16px;
  overflow-x: hidden;
  overflow-y: auto;
  background: ${({ $background }) => $background};
  box-shadow: ${({ $shadow }) => ($shadow ? "0 1px 2.5px rgba(23, 21, 28, 0.2)" : "none")};
  border-radius: 20px 20px 0 0;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
  transform: translateX(-50%);

  /* 시트 높이가 모자라도 내용이 눌리지 않고 스크롤되도록 */
  & > * {
    flex-shrink: 0;
  }
`;

// 판독결과 화면에서 쓰는 바텀시트 틀 (배경 누르거나 닫기 누르면 닫힘)
export default function ScanBottomSheet({
  onClose,
  children,
  gap = 16,
  background = "#ffffff",
  shadow = false,
  topGap = 0,
}) {
  // 시트가 떠 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <StyledOverlay onClick={onClose}>
      <StyledSheet
        role="dialog"
        aria-modal="true"
        $gap={gap}
        $background={background}
        $shadow={shadow}
        $topGap={topGap}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <MainButton type="button" onClick={onClose}>
          닫기
        </MainButton>
      </StyledSheet>
    </StyledOverlay>
  );
}
