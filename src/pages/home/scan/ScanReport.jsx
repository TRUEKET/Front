import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import { MOCK_AI_ACCOUNT_CHECK, MOCK_AI_CHECK_DELAY_MS, MOCK_REPORT_INFO } from "../../../mock/scanReport.js";
import CaptureTiles from "./CaptureTiles.jsx";
import ScanConfirmModal from "./ScanConfirmModal.jsx";

// 신고 종류 탭 (suspect 의심 제보 / fraud 사기 신고)
const REPORT_TYPES = [
  { id: "suspect", title: "의심 제보", sub: "사기 의심 사례를 알립니다" },
  { id: "fraud", title: "사기 신고", sub: "실제 피해 사례를 알립니다" },
];

// 신고 정보 카드에 보여줄 항목
const INFO_ROWS = [
  { key: "tradeType", label: "거래 유형" },
  { key: "account", label: "계좌" },
  { key: "phone", label: "전화번호" },
  { key: "sns", label: "SNS" },
];

// 아래 고정 버튼(50px) + 바닥 여백(12px)만큼 내용 아래를 비워 가려지지 않게 함
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px calc(50px + 12px + 16px);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
`;

const StyledTabs = styled(StyledCard)`
  flex-direction: row;
  gap: 16px;
  align-items: center;
`;

// 선택된 탭은 연보라 + 그림자, 아닌 탭은 회색
const StyledTab = styled.button`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
  height: ${({ $selected }) => ($selected ? "auto" : "51px")};
  box-sizing: border-box;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#e4deff" : "#dedbe5")};
  box-shadow: ${({ $selected }) => ($selected ? "0 1px 2.5px rgba(23, 21, 28, 0.2)" : "none")};
  color: ${({ $selected }) => ($selected ? "#191919" : "#4e4a57")};
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
  cursor: pointer;
`;

const StyledTabTitle = styled.span`
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
`;

const StyledTabSub = styled.span`
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledCardTitle = styled.p`
  margin: 0;
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

const StyledInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StyledInfoLabel = styled.span`
  flex-shrink: 0;
  padding: 6px 12px;
  background: #dedbe5;
  border-radius: 20px;
  box-shadow: 0 1px 1px rgba(92, 88, 102, 0.3);
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
`;

const StyledInfoValue = styled.span`
  overflow: hidden;
  color: #191919;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledAgreeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 동의 체크박스 (15px 네모 + 두 줄 문구)
const StyledAgree = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  input {
    display: none;
  }
`;

// 체크되면 보라색으로 채우고 흰 체크 표시
const StyledCheckBox = styled.span`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  border: 1px solid ${({ $checked }) => ($checked ? "#5434d6" : "#191919")};
  background: ${({ $checked }) => ($checked ? "#5434d6" : "transparent")};

  &::after {
    content: "";
    display: ${({ $checked }) => ($checked ? "block" : "none")};
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #fdfdfd;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const StyledAgreeError = styled.p`
  margin: 0;
  color: #a81e14;
  font-size: 10px;
  font-weight: 500;
`;

const StyledUploadGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledNote = styled.p`
  margin: 0;
  color: ${({ $error }) => ($error ? "#a81e14" : "#191919")};
  font-size: 12px;
  font-weight: 500;
`;

// 푸터 자리에 고정되는 등록하기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
const StyledBottomAction = styled.div`
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

// 판독 결과를 바탕으로 의심 제보 또는 사기 신고를 등록하는 화면
export default function ScanReport() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const info = state ?? MOCK_REPORT_INFO;

  const [reportType, setReportType] = useState("fraud");
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);
  const [images, setImages] = useState([]);
  // idle 확인 전 / checking 확인 중 / match 계좌 일치 / mismatch 계좌 불일치
  const [aiCheck, setAiCheck] = useState("idle");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isFraud = reportType === "fraud";

  const handleAgreeChange = (checked) => {
    setAgreed(checked);
    if (checked) setShowAgreeError(false);
  };

  // 사진을 바꾸면 AI 확인을 다시 받아야 함
  const handleImagesChange = (nextImages) => {
    setImages(nextImages);
    setAiCheck("idle");
  };

  // TODO: API 연동 전까지 목 결과로 AI 계좌 확인
  const handleAiCheck = () => {
    setAiCheck("checking");
    const result = searchParams.get("aiCheck") === "mismatch" ? "mismatch" : MOCK_AI_ACCOUNT_CHECK;
    setTimeout(() => setAiCheck(result), MOCK_AI_CHECK_DELAY_MS);
  };

  // 사기 신고는 사실 기반 동의를 해야 등록 재확인 창을 띄움
  const handleRegister = () => {
    if (isFraud && !agreed) {
      setShowAgreeError(true);
      return;
    }
    setIsConfirmOpen(true);
  };

  // TODO: API 연동 시 신고 등록 요청 후 이동
  const handleConfirm = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <BackHeader label="뒤로 가기" />
      <StyledContent>
        <StyledTabs role="radiogroup" aria-label="신고 종류">
          {REPORT_TYPES.map(({ id, title, sub }) => (
            <StyledTab
              key={id}
              type="button"
              role="radio"
              aria-checked={reportType === id}
              $selected={reportType === id}
              onClick={() => setReportType(id)}
            >
              <StyledTabTitle>{title}</StyledTabTitle>
              <StyledTabSub>{sub}</StyledTabSub>
            </StyledTab>
          ))}
        </StyledTabs>

        <StyledCard>
          <StyledCardTitle>신고 정보</StyledCardTitle>
          {INFO_ROWS.map(({ key, label }) => (
            <StyledInfoRow key={key}>
              <StyledInfoLabel>{label}</StyledInfoLabel>
              <StyledInfoValue>{info[key]}</StyledInfoValue>
            </StyledInfoRow>
          ))}
        </StyledCard>

        {isFraud && (
          <>
            <StyledAgreeGroup>
              <StyledAgree>
                <input type="checkbox" checked={agreed} onChange={(e) => handleAgreeChange(e.target.checked)} />
                <StyledCheckBox $checked={agreed} />
                <span>
                  제보 내용이 사실에 기반한 것을 약속합니다
                  <br />
                  사실과 일치하지 않을 시 불이익이 발생할 수 있다는 것을 인지했습니다
                </span>
              </StyledAgree>
              {showAgreeError && <StyledAgreeError>체크하지 않을 시, 신고에 제한이 발생합니다.</StyledAgreeError>}
            </StyledAgreeGroup>

            <StyledCard>
              <StyledCardTitle>송금 기록 사진</StyledCardTitle>
              <StyledUploadGroup>
                <CaptureTiles images={images} onChange={handleImagesChange} />
                <StyledNote>사진 속 계좌와 신고 정보 계좌가 일치하는 지 확인합니다.</StyledNote>
                {aiCheck === "mismatch" && (
                  <StyledNote $error>사진 속 받는 계좌가 신고 정보 계좌와 상이합니다. 다시 올려주세요</StyledNote>
                )}
              </StyledUploadGroup>
              {aiCheck === "match" ? (
                <MainButton type="button" disabled>
                  확인 완료
                </MainButton>
              ) : (
                <MainButton
                  variant="accent"
                  type="button"
                  disabled={images.length === 0 || aiCheck === "checking"}
                  onClick={handleAiCheck}
                >
                  AI로 확인하기
                </MainButton>
              )}
            </StyledCard>
          </>
        )}
      </StyledContent>

      <StyledBottomAction>
        <MainButton type="button" onClick={handleRegister}>
          등록하기
        </MainButton>
      </StyledBottomAction>

      {isConfirmOpen && (
        <ScanConfirmModal
          message={
            <>
              등록 시 수정이 불가합니다.
              <br />
              등록하시겠습니까?
            </>
          }
          confirmLabel="등록하기"
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
