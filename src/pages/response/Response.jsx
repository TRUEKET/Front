import { useState } from "react";
import styled from "styled-components";
import ResponseStep from "../../components/response/ResponseStep.jsx";
import {
  BlockLeakContent,
  CollectEvidenceContent,
  ReportContent,
  StopTransferContent,
} from "./ResponseStepContents.jsx";

// 대처 단계 (gap: 펼쳤을 때 제목과 내용 사이 간격, 피그마 기준 1단계만 16)
const RESPONSE_STEPS = [
  { title: "추가 송금 멈추기", gap: 16, Content: StopTransferContent },
  { title: "증거 수집하기", gap: 17, Content: CollectEvidenceContent },
  { title: "전달된 정보 유출 막기", gap: 17, Content: BlockLeakContent },
  { title: "신고하기", gap: 17, Content: ReportContent },
];

// 헤더 아래 48px 띄우고 안내 문구 + 단계 목록
const StyledResponse = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 16px 16px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

const StyledHeading = styled.p`
  color: #191919;
  font-size: 16px;
  font-weight: 700;
`;

const StyledSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 대처 탭: 사기 피해 대처 방법 4단계 (여러 단계 동시에 펼칠 수 있고, 기본은 모두 접힘)
export default function Response() {
  const [openSteps, setOpenSteps] = useState([]);

  const toggleStep = (index) => {
    setOpenSteps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <StyledResponse>
      <StyledHeading>
        당황스러운 사기 피해,
        <br />
        대처방법을 알려드립니다!
      </StyledHeading>
      <StyledSteps>
        {RESPONSE_STEPS.map(({ title, gap, Content }, index) => (
          <ResponseStep
            key={title}
            number={index + 1}
            title={title}
            gap={gap}
            open={openSteps.includes(index)}
            onToggle={() => toggleStep(index)}
          >
            <Content />
          </ResponseStep>
        ))}
      </StyledSteps>
    </StyledResponse>
  );
}
