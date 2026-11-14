// API client used by every page. The transport is real HTTP in the app and an
// in-browser simulation in the preview build.
import { send } from '@transport';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(method, url, body) {
  const { ok, status, data } = await send(method, url, body);
  if (!ok) throw new ApiError(data.error || `Request failed (${status})`, status, data);
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  patch: (url, body) => request('PATCH', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
};
