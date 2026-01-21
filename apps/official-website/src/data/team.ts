export const team = {
  name: 'Polymorph',
  tagline: '기술로 비즈니스의 형태를 바꾸다',
  description:
    'LG, 아모레퍼시픽, 배민 출신 시니어 개발자들이 만든 팀. 10년 이상의 실전 경험을 바탕으로, 복잡한 문제를 명쾌하게 해결합니다.',
  founded: '2018',
};

export const values = [
  {
    title: '검증된 전문성',
    description:
      '대기업과 빅테크에서 쌓은 실무 경험. 수많은 프로젝트를 통해 검증된 기술력으로 최적의 솔루션을 설계합니다.',
    icon: 'shield',
  },
  {
    title: '근본적인 문제 해결',
    description:
      '표면적 증상이 아닌 근본 원인을 파악합니다. 깊이 있는 분석으로 재발 없는 해결책을 제시합니다.',
    icon: 'target',
  },
  {
    title: '명확한 커뮤니케이션',
    description:
      '기술적 복잡함을 명확한 언어로 전달합니다. 진행 상황과 이슈를 투명하게 공유합니다.',
    icon: 'chat',
  },
];

export const services = [
  {
    title: '웹/앱 개발',
    description:
      'React, Vue, Express, Nestjs 등 모던 스택 기반의 확장 가능한 애플리케이션을 구축합니다.',
    technologies: ['React', 'Vue', 'Next.js', 'Node.js', 'TypeScript'],
  },
  {
    title: '레거시 시스템 개선',
    description:
      '성능 병목 분석, 코드 리팩토링, 아키텍처 현대화로 기존 시스템의 가치를 높입니다.',
    technologies: ['Performance', 'Refactoring', 'Architecture'],
  },
  {
    title: '기술 컨설팅',
    description:
      '프로젝트 초기 설계부터 기술 스택 선정, 개발 프로세스 구축까지 함께합니다.',
    technologies: ['Strategy', 'Planning', 'Process'],
  },
];

export type Platform = 'web' | 'ios' | 'android' | 'cross-platform';

export interface App {
  name: string;
  description: string;
  icon?: string;
  url: string;
  platforms: Platform[];
  history?: string[];
}

export const apps: App[] = [
  {
    name: '크림 오피스',
    description: 'Kream(크림) Sold-out(솔드아웃) 리셀러들을 위한 재고 및 배송관리 서비스',
    url: 'https://kream-office.polymorph.co.kr/',
    platforms: ['web'],
    history: ['2025년 6월: WEB 서비스 런칭(1.0.0)'],
  },
  {
    name: '집사요',
    description: '진짜 실거래가 기반 부동산 정보 서비스',
    icon: '/apps/jibsayo-logo.png',
    url: 'https://jibsayo.polymorph.co.kr/',
    platforms: ['web'],
    history: ['2026년 1월: WEB 서비스 런칭(1.0.0) 서울/경기 지역 대상 오픈'],
  },
  {
    name: '북마크 공유',
    description: 'GitHub Organization 기반 팀 북마크 공유 서비스. 새 멤버 온보딩에 필요한 링크와 권한 정보를 체계적으로 관리.',
    url: 'https://bookmark-share.polymorph.co.kr/',
    platforms: ['web'],
    history: ['2026년 1월: WEB 서비스 런칭(1.0.0)'],
  },
];

export interface Member {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
}

export const members: Member[] = [
  {
    name: '임흥선',
    role: 'Tech Lead',
    bio: '대기업 출신. 전체적인 구조를 설계하고 프로젝트 총괄.',
    avatar:
      'https://gravatar.com/avatar/41b0c59cf3ffbf6c9941073e7f0bfe9984723a615246b24ca4c05da353b8c2ae?size=256',
  },
  {
    name: '박**',
    role: 'Senior Engineer',
    bio: '빅테크 출신. 대규모 트래픽 처리와 시스템 안정화 전문.',
  },
  {
    name: '최**',
    role: 'Senior Engineer',
    bio: '대기업 출신. 전자상거래/커머스 플랫폼 개발 및 운영 전문가.',
  },
];

export interface Project {
  name: string;
  description: string[];
  techStack: string[];
}

export const projects: Project[] = [
  {
    name: 'ASICS Korea 매장 POS 시스템 최적화',
    description: [
      '레거시 코드 분석 및 성능 병목 구간 식별, 응답 속도 10배 개선',
      'React 컴포넌트 구조 개선으로 렌더링 이슈 해결',
      '운영팀 대상 기술 문서화 및 교육 진행',
      '4년간 안정적인 유지보수 운영 (2019-2023)',
    ],
    techStack: ['React', 'jQuery', 'JSP'],
  },
  {
    name: 'Twinkling 커머스 플랫폼 구축',
    description: [
      '주문제작 귀금속 비즈니스를 위한 백오피스 시스템 개발',
      '베트남 시장 진출을 위한 현지화 쇼핑몰 구축',
      '내부 운영팀 기술 역량 강화 교육',
    ],
    techStack: ['Angular', 'Laravel', 'PHP'],
  },
];

export const contact = {
  email: 'majac6@gmail.com',
};

// Tech stack for decoration
export const techStack = [
  'TypeScript',
  'React',
  'Next.js',
  'Vue',
  'Node.js',
  'NestJS',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'AWS',
  'GCP',
];
