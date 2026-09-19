export type APIError = {
  code: string;
  message: string;
};

export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiFailure = {
  data: null;
  error: APIError;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}

export function fail(code: string, message: string): ApiFailure {
  return { data: null, error: { code, message } };
}
