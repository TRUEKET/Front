import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import SearchResultBox from "../../components/common/SearchResultBox.jsx";
import searchIcon from "../../assets/icons/home_search.svg";
import { MOCK_RESULTS } from "../../mock/searchResults.js";

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
`;

// 둥근 알약 모양 검색창 (아이콘 + 입력칸), 제출하면 검색결과 화면으로 다시 이동
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

const StyledSearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;

  &::placeholder {
    color: #a9a4b2;
  }
`;

const StyledResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
`;

const StyledResultHeading = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
`;

// 검색어로 신고·제보 이력을 조회한 결과 목록 화면
export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search/result?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <BackHeader />
      <StyledContent>
        <StyledSearchForm onSubmit={handleSubmit}>
          <StyledSearchIcon src={searchIcon} alt="" />
          <StyledSearchInput
            type="text"
            placeholder="검색어를 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </StyledSearchForm>
        <StyledResults>
          <StyledResultHeading>검색결과</StyledResultHeading>
          {MOCK_RESULTS.map((result) => (
            <SearchResultBox key={result.account} {...result} />
          ))}
        </StyledResults>
      </StyledContent>
    </>
  );
}
