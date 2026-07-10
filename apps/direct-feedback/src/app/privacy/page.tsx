export const metadata = {
  title: 'DirectFeedback — 개인정보처리방침',
};

const S: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '40px 24px 64px',
    fontFamily: 'sans-serif',
    color: '#1a1a1a',
    lineHeight: 1.7,
  },
  h1: { fontSize: 24, margin: '0 0 4px' },
  date: { color: '#8b95a1', fontSize: 13, margin: '0 0 24px' },
  h2: { fontSize: 17, margin: '28px 0 8px' },
  p: { margin: '8px 0' },
  li: { margin: '4px 0' },
};

// 원본: directfeedback-extension/PRIVACY.md 와 동일 내용 (호스팅본).
export default function Privacy() {
  return (
    <main style={S.main}>
      <h1 style={S.h1}>DirectFeedback — 개인정보처리방침</h1>
      <p style={S.date}>최종 수정: 2026-07-10</p>

      <p style={S.p}>
        DirectFeedback(이하 &ldquo;확장&rdquo;)은 웹 화면의 특정 엘리먼트에 코멘트를 남겨
        팀/개발자에게 전달하는 리뷰 도구입니다. 확장은 운영자가 설정한 백엔드 인스턴스와만
        통신하며, 기본값은 운영 인스턴스(directfeedback.polymorph.co.kr)입니다.
      </p>

      <h2 style={S.h2}>수집·처리하는 정보</h2>
      <p style={S.p}>확장을 사용(로그인·리뷰 모드로 코멘트 작성)할 때 다음이 처리됩니다.</p>
      <ul>
        <li style={S.li}>
          <b>계정 식별 정보</b>: oauth 로그인으로 받은 이메일·이름·사용자 ID(JWT). 인증
          토큰은 브라우저 로컬(chrome.storage)에만 저장됩니다.
        </li>
        <li style={S.li}>
          <b>코멘트 컨텍스트</b>: 현재 페이지 URL(스토리 id 포함), 선택한 엘리먼트의
          selector·클래스·태그·위치, 사용자가 입력한 코멘트 본문.
        </li>
      </ul>
      <p style={S.p}>
        확장은 위 정보를 사용자가 명시적으로 코멘트를 작성할 때만 백엔드로 전송합니다.
      </p>

      <h2 style={S.h2}>이용 목적</h2>
      <p style={S.p}>
        수집 정보는 오직 코멘트 저장·표시(같은 그룹 구성원에게)와 개발자/AI 에이전트 전달이라는
        확장의 단일 기능을 위해서만 사용됩니다.
      </p>

      <h2 style={S.h2}>공유 범위</h2>
      <ul>
        <li style={S.li}>코멘트는 같은 그룹에 속한 구성원에게만 표시됩니다.</li>
        <li style={S.li}>
          제3자에게 판매하지 않으며, 광고·추적·분석 목적으로 사용하지 않습니다.
        </li>
        <li style={S.li}>
          외부 제3자 서비스로 전송하지 않습니다(운영자 백엔드 및 인증 서버 제외).
        </li>
      </ul>

      <h2 style={S.h2}>보관·삭제</h2>
      <ul>
        <li style={S.li}>코멘트는 도구 내에서 삭제할 수 있습니다.</li>
        <li style={S.li}>계정/데이터 삭제 요청은 운영자에게 문의하십시오.</li>
      </ul>

      <h2 style={S.h2}>오픈소스</h2>
      <p style={S.p}>
        확장·MCP·API 계약은 오픈소스이며, 누구나 자체 백엔드/인증을 연결해 운영할 수 있습니다.
        그 경우 데이터는 해당 운영자의 인프라에만 저장됩니다.
      </p>

      <h2 style={S.h2}>문의</h2>
      <p style={S.p}>운영자: rootbeer.guy@axzcorp.com</p>
    </main>
  );
}
