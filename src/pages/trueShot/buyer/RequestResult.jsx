import { Fragment, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import ShotPhotos from "./ShotPhotos.jsx";
import ResultTitle from "../../../components/trueShot/ResultTitle.jsx";
import ReasonList from "../../../components/trueShot/ReasonList.jsx";
import { getExpiredReason, getSuccessReasons, getTrueShotRequest } from "../../../api/trueShot.js";

// 인증은 성공했지만 판매자 사진을 받지 못했을 때 사진 아래 안내 (피그마에 없음, 디자인 확인 필요)
const NO_PHOTOS_NOTICE = "판매자가 사진을 보내지 않았어요.";

// 판매자 사진 미션 (2차는 서버가 공개한 지시 instruction2, 공개 전이면 피그마 기본 문구)
const FIRST_MISSION = "종이에 인증코드 적어 예매 화면 좌측에 두고 촬영";
const DEFAULT_SECOND_MISSION = "예매화면 오른쪽에 손가락 브이한채로 촬영";

const getMissions = (request) => [
  FIRST_MISSION,
  request.instruction2 || DEFAULT_SECOND_MISSION,
];

// 결과별 화면 차이 (피그마 기준 성공·실패 화면 수치가 조금씩 다름)
// backLabel: 뒤로가기 문구, lines: 제목 줄, color: 제목 옆 막대, barHeight: 막대 높이(두 줄 66 / 한 줄 48)
// missionGap: 미션 카드 간격, reasonsTitle·reasonsWeight: 이유 카드 제목
const RESULT_CONFIG = {
  success: {
    backLabel: "뒤로가기",
    lines: ["판매자가 트루샷 인증에", "성공했습니다!"],
    color: "#20894d",
    missionGap: 12,
    reasonsTitle: "성공 이유",
    reasonsWeight: 700,
  },
  failed: {
    backLabel: "인증 요청",
    lines: ["판매자가 트루샷 인증에", "실패했습니다."],
    color: "#ca2317",
    missionGap: 11,
    reasonsTitle: "실패 이유",
    reasonsWeight: 600,
  },
  // 시간 만료: 피그마 디자인이 없어 실패 화면 틀 재사용, 막대는 회색(트루켓/연그레이보라 #a9a4b2)
  expired: {
    backLabel: "인증 요청",
    lines: ["시간 만료"],
    color: "#a9a4b2",
    barHeight: 48,
    missionGap: 11,
    reasonsTitle: "만료 이유",
    reasonsWeight: 600,
  },
};

// 헤더 아래 16px 띄우고(피그마 기준 제목 y=84) 12px 간격, 아래 고정 버튼(50px) + 바닥 여백(12px)만큼 비움
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px 16px calc(50px + 12px + 16px);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 흰 배경 + 연보라 테두리 + 그림자 카드 (미션, 성공·실패 이유)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 12 }) => `${$gap}px`};
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

// 보라 번호 원 + 미션 문구
const StyledMission = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-size: 12px;
  font-weight: 600;
`;

const StyledMissionNumber = styled.span`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 99px;
  background: #5434d6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const StyledCardTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: ${({ $weight }) => $weight};
`;

// 시간 만료 이유 한 줄 (실패가 아니라 체크·X 표시 없이 문구만, 이유 목록과 같은 글자)
const StyledExpiredReason = styled.p`
  color: #191919;
  font-size: 14px;
  font-weight: 500;
`;

// 화면 아래 고정 버튼 (바닥에서 12px)
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

// 트루샷 인증 결과 (성공: 판매자 촬영 사진 + 성공 이유 / 실패: 실패 이유 / 시간 만료: 만료 문구)
export default function RequestResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 불러오기 전 undefined, 없는 요청(404 등)이면 null
  const [request, setRequest] = useState(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getTrueShotRequest(id, { signal: controller.signal })
      .then(setRequest)
      .catch((error) => {
        if (error.name !== "AbortError") setRequest(null);
      });
    return () => controller.abort();
  }, [id]);

  if (request === undefined) return <BackHeader label="뒤로가기" />;
  if (!request) return <Navigate to="/trueshot" replace />;

  const { status } = request;
  // 결과 전이면 요청 상세로
  if (status === "pending") return <Navigate to={`/trueshot/requests/${id}`} replace />;

  const config = RESULT_CONFIG[status];
  const isSuccess = status === "success";
  const successReasons = getSuccessReasons(request);

  return (
    <>
      <BackHeader label={config.backLabel} />
      <StyledContent>
        <ResultTitle color={config.color} barHeight={config.barHeight}>
          {config.lines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </ResultTitle>

        <StyledCard $gap={config.missionGap}>
          {getMissions(request).map((mission, index) => (
            <StyledMission key={mission}>
              <StyledMissionNumber>{index + 1}</StyledMissionNumber>
              {mission}
            </StyledMission>
          ))}
        </StyledCard>

        {isSuccess && <ShotPhotos photos={request.photos} notice={request.photosMissing ? NO_PHOTOS_NOTICE : null} />}

        <StyledCard>
          <StyledCardTitle $weight={config.reasonsWeight}>{config.reasonsTitle}</StyledCardTitle>
          {status === "success" && (
            <ReasonList
              reasons={successReasons.checks.map((text) => ({ passed: true, text }))}
              notes={successReasons.notes}
            />
          )}
          {status === "failed" && <ReasonList reasons={request.failReasons} />}
          {status === "expired" && <StyledExpiredReason>{getExpiredReason()}</StyledExpiredReason>}
        </StyledCard>
      </StyledContent>

      <StyledBottomAction>
        <MainButton type="button" onClick={() => navigate("/")}>
          홈에서 신고 조회하기
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
