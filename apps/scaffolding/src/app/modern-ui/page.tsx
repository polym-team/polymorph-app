import {
  Button,
  Typography,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from "@package/ui";
import Link from "next/link";

export default function ModernUIPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full text-center">
        <Typography
          variant="h1"
          className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          🎨 모던 UI
        </Typography>
        <Typography variant="lead" className="mb-12">
          shadcn/ui와 Tailwind CSS로 아름다운 UI를 구성하세요
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Button Variants */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <Typography variant="h3" className="mb-4">
              버튼 컴포넌트
            </Typography>
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="mb-3 text-left">
                  Variants
                </Typography>
                <div className="space-y-3">
                  <Button className="w-full">Default Button</Button>
                  <Button variant="primary" className="w-full">
                    Primary Button
                  </Button>
                  <Button variant="danger" className="w-full">
                    Danger Button
                  </Button>
                  <Button variant="outline" className="w-full">
                    Outline Button
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Secondary Button
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Ghost Button
                  </Button>
                  <Button variant="link" className="w-full">
                    Link Button
                  </Button>
                </div>
              </div>
              <div>
                <Typography variant="h4" className="mb-3 text-left">
                  Sizes
                </Typography>
                <div className="space-y-3">
                  <Button size="sm" className="w-full">
                    Small Button
                  </Button>
                  <Button size="default" className="w-full">
                    Default Button
                  </Button>
                  <Button size="lg" className="w-full">
                    Large Button
                  </Button>
                  <div className="flex justify-center">
                    <Button size="icon" variant="outline">
                      ⚙️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <Typography variant="h3" className="mb-4">
              컬러 팔레트
            </Typography>
            <div className="space-y-4">
              {/* Primary Colors */}
              <div>
                <Typography variant="h4" className="mb-2 text-left text-sm">
                  Primary Colors
                </Typography>
                <div className="grid grid-cols-6 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Red
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Orange
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Yellow
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Green
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Blue
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Purple
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Extended Colors */}
              <div>
                <Typography variant="h4" className="mb-2 text-left text-sm">
                  Extended Colors
                </Typography>
                <div className="grid grid-cols-6 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Pink
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Indigo
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-teal-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Teal
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Cyan
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Emerald
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-lime-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Lime
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div>
                <Typography variant="h4" className="mb-2 text-left text-sm">
                  Neutral Colors
                </Typography>
                <div className="grid grid-cols-6 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-900 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Gray 900
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Gray 700
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-500 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Gray 500
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Gray 300
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      Gray 100
                    </Typography>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full mb-1"></div>
                    <Typography variant="small" className="text-xs">
                      White
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <Typography variant="h3" className="mb-4">
              타이포그래피
            </Typography>
            <div className="text-left space-y-3">
              <Typography variant="h1">H1 Heading</Typography>
              <Typography variant="h2">H2 Heading</Typography>
              <Typography variant="h3">H3 Heading</Typography>
              <Typography variant="h4">H4 Heading</Typography>
              <Typography variant="lead">Lead text - 중요한 내용</Typography>
              <Typography variant="p">Body text - 일반적인 문단</Typography>
              <Typography variant="large">Large text</Typography>
              <Typography variant="small">Small text</Typography>
              <Typography variant="muted">Muted text - 부가 설명</Typography>
              <Typography variant="code">inline code</Typography>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
          <Typography variant="h3" className="mb-6">
            인터랙티브 요소들
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Typography variant="h4" className="mb-3">
                폼 요소들
              </Typography>
              <div className="space-y-3">
                <Input type="text" placeholder="텍스트 입력" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="옵션 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">옵션 1</SelectItem>
                    <SelectItem value="option2">옵션 2</SelectItem>
                    <SelectItem value="option3">옵션 3</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1">
                    제출
                  </Button>
                  <Button variant="outline" className="flex-1">
                    취소
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Typography variant="h4" className="mb-3">
                카드 & 레이아웃
              </Typography>
              <div className="space-y-4">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg">프로젝트 카드</CardTitle>
                    <CardDescription>
                      shadcn/ui 카드 컴포넌트 예시
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center gap-2 mb-3 flex-wrap">
                      <Badge variant="default">기본</Badge>
                      <Badge variant="secondary">보조</Badge>
                      <Badge variant="danger">위험</Badge>
                      <Badge variant="outline">외곽선</Badge>
                      <Badge variant="success">성공</Badge>
                      <Badge variant="warning">경고</Badge>
                    </div>
                    <Typography variant="small" className="text-gray-600">
                      모던한 UI 컴포넌트로 구성된 카드입니다.
                    </Typography>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      자세히 보기
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Link href="/">
          <Button variant="outline" size="lg">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </main>
  );
}
