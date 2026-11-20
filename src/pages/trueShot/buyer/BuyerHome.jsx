import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import TrueShotHeader from "../../../components/trueShot/TrueShotHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import LoginRequired from "../../../components/common/LoginRequired.jsx";
import RequestItem from "./RequestItem.jsx";
import useCurrentUser from "../../../hooks/useCurrentUser.js";
import { createTrueShotRequest, getTrueShotRequests } from "../../../api/trueShot.js";

// 진행방식 3단계 (desc가 있으면 제목 아래 설명)
const PROCESS_STEPS = [
  { title: "판매자에게 트루켓 링크 전달" },
  { title: "판매자의 사진 미션", desc: "2번의 실시간 사진 인증을 통해 실소지 티켓임을 확인합니다." },
  { title: "판정 결과에 따른 결정", desc: "성공·실패에 따라서 거래 여부를 결정하는 데에 도움을 받습니다." },
];

// 헤더 아래 48px 띄우고 나머지는 16px 간격으로 나열
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 16px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 흰 배경 + 연보라 테두리 카드
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

// 서비스 소개 (높이 64, 가운데 정렬)
const StyledIntro = styled(StyledCard)`
  justify-content: center;
  height: 64px;
  box-sizing: border-box;
  color: #4e4a57;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const StyledProcess = styled(StyledCard)`
  gap: 11px;
`;

const StyledProcessTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

// 번호 원 + 제목(+설명), 설명이 있으면 위쪽 맞춤
const StyledStep = styled.div`
  display: flex;
  gap: 8px;
  align-items: ${({ $hasDesc }) => ($hasDesc ? "flex-start" : "center")};
`;

// 보라 번호 원 (25x25)
const StyledStepNumber = styled.span`
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

const StyledStepTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledStepTitle = styled.p`
  color: #191919;
  font-size: 12px;
  font-weight: 600;
`;

const StyledStepDesc = styled.p`
  color: #4e4a57;
  font-size: 10px;
  font-weight: 400;
`;

const StyledDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: none;
  background: #dedbe5;
`;

const StyledListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
`;

const StyledListTitle = styled.h2`
  margin: 0;
  color: #4e4a57;
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: normal;
`;

const StyledListCount = styled.p`
  color: #000000;
  font-size: 12px;
  font-weight: 500;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 목록 아래 안내 / 빈 목록 안내
const StyledNote = styled.p`
  color: #000000;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;

// 트루샷 탭 메인 (구매자): 서비스 소개 + 진행방식 + 요청하기 + 내가 요청한 목록
// 비로그인이면 요청하기·목록 자리에 로그인 안내 (요청 목록은 개인 정보)
export default function BuyerHome() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  // GET /trueshot 목록 (불러오기 전 null, 실패하면 빈 목록)
  const [requests, setRequests] = useState(null);
  const [creating, setCreating] = useState(false);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const controller = new AbortController();
    getTrueShotRequests({ signal: controller.signal })
      .then(setRequests)
      .catch((error) => {
        if (error.name !== "AbortError") setRequests([]);
      });
    return () => controller.abort();
  }, [isLoggedIn]);

  // 새 요청을 만들어(POST /trueshot) 바로 요청 상세로 이동
  const handleRequest = async () => {
    setCreating(true);
    try {
      const request = await createTrueShotRequest();
      navigate(`/trueshot/requests/${request.id}`);
    } catch {
      setCreating(false);
    }
  };

  // 촬영 대기 → 요청 상세, 인증 성공·실패·시간 만료 → 결과 화면
  const handleItemClick = (request) => {
    navigate(`/trueshot/requests/${request.id}${request.status === "pending" ? "" : "/result"}`);
  };

  return (
    <>
      <TrueShotHeader />
      <StyledContent>
        <StyledIntro>
          <p>
            트루샷은 양도 시 티켓 사기를 방지하기 위한
            <br />
            실시간 사진 인증 서비스입니다.
          </p>
        </StyledIntro>

        <StyledProcess>
          <StyledProcessTitle>진행방식</StyledProcessTitle>
          {PROCESS_STEPS.map(({ title, desc }, index) => (
            <StyledStep key={title} $hasDesc={Boolean(desc)}>
              <StyledStepNumber>{index + 1}</StyledStepNumber>
              <StyledStepTexts>
                <StyledStepTitle>{title}</StyledStepTitle>
                {desc && <StyledStepDesc>{desc}</StyledStepDesc>}
              </StyledStepTexts>
            </StyledStep>
          ))}
        </StyledProcess>

        {/* 로그인 확인 중(user === undefined)에는 요청 영역을 비워 둠 */}
        {user === undefined ? null : user ? (
          <>
            <MainButton variant="accent" type="button" disabled={creating} onClick={handleRequest}>
              트루샷 요청하기
            </MainButton>

            <StyledDivider />

            <StyledListHeader>
              <StyledListTitle>내가 요청한 목록</StyledListTitle>
              {requests && <StyledListCount>{requests.length}건 · 최신순</StyledListCount>}
            </StyledListHeader>

            {requests === null ? null : requests.length > 0 ? (
              <StyledList>
                {requests.map((request) => (
                  <RequestItem key={request.id} request={request} onClick={() => handleItemClick(request)} />
                ))}
              </StyledList>
            ) : (
              <StyledNote>아직 요청한 트루샷이 없어요.</StyledNote>
            )}

            <StyledNote>트루샷 기록은 7일 간 보관됩니다.</StyledNote>
          </>
        ) : (
          <>
            <StyledDivider />
            <LoginRequired />
          </>
        )}
      </StyledContent>
    </>
  );
}
