import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { signup } from '@/services/auth.service';
import { errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;
    const result = await signup(name, email, password);

    // ✅ Set cookie server-side so Next.js middleware can read it
    const response = NextResponse.json(
      { success: true, data: result },
      { status: 201 }
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
    const message = err instanceof Error ? err.message : 'Signup failed';
    const status = message.includes('already registered') ? 409 : 500;
    return errorResponse(message, status);
  }
}