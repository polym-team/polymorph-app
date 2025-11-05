import { Card } from '@package/ui';

const POLICY_LIST = [
  {
    title: '1. 서비스 개요',
    description:
      '본 서비스는 대한민국 정부의 공공데이터포털(data.go.kr)을 통해 제공되는 국토교통부 아파트 매매 실거래가 자료를 활용하여, 아파트 실거래가 추이를 쉽게 확인할 수 있도록 제공하는 서비스입니다.',
  },
  {
    title: '2. 데이터 출처 및 면책 조항',
    description: (
      <>
        <p className="mb-2">
          본 서비스에서 제공하는 아파트 실거래가 데이터는 대한민국 정부의
          공공데이터포털을 통해 제공되는 국토교통부의 공식 데이터를 활용합니다.
        </p>
        <p className="mb-2 font-semibold">데이터 출처:</p>
        <ul className="list-disc list-inside mb-2 space-y-1">
          <li>
            공공데이터포털:{' '}
            <a
              href="https://www.data.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://www.data.go.kr
            </a>
          </li>
          <li>
            국토교통부 아파트 실거래가 API:{' '}
            <a
              href="https://www.data.go.kr/data/15058017/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://www.data.go.kr/data/15058017/openapi.do
            </a>
          </li>
        </ul>
        <p className="mb-2 font-semibold">중요 면책 조항:</p>
        <p>
          본 서비스는 정부 기관이 아닌 민간 기관에서 제공하는 서비스입니다.
          본 서비스는 대한민국 정부 또는 국토교통부와 제휴 관계가 없으며,
          정부 기관을 대표하지 않습니다. 본 서비스에서 제공하는 데이터는
          공공데이터포털을 통해 제공되는 공식 데이터를 기반으로 하지만, 데이터의
          정확성이나 완전성에 대해 정부 기관은 어떠한 책임도 지지 않으며, 본
          서비스 제공자도 데이터의 정확성에 대해 보장하지 않습니다.
        </p>
      </>
    ),
  },
  {
    title: '3. 서비스 이용 약관',
    description:
      '본 서비스는 공공데이터포털에서 제공하는 공개 데이터를 활용하여 정보를 제공합니다. 이용자는 제공되는 정보를 참고용으로만 사용하여야 하며, 중요한 의사결정 시에는 공식 정부 사이트에서 직접 확인하시기 바랍니다.',
  },
  {
    title: '4. 개인정보 처리 방침',
    description:
      '개인정보 처리 방침은 개인정보 처리 방침 페이지를 참조하시기 바랍니다.',
  },
  {
    title: '5. 데이터 정확성 및 책임',
    description:
      '본 서비스에서 제공하는 모든 데이터는 공공데이터포털의 공식 데이터를 기반으로 합니다. 다만, 데이터 처리 과정에서 발생할 수 있는 오류나 지연, 또는 공공데이터포털의 데이터 제공 지연 등으로 인한 정보의 부정확성에 대해서는 본 서비스 제공자가 책임을 지지 않습니다. 중요한 거래 결정 시에는 반드시 공식 정부 사이트나 관련 기관을 통해 직접 확인하시기 바랍니다.',
  },
  {
    title: '6. 이용자의 권리',
    description:
      '이용자는 언제든 자신의 개인정보를 조회, 수정, 삭제 요청할 수 있습니다. 문의는 majac6@gmail.com 이메일로 가능합니다.',
  },
  {
    title: '7. 기타',
    description:
      '본 방침은 관련 법령 및 회사 정책에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 안내합니다.',
  },
];

export default function PolicyPage() {
  return (
    <Card className="p-4">
      <ul className="flex flex-col space-y-4">
        {POLICY_LIST.map(item => (
          <li key={item.title}>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <div className="text-sm leading-relaxed">{item.description}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
