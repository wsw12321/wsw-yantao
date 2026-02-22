// src/pages/api/register.ts
import type { APIRoute } from 'astro';
import { hashPassword } from '../../lib/password';
import { createSession } from '../../lib/session';
import { setSessionCookie } from '../../lib/cookies';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. 获取数据库连接
    const db = locals.runtime.env.DB;
    
    // 2. 获取用户提交的数据
    const formData = await request.formData();
    const username = formData.get('username')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();
    
    // 3. 验证数据
    if (!username || !email || !password || !confirmPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '所有字段都必须填写' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (password.length < 6) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '密码至少需要6个字符' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '两次输入的密码不一致' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 4. 检查用户名/邮箱是否已存在
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).bind(username, email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '用户名或邮箱已被注册' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 5. 加密密码
    const passwordHash = await hashPassword(password);
    
    // 6. 存入数据库
    const result = await db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).bind(username, email, passwordHash).run();
    
    // 7. 创建会话
    const userId = result.meta.last_row_id;
    const sessionId = await createSession(db, userId as number);
    
    // 8. 返回成功响应，设置 Cookie
    return new Response(JSON.stringify({ 
      success: true, 
      message: '注册成功！' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setSessionCookie(sessionId),
      },
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误，请稍后再试' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};