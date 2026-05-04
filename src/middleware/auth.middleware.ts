import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/lib/jwt';

export type AuthenticatedRequest = NextRequest & { user: JWTPayload };
type RouteContext = { params: Record<string, string> };
type RouteHandler = (req: AuthenticatedRequest, context: RouteContext) => Promise<Response>;

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, context: RouteContext): Promise<Response> => {
    try {
      const token = extractTokenFromHeader(req.headers.get('authorization'));
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        );
      }
      const payload = verifyToken(token);
      (req as AuthenticatedRequest).user = payload;
      return handler(req as AuthenticatedRequest, context);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

export function withAdmin(handler: RouteHandler) {
  return withAuth(async (req: AuthenticatedRequest, context: RouteContext): Promise<Response> => {
    if (req.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req, context);
  });
}

export function withOptionalAuth(
  handler: (req: NextRequest & { user?: JWTPayload }, context: RouteContext) => Promise<Response>
) {
  return async (req: NextRequest, context: RouteContext): Promise<Response> => {
    try {
      const token = extractTokenFromHeader(req.headers.get('authorization'));
      if (token) {
        const payload = verifyToken(token);
        (req as NextRequest & { user?: JWTPayload }).user = payload;
      }
    } catch { /* continue unauthenticated */ }
    return handler(req as NextRequest & { user?: JWTPayload }, context);
  };
}
