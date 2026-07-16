// DirectFeedback MCP 연결 가이드 (공개 페이지 — 팀원 셋업용)
export const metadata = { title: 'DirectFeedback MCP 연결 가이드' };

const MCP_URL = 'https://directfeedback.polymorph.co.kr/api/mcp';

export default function Guide() {
  return (
    <main style={S.main}>
      <h1 style={S.h1}>DirectFeedback MCP 연결 가이드</h1>
      <p style={S.muted}>
        Claude Code에서 DirectFeedback 도구(코멘트·To-Be)를 쓰기 위한 연결 방법입니다. 설치할 것 없이
        URL 등록 + 브라우저 로그인 한 번이면 됩니다.
      </p>

      <h2 style={S.h2}>1. 연결</h2>
      <pre style={S.pre}>{`# 기존 stdio 버전(npm)을 쓰던 사람은 먼저 제거
claude mcp remove directfeedback

# 원격 MCP 등록 (모든 프로젝트에서 사용: -s user)
claude mcp add --transport http -s user directfeedback \\
  ${MCP_URL} --client-id direct-feedback

# 브라우저로 한 번 로그인 (Polymorph 통합 계정)
claude mcp login directfeedback`}</pre>

      <h2 style={S.h2}>2. 확인</h2>
      <pre style={S.pre}>{`claude mcp list        # directfeedback: ✔ connected, ✔ authenticated
# 또는 Claude Code 세션에서:  /mcp`}</pre>
      <p style={S.muted}>도구 6개가 보이면 완료입니다. 아래처럼 자연어로 시켜보세요:</p>
      <blockquote style={S.quote}>“미해결 피드백 확인하고 하나씩 고쳐줘”</blockquote>

      <h2 style={S.h2}>제공 도구</h2>
      <table style={S.table}>
        <tbody>
          {TOOLS.map(([name, desc]) => (
            <tr key={name}>
              <td style={S.tdName}>{name}</td>
              <td style={S.td}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={S.h2}>문제 해결</h2>
      <ul style={S.ul}>
        <li>
          <b>로그인 창이 엉뚱한 페이지(404)로 가요</b> → 오래된 등록입니다. <code>claude mcp remove directfeedback</code>{' '}
          후 위 1번을 다시 실행하세요.
        </li>
        <li>
          <b>도구가 안 보여요</b> → <code>-s user</code>로 등록했는지 확인(<code>claude mcp list</code>). 로그인이 안 됐으면{' '}
          <code>claude mcp login directfeedback</code>.
        </li>
        <li>
          <b>코멘트/To-Be가 안 보여요</b> → 로그인 계정이 해당 피드백 그룹의 멤버인지 확인하세요.
        </li>
        <li>
          <b>구버전 npm(<code>@polym-team/directfeedback-mcp</code>)을 쓰고 있었어요</b> → 더 이상 필요 없습니다. 제거하고 위
          원격 방식으로 전환하세요(설치·토큰 파일 불필요).
        </li>
      </ul>

      <p style={S.footer}>
        연결 URL: <code>{MCP_URL}</code> · 인증: oauth.polymorph.co.kr (Polymorph 통합 로그인)
      </p>
    </main>
  );
}

const TOOLS: [string, string][] = [
  ['list_unresolved_comments', '내 그룹의 미해결 코멘트를 스토리·엘리먼트·본문과 함께 조회'],
  ['resolve_comment', '코멘트를 해결 처리(수정 완료 후)'],
  ['add_reply', '코멘트에 답글'],
  ['create_comment', '스토리에 코멘트 생성(urlKey·body·pageUrl 필수)'],
  ['get_tobe', '디자이너가 그린 To-Be 변경(원본 대비 diff) + 스토리북 버전 조회'],
  ['resolve_tobe', '반영 후 To-Be를 완료 처리(같은 스토리 재작업 가능)'],
];

const S: Record<string, React.CSSProperties> = {
  main: { maxWidth: 760, margin: '0 auto', padding: 24, fontFamily: 'sans-serif', color: '#1a1a1a', lineHeight: 1.6 },
  h1: { fontSize: 24, marginBottom: 4 },
  h2: { fontSize: 17, marginTop: 28, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 },
  muted: { color: '#6b7280', fontSize: 14 },
  pre: { background: '#0f172a', color: '#e2e8f0', padding: 14, borderRadius: 8, overflowX: 'auto', fontSize: 13, lineHeight: 1.5 },
  quote: { borderLeft: '3px solid #1e84ff', margin: '8px 0', padding: '4px 12px', color: '#374151', background: '#f8fafc' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  tdName: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontFamily: 'ui-monospace, monospace', color: '#1e6fd0', whiteSpace: 'nowrap', verticalAlign: 'top' },
  td: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0', color: '#374151' },
  ul: { fontSize: 14, color: '#374151', paddingLeft: 18 },
  footer: { marginTop: 28, paddingTop: 12, borderTop: '1px solid #eee', fontSize: 12, color: '#8b95a1' },
};
