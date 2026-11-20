import styled from "styled-components";

// 판매자 화면들이 같이 쓰는 틀

// 판매자 화면 전체 (배경색은 화면마다 다름)
// 판매자 화면엔 탭바가 없어서, 탭바 자리로 비워둔 main 아래 여백(100px)을 없앰
export const StyledSellerPage = styled.div`
  min-height: 100svh;
  margin-bottom: -100px;
  background: ${({ $background = "#fdfdfd" }) => $background};
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 헤더 아래 내용 (아래 고정 버튼 50px + 바닥 여백 12px + 16px만큼 비움)
export const StyledSellerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => `${$gap}px`};
  padding: 16px 16px calc(50px + 12px + 16px);
`;

// 화면 아래 고정 버튼 영역 (바닥에서 12px)
export const StyledSellerBottom = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 12px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 보라 번호 원 (25x25)
export const StyledStepNumber = styled.span`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 99px;
  background: #5434d6;
  color: #fdfdfd;
  font-size: 14px;
  font-weight: 600;
`;
