/** Unicode LRI / PDI — isolate LTR tokens inside RTL Hebrew copy */
const LRI = "\u2066";
const PDI = "\u2069";

export function isolateLtr(value: string | number): string {
  const text = String(value ?? "");
  if (!text) return text;
  return `${LRI}${text}${PDI}`;
}

export function isolatePhone(phone: string): string {
  return isolateLtr(phone.replace(/\s+/g, " ").trim());
}

export function isolateUrl(url: string): string {
  return isolateLtr(url.trim());
}

export function isolateHashtag(tag: string): string {
  const normalized = tag.startsWith("#") ? tag : `#${tag}`;
  return isolateLtr(normalized);
}

export function isolateHashtags(tags: string[] | undefined): string[] {
  return (tags ?? []).map(isolateHashtag);
}
