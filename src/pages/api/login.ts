// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { verifyPassword } from '../../lib/password';
import { createSession } from '../../lib/session';
import { setSessionCookie } from '../../lib/cookies';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    
    // 1. 获取用户提交的数据
    const formData = await request.formData();
    const username = formData.get('username')?.toString().trim();
    const password = formData.get('password')?.toString();
    
    // 2. 验证数据
    if (!username || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '请填写用户名和密码' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 3. 查找用户
    const user = await db.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).bind(username, username).first() as any;
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '用户名或密码错误' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 4. 验证密码
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '用户名或密码错误' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 5. 创建会话
    const sessionId = await createSession(db, user.id);
    
    // 6. 返回成功
    return new Response(JSON.stringify({ 
      success: true, 
      message: '登录成功！' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(sessionId),
      },
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误，请稍后再试' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};