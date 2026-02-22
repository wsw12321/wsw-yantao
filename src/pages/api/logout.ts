// src/pages/api/logout.ts
import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/session';
import { clearSessionCookie, getSessionIdFromCookie } from '../../lib/cookies';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    // 获取当前会话
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);
    
    // 删除数据库中的会话
    if (sessionId) {
      await deleteSession(db, sessionId);
    }
    
    // 清除 Cookie
    return new Response(JSON.stringify({ 
      success: true, 
      message: '已登出' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '登出失败' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};