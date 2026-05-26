/**
 * 数据库服务 - 类型定义
 */

/** SQL调试请求 */
export interface SqlDebugRequest {
  databaseId: string;      // 数据库ID
  sql: string;             // SQL语句
}

/** SQL执行结果 */
export interface SqlExecutionResult {
  success: boolean;
  data?: any[];            // 查询结果数据
  columns?: string[];      // 列名
  affectedRows?: number;   // 影响行数(SELECT时为返回行数)
  duration: number;        // 执行耗时(ms)
  logs: string[];          // 执行日志
  error?: string;          // 错误信息
}

/** SQL历史记录项 */
export interface SqlHistoryItem {
  id: string;
  sql: string;
  databaseId: string;
  executedAt: string;
  success: boolean;
  duration: number;
}

/** 数据库连接节点 */
export interface DatabaseConnectionNode {
  id: string;
  name: string;
  type: 'database';
  host?: string;
  port?: number;
  database?: string;
}
