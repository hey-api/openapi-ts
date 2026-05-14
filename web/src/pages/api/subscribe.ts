import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const { error } = await resend.contacts.create({
    email,
    segments: [
      {
        id: '0bec1178-c5a2-46fb-8b26-f9baf0890c27', // Python
      },
    ],
    unsubscribed: false,
  });

  if (error) {
    if (error.statusCode === 409) {
      return new Response(null, { status: 200 });
    }
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'Failed to subscribe' }), { status: 500 });
  }

  return new Response(null, { status: 200 });
};
