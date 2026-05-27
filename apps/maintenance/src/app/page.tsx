import { headers } from 'next/headers';

const APP_NAMES: Record<string, string> = {
  'jibsayo.polymorph.co.kr': '집사요',
  'autto.polymorph.co.kr': 'Autto',
  'rootbeer-employee-mall.polymorph.co.kr': '임직원몰',
  'oauth.polymorph.co.kr': 'Polymorph 통합 인증',
  'bookmark-share.polymorph.co.kr': '북마크 공유',
  'okra.polymorph.co.kr': 'Okra',
  'collab.polymorph.co.kr': 'Collab',
  'donghaeng.polymorph.co.kr': '동행',
  'polymorph.co.kr': 'Polymorph',
  'www.polymorph.co.kr': 'Polymorph',
};

const UNKNOWN_APP_NAME = '폴리모프 서비스';

function resolveAppName(host: string | null): string {
  if (!host) return UNKNOWN_APP_NAME;
  const cleanHost = host.split(':')[0].toLowerCase();
  return APP_NAMES[cleanHost] ?? UNKNOWN_APP_NAME;
}

export default async function MaintenancePage() {
  const headersList = await headers();
  const host = headersList.get('host');
  const appName = resolveAppName(host);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-6" aria-hidden="true">
          🛠️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {appName} 점검 중
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          더 나은 서비스를 위해 잠시 점검을 진행하고 있습니다.
          <br />
          이용에 불편을 드려 죄송합니다.
        </p>
        <div className="text-xs text-gray-400">
          문의: <span className="font-mono">rootbeer.guy@axzcorp.com</span>
        </div>
      </div>
    </main>
  );
}
