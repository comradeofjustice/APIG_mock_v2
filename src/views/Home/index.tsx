import React from 'react';
import { Card, Empty, Spin, Alert, Button, message } from 'antd';

export default function Home() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [empty, setEmpty] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setEmpty(true);
      message.success('模拟加载完成');
    } catch {
      setError('模拟请求失败');
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        minHeight: '100%',
        background: '#f5f6fa',
      }}
    >
      <Card title="模拟首页" extra={<Button onClick={load}>触发加载/空态</Button>}>
        {loading ? (
          <Spin />
        ) : error ? (
          <Alert type="error" message={error} showIcon />
        ) : empty ? (
          <Empty description="暂无数据（模拟空态）" />
        ) : (
          <p>点击右上角按钮体验 Loading / Empty / Feedback（antd4）。</p>
        )}
      </Card>
    </div>
  );
}
