export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    message: string;
    code: string;
  };
}

export function ok<T>(data: T): ApiSuccessResponse<T> {
  return {
    ok: true,
    data
  };
}
