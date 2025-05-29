import { Typography } from '@package/ui';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <Typography variant="h1" className="mb-8">
          집사요
        </Typography>
        <Typography variant="lead" className="mb-8">
          집사세요
        </Typography>
      </div>
    </main>
  );
}
