import { Fragment, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import Button from "../../../components/common/Button.jsx";
import AccountSummaryCard from "../../../components/common/AccountSummaryCard.jsx";
import phoneIcon from "../../../assets/icons/detail_phone.svg";
import xAccountIcon from "../../../assets/icons/detail_x_account.svg";
import otherAccountIcon from "../../../assets/icons/detail_other_account.svg";
import { compareLookup, getLookupDetail, toCountText, toStatus } from "../../../api/lookup.js";

// 연관 정보 타입별 아이콘, 라벨 (서버 type: PHONE, SNS, ACCOUNT)
const RELATED_INFO_CONFIG = {
  PHONE: { icon: phoneIcon, label: "전화번호" },
  SNS: { icon: xAccountIcon, label: "X 계정" },
  ACCOUNT: { icon: otherAccountIcon, label: "다른 계좌" },
};

// 타임라인 신고 종류 라벨 (서버 kind: FRAUD, SUSPICION)
const TIMELINE_KIND_LABELS = {
  FRAUD: "피해 신고",
  SUSPICION: "의심 제보",
};

// "2026-11-15" → "26.11.15"
const formatTimelineDate = (date) => date.slice(2).replaceAll("-", ".");

const NOT_FOUND_MESSAGE = "조회 대상 정보를 찾을 수 없습니다.";
const COMPARE_MISMATCH_MESSAGE = "일치하지 않습니다. 오탈자에 주의해주세요.";

// 비교하기 실패 문구 (400은 서버 문구가 "잘못된 요청 값입니다."라 입력 형식을 안내)
const getCompareErrorMessage = (error) =>
  error.status === 400 ? "형식이 올바르지 않습니다. 다시 확인해 주세요." : error.message;

// 계좌 정보 카드 + 연관 정보 카드 + 타임라인 카드를 세로로 나열
// line-height:1을 여기서만 적용 (전역 index.css의 145%는 그대로 두고, 이 화면 텍스트만 Figma의 lineHeight 100%에 맞춤)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  line-height: 1;
`;

// 연관 정보·타임라인 공통 카드 (흰 배경 + 연보라 테두리)
const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
`;

// 카드 제목 + 부제목 묶음 (카드 전체 gap 8과 별개로 둘 사이만 4)
const StyledCardHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  width: 100%;
`;

const StyledCardTitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
`;

const StyledCardSubtitle = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 500;
  text-align: left;
`;

// 카드 안 구분선 (연관 정보 행 사이, 타임라인 제목 아래 등 공용). $dashed면 행과 행 사이 점선으로
const StyledCardDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px ${({ $dashed }) => ($dashed ? "dashed" : "solid")} var(--border);
`;

// 연관 정보 한 줄: 아이콘+라벨/값 왼쪽, 비교하기 버튼 오른쪽
const StyledRelatedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 36px;
`;

const StyledRelatedInfo = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

// 전화번호·X 계정·다른 계좌 타입 아이콘을 담는 회색 배경 박스
const StyledRelatedIcon = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: #dedbe5;
  border-radius: 10px;
`;

const StyledRelatedTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  color: #191919;
  text-align: left;
`;

const StyledRelatedLabel = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 500;
`;

const StyledRelatedValue = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

// 비교하기 눌렀을 때 해당 행 아래 끼워넣는 입력창 + 확인 버튼
const StyledCompareRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
`;

const StyledCompareInputBox = styled.div`
  flex: 1;
  box-sizing: border-box;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid #dedbe5;
  border-radius: 20px;
`;

const StyledCompareInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: none;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-align: left;

  &::placeholder {
    color: #a9a4b2;
  }
`;

const StyledConfirmButton = styled.button`
  flex-shrink: 0;
  padding: 8px 12px;
  background: #191919;
  border: 1px solid #191919;
  border-radius: 20px;
  color: #fdfdfd;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
`;

// 비교 실패 시 입력창 아래 보이는 안내 문구
const StyledCompareError = styled.p`
  margin: 0;
  width: 100%;
  color: #a81e14;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
`;

// 연관 정보, 타임라인이 비어 있을 때 카드 안에 보이는 안내 문구
const StyledCardEmptyText = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
`;

// 세부정보를 불러오지 못했을 때 화면 가운데 보이는 안내 문구 (검색 결과 화면의 안내 문구와 같은 모양)
const StyledStatusText = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
`;

// 마스킹 안내 문구 (두 줄)
const StyledDisclaimer = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 400;
  text-align: left;
`;

// 전체 행을 감싸는 영역: 점들을 하나로 잇는 세로선을 여기 한 번만 그림
const StyledTimelineList = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

// 첫 점 중심 ~ 마지막 점 중심을 잇는 하나의 선 (각 행의 점이 그 위에 겹쳐 그려짐)
const StyledTimelineLine = styled.div`
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 4.5px;
  width: 0;
  border-left: 1px dashed #dedbe5;
`;

// 점 + 글씨를 한 줄에 놓고, 점을 글씨 세로 중앙에 맞춤
const StyledTimelineRow = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
`;

const StyledTimelineMarker = styled.div`
  display: flex;
  flex-shrink: 0;
  width: 9px;
`;

// 타임라인 한 점 (신고·제보 1건)
const StyledTimelineDot = styled.div`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #a9a4b2;
`;

const StyledTimelineDate = styled.span`
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
`;

// 피해 신고 / 의심 제보 구분 라벨
const StyledTimelineType = styled.span`
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
`;

// 계좌 명의 확인용 이의제기 안내 (밑줄 텍스트, 누르면 이의신청 화면으로 이동)
const StyledDisputeLink = styled.button`
  margin: 0;
  align-self: center;
  width: fit-content;
  border: none;
  border-bottom: 1px solid #191919;
  background: none;
  padding: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
`;

// 연관 정보 행 하나의 비교하기 상태
// idle(기본) / open(입력중) / checking(확인 중) / error(불일치, 오류) / revealed(공개됨)
const INITIAL_COMPARE_ROW = { status: "idle", inputValue: "", revealedValue: "", errorMessage: "" };

// 검색결과에서 계좌를 선택했을 때 보여주는 세부정보 화면 (주소의 id로 세부정보 조회)
export default function DetailInfo() {
  const [searchParams] = useSearchParams();
  const identifierId = searchParams.get("id");
  const navigate = useNavigate();

  // 어떤 id의 결과인지 같이 저장 (주소의 id와 다르면 아직 불러오는 중)
  const [detail, setDetail] = useState({ id: null, data: null, error: "" });

  useEffect(() => {
    if (!identifierId) return undefined;

    const controller = new AbortController();
    getLookupDetail(identifierId, { signal: controller.signal })
      .then((data) => setDetail({ id: identifierId, data, error: "" }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        // 400(잘못된 id 형식)도 사용자에게는 찾을 수 없음으로 안내
        const message = error.status === 400 ? NOT_FOUND_MESSAGE : error.message;
        setDetail({ id: identifierId, data: null, error: message });
      });
    return () => controller.abort();
  }, [identifierId]);

  // 연관 정보 행별 비교하기 상태 (연관 식별자 id로 구분)
  const [compareState, setCompareState] = useState({});
  const getRowState = (rowId) => compareState[rowId] ?? INITIAL_COMPARE_ROW;

  const updateRow = (rowId, changes) => {
    setCompareState((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] ?? INITIAL_COMPARE_ROW), ...changes },
    }));
  };

  const openCompare = (rowId) => updateRow(rowId, { status: "open", inputValue: "" });

  const submitCompare = async (rowId) => {
    const row = getRowState(rowId);
    if (row.status === "checking") return;

    const value = row.inputValue.trim();
    if (!value) {
      updateRow(rowId, { status: "error", errorMessage: "비교할 값을 입력해 주세요." });
      return;
    }

    updateRow(rowId, { status: "checking" });
    try {
      const { matched } = await compareLookup(rowId, value);
      // 일치하면 사용자가 입력한 값을 그대로 보여줌 (서버 value는 SHINHAN:111... 같은 정규화 값이라 쓰지 않음)
      updateRow(
        rowId,
        matched
          ? { status: "revealed", revealedValue: value }
          : { status: "error", errorMessage: COMPARE_MISMATCH_MESSAGE },
      );
    } catch (error) {
      updateRow(rowId, { status: "error", errorMessage: getCompareErrorMessage(error) });
    }
  };

  // id가 없거나 불러오기 실패
  const errorMessage = !identifierId ? NOT_FOUND_MESSAGE : detail.id === identifierId && detail.error;
  if (errorMessage) {
    return (
      <>
        <BackHeader label="검색 결과" />
        <StyledContent>
          <StyledStatusText>{errorMessage}</StyledStatusText>
        </StyledContent>
      </>
    );
  }

  // 불러오는 중
  if (detail.id !== identifierId || !detail.data) {
    return <BackHeader label="검색 결과" />;
  }

  const { maskedValue, riskLevel, fraudCount, suspicionCount, relatedIdentifiers, timeline } = detail.data;
  const summary = {
    status: toStatus(riskLevel),
    account: maskedValue,
    reportCount: toCountText(fraudCount),
    suspectCount: toCountText(suspicionCount),
  };

  return (
    <>
      <BackHeader label="검색 결과" />
      <StyledContent>
        <AccountSummaryCard {...summary} />

        <StyledCard>
          <StyledCardHeading>
            <StyledCardTitle>연관 정보</StyledCardTitle>
            <StyledCardSubtitle>이 계좌가 나온 신고 및 제보에 함께 위치한 정보</StyledCardSubtitle>
          </StyledCardHeading>
          <StyledCardDivider />
          {relatedIdentifiers.length === 0 && (
            <>
              <StyledCardEmptyText>함께 신고된 정보가 없습니다.</StyledCardEmptyText>
              <StyledCardDivider />
            </>
          )}
          {relatedIdentifiers.map((info, index) => {
            const rowId = info.identifierId;
            const row = getRowState(rowId);
            const config = RELATED_INFO_CONFIG[info.type] ?? RELATED_INFO_CONFIG.ACCOUNT;
            const isInputOpen = row.status === "open" || row.status === "checking" || row.status === "error";
            return (
              <Fragment key={rowId}>
                <StyledRelatedRow>
                  <StyledRelatedInfo>
                    <StyledRelatedIcon>
                      <img src={config.icon} alt="" />
                    </StyledRelatedIcon>
                    <StyledRelatedTexts>
                      <StyledRelatedLabel>{config.label}</StyledRelatedLabel>
                      <StyledRelatedValue>
                        {row.status === "revealed" ? row.revealedValue : info.maskedValue}
                      </StyledRelatedValue>
                    </StyledRelatedTexts>
                  </StyledRelatedInfo>
                  {row.status === "idle" && (
                    <Button variant="disabled" onClick={() => openCompare(rowId)}>
                      비교하기
                    </Button>
                  )}
                </StyledRelatedRow>
                {isInputOpen && (
                  <StyledCompareRow>
                    <StyledCompareInputBox>
                      <StyledCompareInput
                        type="text"
                        placeholder="내용을 입력하세요..."
                        value={row.inputValue}
                        onChange={(e) => updateRow(rowId, { inputValue: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitCompare(rowId);
                          }
                        }}
                      />
                    </StyledCompareInputBox>
                    <StyledConfirmButton
                      type="button"
                      disabled={row.status === "checking"}
                      onClick={() => submitCompare(rowId)}
                    >
                      확인
                    </StyledConfirmButton>
                  </StyledCompareRow>
                )}
                {row.status === "error" && <StyledCompareError>{row.errorMessage}</StyledCompareError>}
                {/* 행 사이는 점선, 마지막(안내문구 앞)은 다른 카드와 같은 실선 */}
                <StyledCardDivider $dashed={index < relatedIdentifiers.length - 1} />
              </Fragment>
            );
          })}
          <StyledDisclaimer>
            가려진 전체 정보는 개인정보 유출을 방지하기 위함입니다.
            <br />
            비교하기를 통해 동일한 정보 입력 시 공개됩니다.
          </StyledDisclaimer>
        </StyledCard>

        <StyledCard>
          <StyledCardTitle>신고·제보 타임라인</StyledCardTitle>
          <StyledCardDivider />
          {timeline.length === 0 ? (
            <StyledCardEmptyText>최근 1년간 신고·제보 기록이 없습니다.</StyledCardEmptyText>
          ) : (
            <StyledTimelineList>
              <StyledTimelineLine />
              {timeline.map((item, index) => (
                <StyledTimelineRow key={`${item.date}-${index}`}>
                  <StyledTimelineMarker>
                    <StyledTimelineDot />
                  </StyledTimelineMarker>
                  <StyledTimelineDate>{formatTimelineDate(item.date)}</StyledTimelineDate>
                  <StyledTimelineType>{TIMELINE_KIND_LABELS[item.kind]}</StyledTimelineType>
                </StyledTimelineRow>
              ))}
            </StyledTimelineList>
          )}
        </StyledCard>

        <StyledDisputeLink
          type="button"
          onClick={() =>
            navigate("/search/dispute", { state: { ...summary, identifierId: detail.data.identifierId } })
          }
        >
          내 계좌인가요? 증빙으로 이의제기하기
        </StyledDisputeLink>
      </StyledContent>
    </>
  );
}
