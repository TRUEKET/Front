import styled from "styled-components";

// 로그인·회원가입 화면에서 같이 쓰는 스타일 모음

// 라벨 + 입력칸을 담는 흰 카드
export const StyledFieldCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 8 }) => `${$gap}px`};
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: ${({ $shadow }) => ($shadow ? "0 1px 5px rgba(23, 21, 28, 0.2)" : "none")};
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

export const StyledLabel = styled.label`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
`;

// 연보라 테두리의 둥근 입력칸 ($filled: 인증 완료처럼 연보라로 채운 상태)
export const StyledInput = styled.input`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  outline: none;
  background: ${({ $filled }) => ($filled ? "#e4deff" : "#fdfdfd")};
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;

  &::placeholder {
    color: #4e4a57;
  }

  &:focus {
    border-color: #5434d6;
  }
`;

// 형식 오류·로그인 실패 등 빨간 안내 문구
export const StyledFieldError = styled.p`
  color: #ca2317;
  font-size: 12px;
  font-weight: 400;
`;

// 입력 카드·체크박스 세로 나열
export const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 화면 아래 고정 버튼 (바닥에서 12px)
export const StyledBottomAction = styled.div`
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
