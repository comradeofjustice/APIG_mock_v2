/**
 * 数据库服务 - Mock 数据
 */

import { SqlExecutionResult, SqlHistoryItem, DatabaseConnectionNode } from './types';

/** 模拟数据库连接列表 */
export const MOCK_DATABASE_CONNECTIONS: DatabaseConnectionNode[] = [
  {
    id: 'db_001',
    name: '生产数据库',
    type: 'database',
    host: '192.168.1.100',
    port: 3306,
    database: 'production_db',
  },
  {
    id: 'db_002',
    name: '测试数据库',
    type: 'database',
    host: '192.168.1.101',
    port: 3306,
    database: 'test_db',
  },
  {
    id: 'db_003',
    name: '开发数据库',
    type: 'database',
    host: 'localhost',
    port: 3306,
    database: 'dev_db',
  },
];

/** 模拟 SQL 执行历史记录 */
export const MOCK_SQL_HISTORY: SqlHistoryItem[] = [
  {
    id: 'history_001',
    sql: 'SELECT * FROM users WHERE status = "active" LIMIT 10',
    databaseId: 'db_001',
    executedAt: '2024-01-15 10:30:00',
    success: true,
    duration: 120,
  },
  {
    id: 'history_002',
    sql: 'UPDATE users SET status = "inactive" WHERE last_login < "2023-01-01"',
    databaseId: 'db_001',
    executedAt: '2024-01-15 10:25:00',
    success: true,
    duration: 85,
  },
  {
    id: 'history_003',
    sql: 'SELECT * FROM non_existent_table',
    databaseId: 'db_002',
    executedAt: '2024-01-15 10:20:00',
    success: false,
    duration: 15,
  },
];

/**
 * 模拟 SQL 执行
 * @param sql SQL 语句
 * @param databaseId 数据库 ID
 */
export const mockSqlExecution = (sql: string, databaseId?: string): SqlExecutionResult => {
  const trimmedSql = sql.trim().toUpperCase();
  
  // 模拟 SELECT 查询
  if (trimmedSql.startsWith('SELECT')) {
    return {
      success: true,
      columns: ['id', 'name', 'email', 'status', 'created_at'],
      data: [
        { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active', created_at: '2024-01-01 10:00:00' },
        { id: 2, name: '李四', email: 'lisi@example.com', status: 'active', created_at: '2024-01-02 11:30:00' },
        { id: 3, name: '王五', email: 'wangwu@example.com', status: 'inactive', created_at: '2024-01-03 14:20:00' },
        { id: 4, name: '赵六', email: 'zhaoliu@example.com', status: 'active', created_at: '2024-01-04 09:15:00' },
      ],
      affectedRows: 4,
      duration: Math.floor(Math.random() * 200) + 50,
      logs: [
        `[INFO] ${new Date().toISOString()} - SQL解析完成`,
        `[INFO] ${new Date().toISOString()} - 开始执行查询`,
        `[INFO] ${new Date().toISOString()} - 查询优化器执行`,
        `[INFO] ${new Date().toISOString()} - 查询完成,返回4条记录`,
      ],
    };
  }
  
  // 模拟 INSERT/UPDATE/DELETE 操作
  if (trimmedSql.startsWith('INSERT') || trimmedSql.startsWith('UPDATE') || trimmedSql.startsWith('DELETE')) {
    const affectedRows = Math.floor(Math.random() * 10) + 1;
    return {
      success: true,
      affectedRows,
      duration: Math.floor(Math.random() * 100) + 20,
      logs: [
        `[INFO] ${new Date().toISOString()} - SQL解析完成`,
        `[INFO] ${new Date().toISOString()} - 开始执行操作`,
        `[INFO] ${new Date().toISOString()} - 执行成功,影响${affectedRows}行`,
      ],
    };
  }
  
  // 模拟错误情况
  if (trimmedSql.includes('ERROR') || trimmedSql.includes('非存在')) {
    return {
      success: false,
      duration: Math.floor(Math.random() * 50) + 10,
      logs: [
        `[INFO] ${new Date().toISOString()} - SQL解析完成`,
        `[ERROR] ${new Date().toISOString()} - 执行失败`,
      ],
      error: 'SQL语法错误或表不存在: Table \'non_existent_table\' doesn\'t exist',
    };
  }
  
  // 默认成功响应
  return {
    success: true,
    duration: Math.floor(Math.random() * 100) + 30,
    logs: [
      `[INFO] ${new Date().toISOString()} - SQL解析完成`,
      `[INFO] ${new Date().toISOString()} - 执行成功`,
    ],
  };
};
