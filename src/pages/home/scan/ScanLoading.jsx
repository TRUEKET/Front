import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import MainButton from "../../../components/common/MainButton.jsx";
import LoadingTicket from "../../../components/common/LoadingTicket.jsx";
import { analyzeCaptures, countAccounts, deleteAnalysis } from "../../../api/analyze.js";
import { getDefaultAccountIndex, verifyReportEvidence } from "../../../api/report.js";

// 판독은 됐지만 읽기 실패한 경우를 다른 오류와 같이 처리하려고 던지는 오류
class UnreadableError extends Error {}

// 홈 신고하기: 송금 사진의 받는 계좌가 판독 계좌와 같은지 확인
// 계좌 불일치(422), 판독에 계좌가 없음(400)은 오류가 아니라 결과 화면의 불일치 항목으로 보여줌
const checkEvidence = async (result, file, signal) => {
  try {
    const { evidenceToken, message } = await verifyReportEvidence(
      {
        analysisId: result.analyzeId,
        accountIndex: getDefaultAccountIndex(countAccounts(result.identifiers)),
        file,
      },
      { signal },
    );
    return { verified: true, evidenceToken, message };
  } catch (error) {
    if (error.status === 422 || error.status === 400) return { verified: false, message: error.message };
    throw error;
  }
};

const StyledLoading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-top: 279px;
  line-height: normal;
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
// - 판독: POST /analyze 응답을 받으면 결과 화면으로 이동
// - 홈 신고하기(state.evidence 있음): 판독 후 송금 사진 검증(POST /reports/evidence)까지 하고 이동
export default function ScanLoading({ nextPath = "/scan/result" }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const captures = state?.captures;

  useEffect(() => {
    if (!captures) return undefined;

    // 뒤로 가기 등으로 화면을 떠나면 요청 취소
    const controller = new AbortController();
    const { signal } = controller;
    // 판독은 됐는데 송금 검증에서 실패하면 서버의 판독 결과를 바로 지우려고 기억해 둠
    let createdAnalyzeId = null;

    const run = async () => {
      const result = await analyzeCaptures({ captures, additionalInfo: state.memo }, { signal });
      createdAnalyzeId = result.analyzeId;
      // 대화를 못 읽으면 200 + readable false로 옴 (결과 화면 없이 다시 캡처 안내)
      if (!result.readable) throw new UnreadableError(result.message);

      const evidence = state.evidence ? await checkEvidence(result, state.evidence, signal) : null;
      // 원본 사진 보기용으로 캡처 파일도 같이 넘김
      navigate(nextPath, {
        state: { result, captures, evidence, tradeType: state.tradeType },
        replace: true,
      });
    };

    run().catch((error) => {
      if (createdAnalyzeId) deleteAnalysis(createdAnalyzeId).catch(() => {});
      if (error.name === "AbortError") return;
      setErrorMessage(error.message);
    });
    return () => controller.abort();
  }, [navigate, nextPath, state, captures]);

  // 새로고침, 주소 직접 입력처럼 보낼 캡처 없이 들어오면 홈으로 보냄
  if (!captures) return <Navigate to="/" replace />;

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
      <LoadingTicket />
      <StyledMessage>AI가 대화 내용을 판독 중입니다...</StyledMessage>
    </StyledLoading>
  );
}
