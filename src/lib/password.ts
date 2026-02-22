// src/lib/password.ts

// 简单的密码哈希实现，适用于 Cloudflare Workers 环境
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // 生成随机盐值（16字节）
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // 将密码和盐值组合
  const passwordData = encoder.encode(password);
  const combined = new Uint8Array(salt.length + passwordData.length);
  combined.set(salt);
  combined.set(passwordData, salt.length);
  
  // 使用 SHA-256 哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashArray = new Uint8Array(hashBuffer);
  
  // 将盐值和哈希值组合，转为 Base64 存储
  const result = new Uint8Array(salt.length + hashArray.length);
  result.set(salt);
  result.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...result));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // 从存储的哈希中提取盐值
  const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const originalHash = combined.slice(16);
  
  // 用相同的盐值哈希输入的密码
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltedPassword = new Uint8Array(salt.length + passwordData.length);
  saltedPassword.set(salt);
  saltedPassword.set(passwordData, salt.length);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hashArray = new Uint8Array(hashBuffer);
  
  // 比较两个哈希值
  if (originalHash.length !== hashArray.length) return false;
  for (let i = 0; i < originalHash.length; i++) {
    if (originalHash[i] !== hashArray[i]) return false;
  }
  return true;
}