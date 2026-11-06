// 이의제기 이유별 증빙 업로드 화면 구성
// sub의 {account}는 조회한 계좌로 바뀜, boldAccount면 계좌 부분만 굵게
// divider: dashed 점선 / solid 실선 / null 없음
// descriptionFirst: 설명 입력칸을 증빙 카드보다 위에 둠 (기타)
export const MOCK_DISPUTE_EVIDENCE = {
  normal: {
    descriptionRequired: false,
    descriptionFirst: false,
    descriptionPlaceholder: "예: 10월 13일에 전액 환불했습니다.(최대 400자)",
    cards: [
      { id: "ticket", title: "표 전달 내역", sub: "표를 받았다는 대화 캡쳐", divider: "dashed" },
      {
        id: "deposit",
        title: "정상 거래 입금 내역",
        sub: "{account}으로 돈이 들어온 기록이 보이게 올려주세요.",
        boldAccount: true,
        divider: "dashed",
      },
    ],
  },
  refund: {
    descriptionRequired: false,
    descriptionFirst: false,
    descriptionPlaceholder: "예: 10월 13일에 전액 환불했습니다.(최대 400자)",
    cards: [
      {
        id: "refund",
        title: "환불 이체확인증",
        sub: "{account}에서 보낸 기록이 보이게 올려주세요.",
        divider: "solid",
      },
    ],
  },
  stolen: {
    descriptionRequired: false,
    descriptionFirst: false,
    descriptionPlaceholder: "예: 10월 13일에 전액 환불했습니다.(최대 400자)",
    cards: [
      {
        id: "stolen",
        title: "명의 도용을 확인할 수 있는 증빙 자료",
        sub: "아래 중 하나에 {account}이 보이게 올려주세요.",
        bullets: ["경찰 신고 확인서(사건사고사실확인원)", "은행의 명의도용·지급정지 확인 자료"],
        divider: null,
      },
    ],
  },
  etc: {
    descriptionRequired: true,
    descriptionFirst: true,
    descriptionPlaceholder: "언제, 어떤 거래였는지, 왜 기록이 잘못됐다고 생각하는지 적어주세요(최대 400자)",
    cards: [
      {
        id: "etc",
        title: "증빙 자료",
        sub: "설명을 뒷받침할 자료를 올려주세요.",
        largeSub: true,
        divider: "solid",
      },
    ],
  },
};
