import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(3, '60 s') });

export async function middleware(req: NextRequest) {
  if (req.method === 'POST') {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`rl_${ip}`);
    if (!success) return new NextResponse("Edge Rate Limit Exceeded", { status: 429 });
  }
  return NextResponse.next();
}
