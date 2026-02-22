// src/pages/api/me.ts
import type { APIRoute } from 'astro';
import { validateSession } from '../../lib/session';
import { getSessionIdFromCookie } from '../../lib/cookies';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);
    
    if (!sessionId) {
      return new Response(JSON.stringify({ 
        authenticated: false 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const session = await validateSession(db, sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ 
        authenticated: false 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      authenticated: true,
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      authenticated: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};