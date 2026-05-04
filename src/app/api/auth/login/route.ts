import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { login } from '@/services/auth.service';
import { errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const result = await login(email, password);

    // ✅ Set cookie server-side so Next.js middleware can read it
    const response = NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );

    response.cookies.set('auth_token', result.token, {
      httpOnly: false, // false so client JS (useAuth) can also read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    const status = message.includes('Invalid credentials') ? 401 : 500;
    return errorResponse(message, status);
  }
}