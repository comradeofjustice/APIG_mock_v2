/**
 * 数据库调试页面
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Select,
  Table,
  Tabs,
  Space,
  message,
  Empty,
  Tag,
  Descriptions,
  Typography,
  Spin,
} from 'antd';
import { PlayCircleOutlined, AlignLeftOutlined } from '@ant-design/icons';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';
import { executeSql, formatSql, initDatabase } from './services';
import { MOCK_DATABASE_CONNECTIONS } from './mockData';
import type { SqlExecutionResult } from './types';

const { Text } = Typography;

interface DatabaseDebugPageProps {
  databaseId?: string;
  mode?: string;
}

export default function DatabaseDebugPage({
  databaseId,
}: DatabaseDebugPageProps) {
  // ===== 状态管理 =====
  const [selectedDatabase, setSelectedDatabase] = useState<string>(databaseId || 'db_001');
  const [sql, setSql] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<SqlExecutionResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'result' | 'logs'>('result');
  const [dbInitializing, setDbInitializing] = useState(true);

  // ===== 初始化数据库 =====
  useEffect(() => {
    const initDb = async () => {
      try {
        setDbInitializing(true);
        await initDatabase();
        setDbInitializing(false);
        message.success('数据库初始化完成');
      } catch (error) {
        setDbInitializing(false);
        message.error('数据库初始化失败');
        console.error('数据库初始化失败:', error);
      }
    };

    initDb();
  }, []);

  // ===== 执行 SQL =====
  const handleExecuteSql = useCallback(async () => {
    if (!sql.trim()) {
      message.warning('请输入 SQL 语句');
      return;
    }

    setExecuting(true);
    try {
      const result = await executeSql({
        databaseId: selectedDatabase,
        sql,
      });

      setExecutionResult(result);

      // 自动切换到对应 Tab
      if (result.success) {
        setActiveResultTab('result');
        message.success(`执行成功,耗时 ${result.duration}ms`);
      } else {
        message.error('SQL 执行失败');
      }
    } catch {
      message.error('请求失败');
    } finally {
      setExecuting(false);
    }
  }, [sql, selectedDatabase]);

  // ===== 格式化 SQL =====
  const handleFormatSql = useCallback(() => {
    if (!sql.trim()) {
      message.warning('请先输入 SQL 语句');
      return;
    }

    try {
      const formatted = formatSql(sql);
      setSql(formatted);
      message.success('SQL 格式化成功');
    } catch {
      message.error('SQL 格式化失败');
    }
  }, [sql]);

  // ===== 选择数据库 =====
  const handleSelectDatabase = useCallback((dbId: string) => {
    setSelectedDatabase(dbId);
  }, []);

  // ===== 渲染内容 =====
  const renderContent = () => {
    if (dbInitializing) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: 400,
        }}>
          <Spin size="large" tip="数据库初始化中..." />
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 16, flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
        {/* ===== SQL 编辑器区域 ===== */}
        {/* Header: 数据库选择 + 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 200, marginRight: 12 }}>
            <Select
              value={selectedDatabase}
              onChange={handleSelectDatabase}
              style={{ width: '100%' }}
              size="small"
            >
              {MOCK_DATABASE_CONNECTIONS.map(db => (
                <Select.Option key={db.id} value={db.id}>
                  {db.name} ({db.host}:{db.port}/{db.database})
                </Select.Option>
              ))}
            </Select>
          </div>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={executing}
              onClick={handleExecuteSql}
            >
            </Button>
            <Button
              icon={<AlignLeftOutlined />}
              onClick={handleFormatSql}
            >
            </Button>
          </Space>
        </div>

        {/* SQL 输入区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Editor
              value={sql}
              onValueChange={(code: string) => setSql(code)}
              highlight={(code: string) => highlight(code, languages.sql, 'sql')}
              padding={12}
              style={{
                fontFamily: "'Fira code', 'Fira Mono', 'Courier New', Consolas, monospace",
                fontSize: 13,
                lineHeight: 1.6,
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
              }}
              placeholder="请输入 SQL 语句,例如:SELECT * FROM users LIMIT 10"
            />
          </div>
        </div>

        {/* 执行结果 + 日志 Tabs */}
        <div style={{ height: 300 }}>
          <Tabs
            activeKey={activeResultTab}
            onChange={key => setActiveResultTab(key as 'result' | 'logs')}
            size="small"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            tabBarStyle={{ margin: 0, padding: '0 12px' }}
          >
            <Tabs.TabPane tab="执行结果" key="result">
              {executionResult ? (
                <div style={{ padding: 12 }}>
                  {/* 执行信息 */}
                  <Descriptions column={3} size="small" bordered style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="执行状态">
                      <Tag color={executionResult.success ? 'success' : 'error'}>
                        {executionResult.success ? '成功' : '失败'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="执行耗时">
                      {executionResult.duration}ms
                    </Descriptions.Item>
                    <Descriptions.Item label="影响行数">
                      {executionResult.affectedRows || 0}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 数据表格 */}
                  {executionResult.data && executionResult.data.length > 0 ? (
                    <Table
                      size="small"
                      dataSource={executionResult.data}
                      rowKey={(_, index) => index?.toString() || '0'}
                      pagination={{ pageSize: 10, size: 'small' }}
                      columns={executionResult.columns?.map(col => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                        ellipsis: true,
                        render: (text: any) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(text)}</span>,
                      })) || []}
                      scroll={{ x: 'max-content' }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={executionResult.success ? '查询无数据' : '执行失败'}
                    />
                  )}

                  {/* 错误信息 */}
                  {executionResult.error && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong style={{ color: '#F53C3C', marginBottom: 8, display: 'block' }}>
                        错误信息
                      </Text>
                      <div style={{
                        padding: 12,
                        background: '#FFF1F0',
                        border: '1px solid #FFA39E',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: '#F53C3C',
                      }}>
                        {executionResult.error}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="执行 SQL 后查看结果"
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab="执行日志" key="logs">
              {executionResult && executionResult.logs.length > 0 ? (
                <div>
                  {executionResult.logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 12px',
                        marginBottom: 8,
                        background: log.includes('ERROR') ? '#FFF1F0' : '#FAFAFA',
                        border: log.includes('ERROR') ? '1px solid #FFA39E' : '1px solid #EDEEF5',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: log.includes('ERROR') ? '#F53C3C' : '#454652',
                      }}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无日志"
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 0 }}>
      {renderContent()}
    </div>
  );
}
