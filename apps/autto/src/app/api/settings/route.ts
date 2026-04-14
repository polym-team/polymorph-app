import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

// 내 계정 목록 조회
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const accounts = await prisma.dhAccount.findMany({
    where: { userId: user!.id },
    select: {
      id: true,
      dhlotteryId: true,
      nickname: true,
      autoEnabled: true,
      presets: {
        orderBy: { slot: 'asc' },
        select: { id: true, slot: true, mode: true, numbers: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(accounts);
}

// 계정 추가
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json() as {
    dhlotteryId: string;
    dhlotteryPw: string;
    nickname?: string;
  };

  if (!body.dhlotteryId || !body.dhlotteryPw) {
    return NextResponse.json({ error: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const account = await prisma.dhAccount.create({
    data: {
      userId: user!.id,
      dhlotteryId: body.dhlotteryId,
      dhlotteryPwEnc: encrypt(body.dhlotteryPw),
      nickname: body.nickname || body.dhlotteryId,
      presets: {
        createMany: {
          data: [
            { slot: 'A', mode: 'auto' },
            { slot: 'B', mode: 'auto' },
            { slot: 'C', mode: 'auto' },
            { slot: 'D', mode: 'auto' },
            { slot: 'E', mode: 'auto' },
          ],
        },
      },
    },
    include: { presets: true },
  });

  return NextResponse.json(account, { status: 201 });
}

// 계정 수정 (자동구매 토글, 프리셋 변경)
export async function PUT(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json() as {
    accountId: number;
    autoEnabled?: boolean;
    nickname?: string;
    dhlotteryPw?: string;
    presets?: Array<{ slot: string; mode: string; numbers?: string | null }>;
  };

  // 본인 계정 확인
  const account = await prisma.dhAccount.findFirst({
    where: { id: body.accountId, userId: user!.id },
  });
  if (!account) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  // 계정 정보 업데이트
  const updateData: Record<string, unknown> = {};
  if (body.autoEnabled !== undefined) updateData.autoEnabled = body.autoEnabled;
  if (body.nickname !== undefined) updateData.nickname = body.nickname;
  if (body.dhlotteryPw) updateData.dhlotteryPwEnc = encrypt(body.dhlotteryPw);

  if (Object.keys(updateData).length > 0) {
    await prisma.dhAccount.update({
      where: { id: body.accountId },
      data: updateData,
    });
  }

  // 프리셋 업데이트
  if (body.presets) {
    for (const preset of body.presets) {
      await prisma.lottoPreset.upsert({
        where: { accountId_slot: { accountId: body.accountId, slot: preset.slot } },
        update: { mode: preset.mode, numbers: preset.numbers ?? null },
        create: {
          accountId: body.accountId,
          slot: preset.slot,
          mode: preset.mode,
          numbers: preset.numbers ?? null,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}

// 계정 삭제
export async function DELETE(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const accountId = Number(searchParams.get('accountId'));

  const account = await prisma.dhAccount.findFirst({
    where: { id: accountId, userId: user!.id },
  });
  if (!account) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  await prisma.dhAccount.delete({ where: { id: accountId } });

  return NextResponse.json({ success: true });
}
