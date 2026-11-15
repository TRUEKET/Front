import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

// 판독 결과 연동 전까지 로딩 화면을 보여줄 시간
const LOADING_MS = 2500;

const StyledLoading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 279px;
  line-height: normal;
`;

// 모션 애니메이션이 들어갈 자리 (애니메이션 파일 받기 전까지 자리만 표시)
const StyledMotionArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 150px;
  height: 150px;
  border: 1px solid #000000;
  color: #000000;
  font-family: "esamanru", sans-serif;
  font-size: 12px;
  font-weight: 300;
  text-align: center;
`;

const StyledMessage = styled.p`
  margin: 0;
  color: #000000;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

// 판독하기를 누른 뒤 AI 판독이 끝날 때까지 보여주는 화면
export default function ScanLoading() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/scan/result", { state, replace: true }), LOADING_MS);
    return () => clearTimeout(timer);
  }, [navigate, state]);

  return (
    <StyledLoading>
      <StyledMotionArea>
        모션 애니메이션
        <br />
        삽입 부분
      </StyledMotionArea>
      <StyledMessage>AI가 대화 내용을 판독 중입니다...</StyledMessage>
    </StyledLoading>
  );
}
