export async function subscribeEmail(email: string): Promise<void> {
  const res = await fetch('/api/subscribe', {
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!res.ok) throw new Error('Subscribe failed');
}
