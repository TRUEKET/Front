import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import SearchResultBox from "../../../components/common/SearchResultBox.jsx";
import searchIcon from "../../../assets/icons/home_search.svg";
import { MOCK_RESULTS } from "../../../mock/searchResults.js";

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
`;

// 둥근 알약 모양 검색창 (아이콘 + 입력칸), 제출하면 같은 화면 아래에 결과 표시
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

// 검색결과 라벨 + 결과 카드(또는 안내 문구)를 세로로 쌓음
const StyledResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
`;

const StyledResultHeading = styled.p`
  margin: 0;
  width: 100%;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
`;

const StyledEmptyText = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
`;

// 전화번호·계좌번호로 신고·제보 이력을 조회하고, 결과도 같은 화면에 보여줌
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchedQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(searchedQuery);
  const navigate = useNavigate();

  // replace로 바꿔서 재검색이 히스토리에 쌓이지 않고, 뒤로가기는 바로 홈으로
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() }, { replace: true });
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
          {searchedQuery ? (
            MOCK_RESULTS.map((result) => (
              <SearchResultBox
                key={result.account}
                {...result}
                onClick={() => navigate("/search/detail", { state: result })}
              />
            ))
          ) : (
            <StyledEmptyText>결과가 없습니다.</StyledEmptyText>
          )}
        </StyledResults>
      </StyledContent>
    </>
  );
}
