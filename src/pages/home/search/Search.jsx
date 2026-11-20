import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import SearchResultBox from "../../../components/common/SearchResultBox.jsx";
import searchIcon from "../../../assets/icons/home_search.svg";
import { searchLookup, toCountText, toStatus } from "../../../api/lookup.js";

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

// 조회 실패 시 안내 문구 (400은 서버 문구가 "잘못된 요청 값입니다."라 입력 형식을 안내)
const getSearchErrorMessage = (error) =>
  error.status === 400 ? "계좌번호, 전화번호, X 계정 형식으로 입력해 주세요." : error.message;

// 전화번호·계좌번호로 신고·제보 이력을 조회하고, 결과도 같은 화면에 보여줌
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchedQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(searchedQuery);
  const navigate = useNavigate();

  // 어떤 검색어의 결과인지 같이 저장 (검색어와 다르면 아직 불러오는 중)
  const [lookup, setLookup] = useState({ query: "", result: null, error: "" });
  const isLoading = Boolean(searchedQuery) && lookup.query !== searchedQuery;
  // 같은 검색어를 다시 제출해도 새로 조회하도록 (요청 제한 뒤 재시도 등)
  const [searchCount, setSearchCount] = useState(0);

  // 주소의 검색어(q)가 바뀌거나 다시 제출할 때마다 조회, 이전 요청은 취소
  useEffect(() => {
    if (!searchedQuery) return undefined;

    const controller = new AbortController();
    searchLookup(searchedQuery, { signal: controller.signal })
      .then((result) => setLookup({ query: searchedQuery, result, error: "" }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setLookup({ query: searchedQuery, result: null, error: getSearchErrorMessage(error) });
      });
    return () => controller.abort();
  }, [searchedQuery, searchCount]);

  // 검색결과 영역 내용: 검색 전, 불러오는 중, 오류, 결과 없음, 결과 카드
  const renderResult = () => {
    if (!searchedQuery) return <StyledEmptyText>결과가 없습니다.</StyledEmptyText>;
    if (isLoading) return null;
    if (lookup.error) return <StyledEmptyText>{lookup.error}</StyledEmptyText>;

    // 신고된 적 없는 값은 identifierId가 null로 옴 (세부정보가 없어 결과 없음으로 표시)
    const { result } = lookup;
    if (!result || result.identifierId === null) {
      return <StyledEmptyText>결과가 없습니다.</StyledEmptyText>;
    }

    // 검색어(원본 값)는 이의제기 신청에 필요해서 주소 대신 화면 이동 state로 넘김
    return (
      <SearchResultBox
        status={toStatus(result.riskLevel)}
        account={searchedQuery}
        reportCount={toCountText(result.fraudCount)}
        suspectCount={toCountText(result.suspicionCount)}
        onClick={() => navigate(`/search/detail?id=${result.identifierId}`, { state: { query: searchedQuery } })}
      />
    );
  };

  // replace로 바꿔서 재검색이 히스토리에 쌓이지 않고, 뒤로가기는 바로 홈으로
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() }, { replace: true });
    setSearchCount((count) => count + 1);
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
          {renderResult()}
        </StyledResults>
      </StyledContent>
    </>
  );
}
