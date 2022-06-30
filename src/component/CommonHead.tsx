export function isObject(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  return true;
}

export function routeTo(src: string) {
  let url = new URL(window.location.href);
  let params = url.searchParams;
  params.set('page', src);
  window.location.href = url.href;
}

export function getRoute() {
  let url = new URL(window.location.href);
  let params = url.searchParams;
  return params.get('page') ?? '/';
}
