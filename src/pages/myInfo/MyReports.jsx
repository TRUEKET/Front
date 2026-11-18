import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MyReportItem from "../../components/myInfo/MyReportItem.jsx";
import personBadgeIcon from "../../assets/icons/header_person_badge.svg";
import { getMyPhoneLast4, getMyReports } from "../../api/myReports.js";

// 헤더 아래 16px 띄우고(피그마 기준 제목 y=84) 제목 · 내 번호 · 이력 목록을 16px 간격으로 나열
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 16px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
`;

const StyledTitle = styled.h2`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
`;

// 사람 배지 아이콘 + 내 번호 뒷자리
const StyledMyPhone = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: #4e4a57;
  font-size: 16px;
  font-weight: 600;
`;

// 아이콘 영역 20x20 안에 15x20 배지를 가운데 배치
const StyledBadgeIcon = styled.span`
  display: flex;
  justify-content: center;
  width: 20px;
  height: 20px;

  img {
    display: block;
  }
`;

const StyledHistory = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledHistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4e4a57;
  white-space: nowrap;
`;

const StyledHistoryTitle = styled.p`
  font-size: 16px;
  font-weight: 600;
`;

const StyledHistoryCount = styled.p`
  font-size: 12px;
  font-weight: 500;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 내가 한 신고·제보 목록 (최신 순, GET /me/reports)
export default function MyReports() {
  const navigate = useNavigate();
  // 불러오기 전 null (불러오기 실패도 빈 목록으로 보여줌)
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getMyReports({ signal: controller.signal })
      .then(setReports)
      .catch((error) => {
        if (error.name !== "AbortError") setReports([]);
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <BackHeader label="홈" />
      <StyledContent>
        <StyledTitle>내 신고 리스트</StyledTitle>
        <StyledMyPhone>
          <StyledBadgeIcon>
            <img src={personBadgeIcon} alt="" />
          </StyledBadgeIcon>
          {getMyPhoneLast4()}
        </StyledMyPhone>
        <StyledHistory>
          <StyledHistoryHeader>
            <StyledHistoryTitle>신고, 제보 이력</StyledHistoryTitle>
            {reports && <StyledHistoryCount>{reports.length}건 · 최신 순</StyledHistoryCount>}
          </StyledHistoryHeader>
          <StyledList>
            {reports?.map((report) => (
              <MyReportItem
                key={report.id}
                report={report}
                onClick={() => navigate(`/myinfo/reports/${report.id}`)}
              />
            ))}
          </StyledList>
        </StyledHistory>
      </StyledContent>
    </>
  );
}
