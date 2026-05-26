/**
 * 数据库服务 - API 服务层
 * 使用 sql.js 在前端直接执行 SQL
 */

import { format } from 'sql-formatter';
import initSqlJs, { Database } from 'sql.js';
import { SqlDebugRequest, SqlExecutionResult } from './types';

// 全局数据库实例
let db: Database | null = null;

/**
 * 初始化数据库
 */
export const initDatabase = async (): Promise<void> => {
  if (db) return; // 已初始化

  const SQL = await initSqlJs({
    // 使用 CDN 加载 wasm 文件
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  db = new SQL.Database();
  
  // 创建示例表和数据
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 插入示例数据
  db.run(`INSERT OR IGNORE INTO users (id, name, email, status, created_at) VALUES 
    (1, '张三', 'zhangsan@example.com', 'active', '2024-01-01 10:00:00'),
    (2, '李四', 'lisi@example.com', 'active', '2024-01-02 11:30:00'),
    (3, '王五', 'wangwu@example.com', 'inactive', '2024-01-03 14:20:00'),
    (4, '赵六', 'zhaoliu@example.com', 'active', '2024-01-04 09:15:00')
  `);
  
  console.log('数据库初始化完成');
};

/**
 * 执行 SQL(使用 sql.js 在前端执行)
 * @param request SQL 调试请求
 */
export const executeSql = async (request: SqlDebugRequest): Promise<SqlExecutionResult> => {
  // 确保数据库已初始化
  await initDatabase();
  
  if (!db) {
    throw new Error('数据库未初始化');
  }

  const startTime = Date.now();
  const logs: string[] = [];
  
  try {
    logs.push(`[INFO] ${new Date().toISOString()} - SQL解析完成`);
    logs.push(`[INFO] ${new Date().toISOString()} - 开始执行查询`);
    
    // 执行 SQL
    const results = db.exec(request.sql);
    
    const duration = Date.now() - startTime;
    logs.push(`[INFO] ${new Date().toISOString()} - 查询完成,耗时 ${duration}ms`);
    
    // 处理查询结果
    if (results.length > 0 && results[0].columns.length > 0) {
      // SELECT 查询,有返回数据
      const columns = results[0].columns;
      const values = results[0].values;
      
      // 转换为对象数组
      const data = values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return obj;
      });
      
      logs.push(`[INFO] ${new Date().toISOString()} - 返回 ${data.length} 条记录`);
      
      return {
        success: true,
        columns,
        data,
        affectedRows: data.length,
        duration,
        logs,
      };
    } else {
      // INSERT/UPDATE/DELETE 等操作,无返回数据
      const changes = db.getRowsModified();
      logs.push(`[INFO] ${new Date().toISOString()} - 执行成功,影响 ${changes} 行`);
      
      return {
        success: true,
        affectedRows: changes,
        duration,
        logs,
      };
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`[ERROR] ${new Date().toISOString()} - 执行失败: ${error.message}`);
    
    return {
      success: false,
      duration,
      logs,
      error: error.message,
    };
  }
};

/**
 * SQL 格式化(使用 sql-formatter)
 * @param sql SQL 语句
 */
export const formatSql = (sql: string): string => {
  try {
    return format(sql, { 
      language: 'sql',
      tabWidth: 2,
      keywordCase: 'upper',
    });
  } catch (error) {
    console.error('SQL 格式化失败:', error);
    throw error;
  }
};

/**
 * 获取数据库实例(用于高级操作)
 */
export const getDatabase = (): Database | null => {
  return db;
};

/**
 * 重置数据库
 */
export const resetDatabase = async (): Promise<void> => {
  if (db) {
    db.close();
    db = null;
  }
  await initDatabase();
};
