import { useState } from "react";
import styled, { css } from "styled-components";
import chevronIcon from "../../../assets/icons/box_chevron_right.svg";

// 흰 배경 + 연보라 테두리 카드 (그림자 없음)
const StyledCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
`;

// 점선 네모 + "AI가 본 위치" 범례
const StyledLegend = styled.p`
  display: flex;
  gap: 4px;
  align-items: center;
  color: #4e4a57;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &::before {
    content: "";
    width: 23px;
    height: 15px;
    box-sizing: border-box;
    border: 1.5px dashed #321f80;
    border-radius: 5px;
  }
`;

// 접힘: 두 장 나란히 / 펼침: 두 장 세로로 크게
const StyledPhotos = styled.div`
  display: flex;
  flex-direction: ${({ $expanded }) => ($expanded ? "column" : "row")};
  gap: 12px;
  justify-content: center;
`;

// 사진 틀 (어두운 배경 위에 사진을 가운데 배치)
const StyledFrame = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background: #4e4a57;
  color: #fdfdfd;
  font-size: 10px;
  font-weight: 500;

  ${({ $expanded }) =>
    $expanded
      ? css`
          height: 377px;
          border-radius: 43px;
        `
      : css`
          width: 143px;
          height: 175px;
          border-radius: 20px;
        `}

  img {
    display: block;
    object-fit: cover;
    width: ${({ $expanded }) => ($expanded ? "239px" : "111px")};
    height: ${({ $expanded }) => ($expanded ? "299px" : "139px")};
  }
`;

// 크게 보기 / 접기 버튼 (오른쪽 정렬, 왼쪽 화살표 원본을 돌려 아래·위 방향으로)
const StyledToggle = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  align-self: flex-end;
  padding: 0;
  border: none;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  cursor: pointer;

  img {
    display: block;
    transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "-90deg")});
  }
`;

// 판매자 촬영 사진 2장 (photos: 이미지 주소, 없으면 null → "사진 원본" 자리 표시)
export default function ShotPhotos({ photos }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <StyledCard>
      <StyledHeader>
        <StyledTitle>판매자 촬영 사진</StyledTitle>
        <StyledLegend>AI가 본 위치</StyledLegend>
      </StyledHeader>
      <StyledPhotos $expanded={expanded}>
        {photos.map((photo, index) => (
          <StyledFrame key={index} $expanded={expanded}>
            {photo ? <img src={photo} alt={`판매자 촬영 사진 ${index + 1}`} /> : "사진 원본"}
          </StyledFrame>
        ))}
      </StyledPhotos>
      <StyledToggle type="button" $expanded={expanded} onClick={() => setExpanded((prev) => !prev)}>
        {expanded ? "접기" : "크게 보기"}
        <img src={chevronIcon} alt="" />
      </StyledToggle>
    </StyledCard>
  );
}
