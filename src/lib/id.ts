/** Short, collision-free-enough ids. `crypto.randomUUID` needs a secure context. */
export function createId(prefix = ''): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  let out = ''
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0')
  return prefix ? `${prefix}_${out}` : out
}
