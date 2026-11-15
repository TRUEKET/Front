import { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import Button from "../../components/common/Button.jsx";
import phoneIcon from "../../assets/icons/detail_phone.svg";
import xAccountIcon from "../../assets/icons/detail_x_account.svg";
import otherAccountIcon from "../../assets/icons/detail_other_account.svg";
import { MOCK_RELATED_INFO, MOCK_TIMELINE } from "../../mock/searchDetail.js";

// 연관 정보 타입별 아이콘
const RELATED_INFO_ICONS = {
  phone: phoneIcon,
  x: xAccountIcon,
  account: otherAccountIcon,
};

// 상태별 느낌표 원·배지 색 (status: safe 기본 / caution 의심 / danger 위험)
const STATUS_CONFIG = {
  safe: { circleBg: null, badge: null },
  caution: { circleBg: "#e0a21c", badge: { label: "의심", bg: "#fff4dd", color: "#bf7100" } },
  danger: { circleBg: "#ca2317", badge: { label: "위험", bg: "#ffdfdf", color: "#a81e14" } },
};

// 계좌 정보 카드 + 연관 정보 카드 + 타임라인 카드를 세로로 나열
// line-height:1을 여기서만 적용 (전역 index.css의 145%는 그대로 두고, 이 화면 텍스트만 Figma의 lineHeight 100%에 맞춤)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  line-height: 1;
`;

// 계좌 정보 + 피해 신고·의심 제보 건수 카드
const StyledAccountCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
`;

// 느낌표 원 + 배지/계좌명 묶음
const StyledAccountRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
`;

// 위험·의심 상태일 때만 보이는 느낌표 원 (안전 상태는 렌더링 안 함)
const StyledWarnCircle = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: #fdfdfd;
  font-family: "esamanru", sans-serif;
  font-weight: 700;
  font-size: 18px;
`;

// 배지 + 계좌명을 세로로 쌓는 영역
const StyledAccountTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
`;

// 의심·위험 상태 배지 (안전 상태는 렌더링 안 함)
const StyledBadge = styled.span`
  padding: 4px 8px;
  border-radius: 5px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

// 계좌명 (한 줄 고정)
const StyledAccountName = styled.p`
  margin: 0;
  width: 100%;
  overflow: hidden;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
`;

// 피해 신고·의심 제보 건수 박스를 가로로 나열
const StyledStatRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  color: #4e4a57;
`;

const StyledStatBox = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #dedbe5;
  border-radius: 10px;
`;

const StyledStatLabel = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

const StyledStatValue = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
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

// 계좌 명의 확인용 이의제기 안내 (밑줄 텍스트, 아직 클릭 동작 없음)
const StyledDisputeLink = styled.p`
  margin: 0;
  align-self: center;
  width: fit-content;
  border-bottom: 1px solid #191919;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;

// 연관 정보 행 하나의 비교하기 상태: idle(기본) / open(입력중) / error(불일치) / revealed(공개됨)
const INITIAL_COMPARE_ROW = { status: "idle", inputValue: "" };

// 검색결과에서 계좌를 선택했을 때 보여주는 세부정보 화면
export default function DetailInfo() {
  const { state } = useLocation();
  const { status = "safe", account = "", reportCount = "0명", suspectCount = "0명" } = state ?? {};
  const { circleBg, badge } = STATUS_CONFIG[status];

  const [compareState, setCompareState] = useState({});
  const getRowState = (label) => compareState[label] ?? INITIAL_COMPARE_ROW;

  const openCompare = (label) => {
    setCompareState((prev) => ({ ...prev, [label]: { status: "open", inputValue: "" } }));
  };

  const updateCompareInput = (label, inputValue) => {
    setCompareState((prev) => ({ ...prev, [label]: { ...getRowState(label), inputValue } }));
  };

  const submitCompare = (label, realValue) => {
    const { inputValue } = getRowState(label);
    const matches = inputValue.trim().toLowerCase() === realValue.trim().toLowerCase();
    setCompareState((prev) => ({
      ...prev,
      [label]: { ...prev[label], status: matches ? "revealed" : "error" },
    }));
  };

  return (
    <>
      <BackHeader label="검색결과" />
      <StyledContent>
        <StyledAccountCard>
          <StyledAccountRow>
            {circleBg && <StyledWarnCircle $bg={circleBg}>!</StyledWarnCircle>}
            <StyledAccountTexts>
              {badge && <StyledBadge $bg={badge.bg} $color={badge.color}>{badge.label}</StyledBadge>}
              <StyledAccountName>{account}</StyledAccountName>
            </StyledAccountTexts>
          </StyledAccountRow>
          <StyledStatRow>
            <StyledStatBox>
              <StyledStatLabel>실제 피해 신고</StyledStatLabel>
              <StyledStatValue>{reportCount}</StyledStatValue>
            </StyledStatBox>
            <StyledStatBox>
              <StyledStatLabel>사기 의심 제보</StyledStatLabel>
              <StyledStatValue>{suspectCount}</StyledStatValue>
            </StyledStatBox>
          </StyledStatRow>
        </StyledAccountCard>

        <StyledCard>
          <StyledCardHeading>
            <StyledCardTitle>연관 정보</StyledCardTitle>
            <StyledCardSubtitle>이 계좌가 나온 신고 및 제보에 함께 위치한 정보</StyledCardSubtitle>
          </StyledCardHeading>
          <StyledCardDivider />
          {MOCK_RELATED_INFO.map((info, index) => {
            const row = getRowState(info.label);
            return (
              <Fragment key={info.label}>
                <StyledRelatedRow>
                  <StyledRelatedInfo>
                    <StyledRelatedIcon>
                      <img src={RELATED_INFO_ICONS[info.type]} alt="" />
                    </StyledRelatedIcon>
                    <StyledRelatedTexts>
                      <StyledRelatedLabel>{info.label}</StyledRelatedLabel>
                      <StyledRelatedValue>
                        {row.status === "revealed" ? info.realValue : info.value}
                      </StyledRelatedValue>
                    </StyledRelatedTexts>
                  </StyledRelatedInfo>
                  {row.status === "idle" && (
                    <Button variant="disabled" onClick={() => openCompare(info.label)}>
                      비교하기
                    </Button>
                  )}
                </StyledRelatedRow>
                {(row.status === "open" || row.status === "error") && (
                  <StyledCompareRow>
                    <StyledCompareInputBox>
                      <StyledCompareInput
                        type="text"
                        placeholder="내용을 입력하세요..."
                        value={row.inputValue}
                        onChange={(e) => updateCompareInput(info.label, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitCompare(info.label, info.realValue);
                          }
                        }}
                      />
                    </StyledCompareInputBox>
                    <StyledConfirmButton
                      type="button"
                      onClick={() => submitCompare(info.label, info.realValue)}
                    >
                      확인
                    </StyledConfirmButton>
                  </StyledCompareRow>
                )}
                {row.status === "error" && (
                  <StyledCompareError>일치하지 않습니다. 오탈자에 주의해주세요.</StyledCompareError>
                )}
                {/* 행 사이는 점선, 마지막(안내문구 앞)은 다른 카드와 같은 실선 */}
                <StyledCardDivider $dashed={index < MOCK_RELATED_INFO.length - 1} />
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
          <StyledTimelineList>
            <StyledTimelineLine />
            {MOCK_TIMELINE.map((item, index) => (
              <StyledTimelineRow key={`${item.date}-${index}`}>
                <StyledTimelineMarker>
                  <StyledTimelineDot />
                </StyledTimelineMarker>
                <StyledTimelineDate>{item.date}</StyledTimelineDate>
                <StyledTimelineType>{item.type}</StyledTimelineType>
              </StyledTimelineRow>
            ))}
          </StyledTimelineList>
        </StyledCard>

        <StyledDisputeLink>내 계좌인가요? 증빙으로 이의제기하기</StyledDisputeLink>
      </StyledContent>
    </>
  );
}
