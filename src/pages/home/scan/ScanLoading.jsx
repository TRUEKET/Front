import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import { analyzeCaptures } from "../../../api/analyze.js";

// 판독 요청이 없는 흐름(홈 신고하기)에서 로딩 화면을 보여줄 시간
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
  text-align: center;
`;

// 판독 실패 시 푸터 자리에 고정되는 다시 올리기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
const StyledBottomAction = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 판독하기를 누른 뒤 AI 판독이 끝날 때까지 보여주는 화면 (nextPath: 판독이 끝나면 이동할 결과 화면)
// - 판독 화면에서 온 경우(state.captures 있음): POST /analyze 응답을 받으면 결과 화면으로 이동
// - 홈 신고하기에서 온 경우: 아직 연동 전이라 정해진 시간 뒤 이동
export default function ScanLoading({ nextPath = "/scan/result" }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!state?.captures) {
      const timer = setTimeout(() => navigate(nextPath, { state, replace: true }), LOADING_MS);
      return () => clearTimeout(timer);
    }

    // 뒤로 가기 등으로 화면을 떠나면 요청 취소
    const controller = new AbortController();
    analyzeCaptures({ captures: state.captures, additionalInfo: state.memo }, { signal: controller.signal })
      .then((result) => {
        // 대화를 못 읽으면 200 + readable false로 옴 (결과 화면 없이 다시 캡처 안내)
        if (!result.readable) {
          setErrorMessage(result.message);
          return;
        }
        // 원본 사진 보기용으로 캡처 파일도 같이 넘김
        navigate(nextPath, { state: { result, captures: state.captures }, replace: true });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setErrorMessage(error.message);
      });
    return () => controller.abort();
  }, [navigate, nextPath, state]);

  // 판독 실패, 읽기 실패: 서버 문구와 함께 판독 화면으로 돌아가는 버튼을 보여줌
  if (errorMessage) {
    return (
      <>
        <StyledLoading>
          <StyledMessage>{errorMessage}</StyledMessage>
        </StyledLoading>
        <StyledBottomAction>
          <MainButton variant="accent" onClick={() => navigate(-1)}>
            다시 올리기
          </MainButton>
        </StyledBottomAction>
      </>
    );
  }

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
