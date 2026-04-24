/**
 * 审批详情抽屉组件
 * 
 * 功能：
 * - 审批实例信息
 * - 审批流程总览
 * - 变更内容对比
 * - 审批时间线
 * - 审批记录
 */

import { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Table,
  Spin,
  Card,
  Divider,
} from 'antd';
import type { TaskDetailResponse } from '../types';
import { APPROVAL_STATUS_MAP } from '../constants';
import { getTaskDetail } from '../services';
import { userNameMap } from '../mockData';
import ApprovalFlowChart from './ApprovalFlowChart';

interface ApprovalDetailDrawerProps {
  visible: boolean;
  taskId?: number;
  loading?: boolean;
  onClose: () => void;
  /** 抽屉宽度，默认 640 */
  width?: number | string;
}

export default function ApprovalDetailDrawer({
  visible,
  taskId,
  loading = false,
  onClose,
  width = '55%',
}: ApprovalDetailDrawerProps) {
  const [detail, setDetail] = useState<TaskDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 变更内容同步滚动
  const beforeRef = useRef<HTMLPreElement>(null);
  const afterRef = useRef<HTMLPreElement>(null);
  const isSyncingScroll = useRef(false);

  const handleSyncScroll = (source: 'before' | 'after') => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    const sourceEl = source === 'before' ? beforeRef.current : afterRef.current;
    const targetEl = source === 'before' ? afterRef.current : beforeRef.current;
    if (sourceEl && targetEl) {
      targetEl.scrollTop = sourceEl.scrollTop;
      targetEl.scrollLeft = sourceEl.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // 加载详情
  useEffect(() => {
    if (visible && taskId) {
      setDetailLoading(true);
      getTaskDetail(taskId)
        .then(data => {
          setDetail(data);
        })
        .catch(() => {
          // TODO: 错误处理
        })
        .finally(() => {
          setDetailLoading(false);
        });
    }
  }, [visible, taskId]);

  // 渲染状态标签
  const renderStatusTag = (status: keyof typeof APPROVAL_STATUS_MAP) => {
    const config = APPROVAL_STATUS_MAP[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 渲染变更对比
  const renderChangeDiff = () => {
    if (!detail?.changeSnapshot) return null;
    
    const { beforeData, afterData } = detail.changeSnapshot;
    const beforeText = beforeData ? JSON.stringify(beforeData, null, 2) : '-';
    const afterText = afterData ? JSON.stringify(afterData, null, 2) : '-';
    
    const codeBlockStyle: React.CSSProperties = {
      margin: 0,
      padding: 12,
      background: '#1e1e1e',
      color: '#d4d4d4',
      borderRadius: 6,
      fontSize: 12,
      lineHeight: 1.6,
      overflow: 'auto',
      maxHeight: 300,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      flex: '1 1 0%',
      minHeight: 0,
    };

    const titleStyle: React.CSSProperties = {
      fontWeight: 500,
      marginBottom: 4,
      fontSize: 12,
      color: '#aaa',
    };
    
    return (
      <Card size="small" title="变更内容">
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={titleStyle}>
              变更前
            </div>
            <pre
              ref={beforeRef}
              onScroll={() => handleSyncScroll('before')}
              style={codeBlockStyle}
            >
              {beforeText}
            </pre>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={titleStyle}>
              变更后
            </div>
            <pre
              ref={afterRef}
              onScroll={() => handleSyncScroll('after')}
              style={codeBlockStyle}
            >
              {afterText}
            </pre>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染审批流程
  const renderApprovalFlow = () => {
    if (!detail?.approvalFlow) return null;
    
    return (
      <Card size="small" title="审批流程">
        <ApprovalFlowChart
          approvalFlow={detail.approvalFlow}
          levelStatusMap={detail.levelStatusMap}
          timeline={detail.timeline}
          currentLevel={detail.currentLevel}
          userNameMap={userNameMap}
          height={260}
        />
      </Card>
    );
  };

  // 渲染审批记录
  const renderRecords = () => {
    if (!detail?.records || detail.records.length === 0) return null;
    
    return (
      <Card size="small" title="审批记录">
        <Table
          size="small"
          dataSource={detail.records}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '审批人',
              dataIndex: 'approverName',
              key: 'approverName',
              render: (name: string, record: any) => name || record.approverId,
            },
            {
              title: '结果',
              dataIndex: 'action',
              key: 'action',
              render: (action: string) => {
                const color = action === 'approve' ? 'success' :
                            action === 'reject' ? 'error' : 'default';
                const text = action === 'approve' ? '通过' :
                            action === 'reject' ? '拒绝' : '撤回';
                return <Tag color={color}>{text}</Tag>;
              },
            },
            {
              title: '意见',
              dataIndex: 'opinion',
              key: 'opinion',
              ellipsis: true,
            },
            {
              title: '时间',
              dataIndex: 'createTime',
              key: 'createTime',
              render: (time: number) => new Date(time).toLocaleString(),
            },
          ]}
        />
      </Card>
    );
  };

  return (
    <Drawer
      title="审批详情"
      placement="right"
      width={width}
      visible={visible}
      onClose={onClose}
    >
      <Spin spinning={detailLoading || loading}>
        {detail ? (
          <>
            <Descriptions
              title="基本信息"
              column={2}
              bordered
              size="small"
            >
              <Descriptions.Item label="审批ID">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {renderStatusTag(detail.status)}
              </Descriptions.Item>
              <Descriptions.Item label="业务模块">
                {detail.moduleName}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                {detail.operationName}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {detail.applicantName}
              </Descriptions.Item>
              <Descriptions.Item label="当前层级">
                第{detail.currentLevel}级 / 共{detail.totalLevels}级
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(detail.createTime).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {renderChangeDiff()}

            <Divider />

            {renderApprovalFlow()}

            { detail?.records?.length > 0 && <Divider />}

            {renderRecords()}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}>
            点击查看详情
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
