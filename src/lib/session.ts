// src/lib/session.ts

// 生成随机会话 ID
export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// 创建新会话
export async function createSession(db: any, userId: number): Promise<string> {
  const sessionId = generateSessionId();
  
  // 会话有效期：7天
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, userId, expiresAt.toISOString()).run();
  
  return sessionId;
}

// 验证会话
export async function validateSession(db: any, sessionId: string) {
  const result = await db.prepare(
    `SELECT sessions.*, users.username, users.email 
     FROM sessions 
     JOIN users ON sessions.user_id = users.id 
     WHERE sessions.id = ? AND sessions.expires_at > datetime('now')`
  ).bind(sessionId).first();
  
  return result;
}

// 删除会话（登出）
export async function deleteSession(db: any, sessionId: string) {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}