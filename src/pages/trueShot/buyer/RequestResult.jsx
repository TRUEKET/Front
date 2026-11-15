import { Navigate, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import ShotPhotos from "./ShotPhotos.jsx";
import checkIcon from "../../../assets/icons/trueshot_check.svg";
import { getRequestStatus, getShotPhotos, getSuccessReasons, getTrueShotRequest } from "../../../api/trueShot.js";

// 판매자 사진 미션 2개
const MISSIONS = ["종이에 인증코드 적어 예매 화면 좌측에 두고 촬영", "예매화면 오른쪽에 손가락 브이한채로 촬영"];

// 결과별 제목·막대 색
const RESULT_TITLE = {
  success: { lines: ["판매자가 트루샷 인증에", "성공했습니다!"], color: "#20894d" },
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

// 색 막대 + 결과 제목
const StyledTitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  &::before {
    content: "";
    flex-shrink: 0;
    width: 10px;
    height: 66px;
    background: ${({ $color }) => $color};
  }
`;

const StyledTitle = styled.h2`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: normal;
`;

// 흰 배경 + 연보라 테두리 + 그림자 카드 (미션, 성공·실패 이유)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  font-weight: 700;
`;

const StyledReasons = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #191919;
  font-size: 14px;
  font-weight: 500;
`;

// 아이콘(13x10 자리) + 문구
const StyledReason = styled.li`
  display: flex;
  gap: 8px;
  align-items: center;

  img {
    display: block;
    flex-shrink: 0;
    margin: -1px -1px -1.5px;
  }
`;

// 점 표시 안내 줄
const StyledNote = styled.li`
  margin-left: 21px;
  list-style: disc;
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

// 트루샷 인증 결과 (성공: 판매자 촬영 사진 + 성공 이유)
export default function RequestResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const request = getTrueShotRequest(id);

  if (!request) return <Navigate to="/trueshot" replace />;

  const status = getRequestStatus(request);
  // 결과 전이면 요청 상세로 (TODO: 실패 화면 작업 전까지 실패는 트루샷 메인으로)
  if (status === "pending") return <Navigate to={`/trueshot/requests/${id}`} replace />;
  if (status !== "success") return <Navigate to="/trueshot" replace />;

  const title = RESULT_TITLE[status];
  const reasons = getSuccessReasons(request);

  return (
    <>
      <BackHeader label="뒤로가기" />
      <StyledContent>
        <StyledTitleRow $color={title.color}>
          <StyledTitle>
            {title.lines[0]}
            <br />
            {title.lines[1]}
          </StyledTitle>
        </StyledTitleRow>

        <StyledCard>
          {MISSIONS.map((mission, index) => (
            <StyledMission key={mission}>
              <StyledMissionNumber>{index + 1}</StyledMissionNumber>
              {mission}
            </StyledMission>
          ))}
        </StyledCard>

        <ShotPhotos photos={getShotPhotos(request)} />

        <StyledCard>
          <StyledCardTitle>성공 이유</StyledCardTitle>
          <StyledReasons>
            {reasons.checks.map((text) => (
              <StyledReason key={text}>
                <img src={checkIcon} alt="" />
                {text}
              </StyledReason>
            ))}
            {reasons.notes.map((text) => (
              <StyledNote key={text}>{text}</StyledNote>
            ))}
          </StyledReasons>
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
