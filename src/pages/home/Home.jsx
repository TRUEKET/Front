import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import searchIcon from "../../assets/icons/home_search.svg";
import ctaArrowIcon from "../../assets/icons/home_cta_arrow.svg";

// 홈 화면 전체 영역: 검색 섹션 + CTA 카드 섹션을 세로로 나열 (헤더 바로 아래 여백 48)
const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding: 48px 16px 16px;
`;

// 안내 문구 + 전화번호 검색창
const StyledSearchSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

// 안내 제목 + 부제목 묶음
const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  width: 100%;
  color: #4e4a57;
  text-align: center;
  font-family: "Pretendard", sans-serif;
`;

// 한 줄 고정
const StyledTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
`;

const StyledSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
`;

// 전화번호 검색창 (아이콘 + 입력칸), 제출하면 검색결과 화면으로 이동
const StyledSearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  padding: 0 16px;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

const StyledSearchIcon = styled.img`
  flex-shrink: 0;
  display: block;
`;

// 검색창 입력칸 (테두리·배경 제거해 박스에 자연스럽게 묻힘)
const StyledSearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;

  &::placeholder {
    color: #a9a4b2;
  }
`;

// 대화 판독하기 · 사기 피해 신고 진입 카드
const StyledCtaSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
`;

// 검색 섹션과 CTA 카드 사이 구분선
const StyledDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px solid var(--border);
`;

// 판독하기·신고하기로 이동하는 카드 (제목/설명 + 오른쪽 화살표 버튼)
const StyledCtaCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 24px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
  box-shadow: 0 1px 2.5px rgba(23, 21, 28, 0.2);
  text-decoration: none;
`;

const StyledCtaTexts = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
  color: #4e4a57;
  text-align: left;
  font-family: "Pretendard", sans-serif;
`;

const StyledCtaTitle = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const StyledCtaDesc = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
`;

// 카드 오른쪽 원형 화살표 버튼 (배경·화살표가 하나의 svg)
const StyledCtaArrow = styled.img`
  flex-shrink: 0;
  display: block;
`;

export default function Home() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!phone.trim()) return;
    navigate(`/search/result?q=${encodeURIComponent(phone.trim())}`);
  };

  return (
    <StyledHome>
      <StyledSearchSection>
        <StyledHeading>
          <StyledTitle>티켓 사기가 의심스러우신가요?</StyledTitle>
          <StyledSubtitle>다른 사용자들의 신고 이력을 확인할 수 있어요</StyledSubtitle>
        </StyledHeading>
        <StyledSearchForm onSubmit={handleSubmit}>
          <StyledSearchIcon src={searchIcon} alt="" />
          <StyledSearchInput
            type="tel"
            placeholder="010XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </StyledSearchForm>
      </StyledSearchSection>

      <StyledCtaSection>
        <StyledDivider />
        <StyledCtaCard to="/trueshot">
          <StyledCtaTexts>
            <StyledCtaTitle>대화 넣고 판독하기</StyledCtaTitle>
            <StyledCtaDesc>DM·카톡 캡쳐본을 넣으면 근거를 짚어줘요</StyledCtaDesc>
          </StyledCtaTexts>
          <StyledCtaArrow src={ctaArrowIcon} alt="" />
        </StyledCtaCard>
        <StyledCtaCard to="/response">
          <StyledCtaTexts>
            <StyledCtaTitle>사기 피해 신고</StyledCtaTitle>
            <StyledCtaDesc>사기 피해를 알려 또다른 피해자 발생을 막아요</StyledCtaDesc>
          </StyledCtaTexts>
          <StyledCtaArrow src={ctaArrowIcon} alt="" />
        </StyledCtaCard>
      </StyledCtaSection>
    </StyledHome>
  );
}
