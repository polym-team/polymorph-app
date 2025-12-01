import { ROUTE_PATH_LABEL } from '@/shared/consts/route';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageLayout } from '@/wigets/ui/page-layout/PageLayout';

const PRIVACY_LIST = [
  {
    title: '1. 수집하는 개인정보 항목',
    description:
      '기기식별정보(푸시토큰, 단말기 OS 정보 등): 푸시 알림 발송 및 서비스 알림 제공을 위함',
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    description: '회원 식별 및 서비스 제공, 문의 응대, 서비스 개선 등',
  },
  {
    title: '3. 개인정보의 보관 및 파기',
    description:
      '회원 탈퇴 시 즉시 파기하며, 관련 법령에 따라 일정 기간 보관이 필요할 경우 해당 기간 동안 안전하게 보관 후 파기합니다.',
  },
  {
    title: '4. 개인정보의 제3자 제공',
    description:
      '원칙적으로 이용자의 개인정보를 외부에 제공하지 않으며, 법령에 의거한 경우에만 예외적으로 제공될 수 있습니다.',
  },
  {
    title: '5. 개인정보의 안전성 확보 조치',
    description:
      '데이터 암호화, 접근 권한 관리 등 안전한 처리를 위해 최선을 다하고 있습니다.',
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

export default function PrivacyPage() {
  return (
    <PageLayout showBackButton>
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-xl">{ROUTE_PATH_LABEL.PRIVACY}</h1>
        </div>
        <ul className="flex flex-col space-y-4">
          {PRIVACY_LIST.map(item => (
            <li key={item.title} className="flex flex-col gap-y-2">
              <h3>{item.title}</h3>
              <p className="text-sm leading-6 text-gray-500">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </PageLayout>
  );
}
