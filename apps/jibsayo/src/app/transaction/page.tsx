import { Typography } from '@package/ui';

export default function TransactionPage() {
  return (
    <div className="min-h-full">
      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Typography variant="h1" className="mb-6 text-5xl font-bold">
            부동산 실거래가 조회
          </Typography>
          <Typography variant="lead" className="mb-8 text-xl text-gray-600">
            정확하고 신뢰할 수 있는 부동산 실거래가 정보를 제공합니다
          </Typography>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700">
              실거래가 검색
            </button>
            <button className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
              지역별 시세 보기
            </button>
          </div>
        </div>
      </section>

      {/* 검색 기능 소개 */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <Typography variant="h2" className="mb-4">
            어떤 정보를 찾고 계신가요?
          </Typography>
          <Typography variant="p" className="text-gray-600">
            다양한 검색 옵션으로 원하는 부동산 정보를 찾아보세요
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '아파트 실거래가',
              desc: '전국 아파트 매매/전세 가격',
              icon: '🏢',
            },
            {
              title: '오피스텔',
              desc: '오피스텔 매매/전세/월세 정보',
              icon: '🏪',
            },
            {
              title: '단독/연립주택',
              desc: '단독주택 및 연립주택 거래가',
              icon: '🏠',
            },
            { title: '토지 거래', desc: '토지 및 임야 실거래가', icon: '🌳' },
          ].map((service, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 text-center text-4xl">{service.icon}</div>
              <Typography variant="h3" className="mb-2 text-center">
                {service.title}
              </Typography>
              <Typography variant="p" className="text-center text-gray-600">
                {service.desc}
              </Typography>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
