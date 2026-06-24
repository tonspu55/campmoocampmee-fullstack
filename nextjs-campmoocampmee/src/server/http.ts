import { NextRequest, NextResponse } from "next/server";

// Domain/HTTP error thrown from services. handleRoute turns it into a
// JSON `{ error }` response with the given status, so services stay free of
// NextResponse and can be lifted to another runtime (e.g. NestJS) as-is.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// What a route handler may return: a ready NextResponse, or a plain result
// that handleRoute serializes to JSON.
export type RouteResult =
  | NextResponse
  | { status?: number; body: unknown; headers?: HeadersInit };

type Handler<C> = (req: NextRequest, context: C) => Promise<RouteResult>;

// Higher-order wrapper that centralizes error handling for route handlers.
// `fallbackError` is the message used for unexpected (non-ApiError) 500s, so
// each route keeps its original Thai error text.
export function handleRoute<C = unknown>(
  fn: Handler<C>,
  fallbackError = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
) {
  return async (req: NextRequest, context: C): Promise<NextResponse> => {
    try {
      const result = await fn(req, context);
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result.body, {
        status: result.status ?? 200,
        ...(result.headers ? { headers: result.headers } : {}),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: fallbackError }, { status: 500 });
    }
  };
}
