/**
 * API 调试页面
 *
 * 布局：
 * - 左侧：API 树形列表（服务 -> API）
 * - 中间：请求配置区（域名 / 方法 / Path / Headers / Query / Certificate）
 * - 右侧：文档/结果 Tabs
 */

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  Card,
  Tree,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  message,
  Tabs,
  Divider,
  Typography,
  Empty,
  Descriptions,
  Spin,
} from 'antd';
import {
  SendOutlined,
  ClearOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';
import type { ApiListItem, ApiParamItem, ApiDebugResponse, ApiServiceNode } from './types';
import { queryServices, queryApisByService, sendDebugRequest, getApiDetail } from './services';
import { MOCK_API_LIST, SERVICE_API_MAP } from './mockData';

const { Text } = Typography;

interface ServiceTreeData extends DataNode {
  key: string;
  title: string | ReactNode;
  isLeaf?: boolean;
  serviceId?: string;
  apiData?: ApiListItem;
  isLoading?: boolean;
}

export default function ApiDebugPage() {
  // ===== API 树形列表状态 =====
  const [_services, setServices] = useState<ApiServiceNode[]>([]);
  const [treeData, setTreeData] = useState<ServiceTreeData[]>([]);
  const [selectedApi, setSelectedApi] = useState<ApiListItem | null>(null);
  const [_selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'service' | 'api'>('service');
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  // 记录每个服务已加载的 API 数量和是否还有更多
  const [serviceApiOffset, setServiceApiOffset] = useState<Record<string, number>>({});
  const [_serviceHasMore, setServiceHasMore] = useState<Record<string, boolean>>({});
  // 记录正在加载的服务ID和开始时间
  const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const loadingServiceIdRef = useRef<string | null>(null);
  // 是否显示搜索框(URL没有查询参数时显示)
  const [showSearch, setShowSearch] = useState(true);
    
  // Tree容器ref和动态高度
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(500);

  // ===== 请求配置状态 =====
  const [headers, setHeaders] = useState<ApiParamItem[]>([]);
  const [queryParams, setQueryParams] = useState<ApiParamItem[]>([]);
  const [certificate, setCertificate] = useState('');

  // ===== 文档/结果状态 =====
  const [activeDocTab, setActiveDocTab] = useState<'doc' | 'result'>('doc');
  const [apiDetail, setApiDetail] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<ApiDebugResponse | null>(null);

  // 加载服务列表
  const loadServices = useCallback(async () => {
    setTreeLoading(true);
    try {
      const keyword = searchMode === 'service' ? searchValue : undefined;
      const res = await queryServices(keyword);
      setServices(res.services);
      // 初始化树数据
      const treeNodes: ServiceTreeData[] = res.services.map(svc => ({
        key: svc.id,
        title: svc.name,
        isLeaf: false,
        serviceId: svc.id,
        selectable: false,
        children: [],
      }));
      setTreeData(treeNodes);
    } catch {
      message.error('加载服务列表失败');
    } finally {
      setTreeLoading(false);
    }
  }, [searchMode, searchValue]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // 加载服务下的 API
  const loadServiceApis = useCallback(async (serviceId: string, isLoadMore = false) => {
    // 如果正在加载该服务,则不重复加载
    if (loadingServiceId === serviceId) {
      return;
    }
    
    const currentOffset = isLoadMore ? (serviceApiOffset[serviceId] || 0) : 0;
    
    // 设置加载状态
    if (isLoadMore) {
      setLoadingServiceId(serviceId);
      setLoadingStartTime(Date.now());
      loadingServiceIdRef.current = serviceId;  // 同步更新ref
      
      // 立即更新 treeData 以触发 Tree 重新渲染
      setTreeData(prev => prev.map(node => {
        if (node.key === serviceId && node.children) {
          // 重建 children 数组，让“加载更多”节点根据最新 ref 值重新渲染
          const existingChildren = (node.children as ServiceTreeData[]).filter(
            c => !c.key.toString().endsWith('-load-more')
          );
          
          // 添加新的“加载中”节点
          existingChildren.push({
            key: `${serviceId}-load-more`,
            title: (
              <span style={{ 
                color: '#B9BCC6',
                fontWeight: 500,
                cursor: 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 0',
                gap: '6px'
              }}>
                <Spin size="small" />
                加载中...
              </span>
            ),
            isLeaf: true,
            selectable: false,
            isLoading: true,
            disableCheckbox: true,
          } as ServiceTreeData);
          
          return { ...node, children: existingChildren };
        }
        return node;
      }));
    }
    
    try {
      const keyword = searchMode === 'api' ? searchValue : undefined;
      const res = await queryApisByService(serviceId, {
        keyword,
        offset: currentOffset,
        limit: 200,
      });

      // 更新树数据
      setTreeData(prev => {
        const newTreeData = [...prev];
        const serviceIndex = newTreeData.findIndex(node => node.key === serviceId);
        if (serviceIndex === -1) return prev;

        const serviceNode = { ...newTreeData[serviceIndex] };
        const apiNodes: ServiceTreeData[] = res.apis.map(api => ({
          key: `api-${api.id}`,
          title: (
            <span style={{ 
              display: 'block', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }} title={`${api.apiName} (${api.httpMethod})`}>
              {api.apiName} ({api.httpMethod})
            </span>
          ),
          isLeaf: true,
          apiData: api,
        }));

        // 如果是首次加载，替换 children；如果是加载更多，追加
        let newChildren: ServiceTreeData[];
        if (isLoadMore) {
          // 移除旧的“加载更多”节点
          const existingChildren = ((serviceNode.children || []) as ServiceTreeData[]).filter(
            c => c.key !== `${serviceId}-load-more`
          );
          newChildren = [...existingChildren, ...apiNodes];
        } else {
          newChildren = apiNodes;
        }

        // 如果还有更多数据,添加"加载更多"节点
        if (res.hasMore) {
          // 使用ref获取最新值,避免闭包问题
          const isLoading = loadingServiceIdRef.current === serviceId;
          newChildren.push({
            key: `${serviceId}-load-more`,
            title: (
              <span style={{ 
                color: isLoading ? '#B9BCC6' : '#1677FF',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 0',
                gap: '6px'
              }}>
                {isLoading && <Spin size="small" />}
                {isLoading ? '加载中...' : '加载更多'}
              </span>
            ),
            isLeaf: true,
            selectable: !isLoading,
            isLoading,
            disableCheckbox: true,
          } as ServiceTreeData);
        }

        serviceNode.children = newChildren;
        newTreeData[serviceIndex] = serviceNode;
        return newTreeData;
      });

      // 更新偏移量和 hasMore 状态
      setServiceApiOffset(prev => ({
        ...prev,
        [serviceId]: currentOffset + res.apis.length,
      }));
      setServiceHasMore(prev => ({
        ...prev,
        [serviceId]: res.hasMore,
      }));
    } catch {
      message.error('加载 API 列表失败');
      // 错误时立即清除loading状态
      if (isLoadMore) {
        setLoadingServiceId(null);
        setLoadingStartTime(null);
        loadingServiceIdRef.current = null;
      }
    } finally {
      // 确保最少显示2秒的loading动画
      if (isLoadMore && loadingServiceId === serviceId) {
        const elapsed = Date.now() - (loadingStartTime || 0);
        const remaining = Math.max(0, 2000 - elapsed);
        
        setTimeout(() => {
          setLoadingServiceId(null);
          setLoadingStartTime(null);
          loadingServiceIdRef.current = null;  // 同步清除ref
        }, remaining);
      }
    }
  }, [searchMode, searchValue, serviceApiOffset, loadingServiceId, loadingStartTime]);

  // 树节点展开/收起
  const handleTreeExpand = useCallback(async (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    
    // 检查是否有新展开的服务节点
    for (const key of expandedKeysValue) {
      const keyStr = key.toString();
      if (keyStr.startsWith('svc-') && !treeData.find(n => n.key === keyStr)?.children?.length) {
        await loadServiceApis(keyStr, false);
      }
    }
  }, [treeData, loadServiceApis]);
  
  // 选择 API
  const handleSelectApi = useCallback(async (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length === 0) return;
      
    const selectedNode = info.node as ServiceTreeData;
      
    // 检查是否点击了"加载更多"节点
    if (selectedNode.key.toString().endsWith('-load-more')) {
      const serviceId = selectedNode.key.toString().replace('-load-more', '');
      await loadServiceApis(serviceId, true);
      return;
    }
      
    if (!selectedNode.isLeaf || !selectedNode.apiData) return;
  
    const api = selectedNode.apiData;
    setSelectedApi(api);
    // 从 key 中提取 serviceId (key 格式: api-{apiId})
    const apiId = selectedNode.key.toString().replace('api-', '');
    const matchedService = Object.entries(SERVICE_API_MAP).find(([, ids]) => 
      ids.includes(Number(apiId))
    );
    if (matchedService) {
      setSelectedServiceId(matchedService[0]);
    }
  
    // 获取 API 详情
    try {
      const detail = await getApiDetail(api.id);
      setApiDetail(detail);
    } catch {
      message.error('加载 API 详情失败');
    }
  
    // 填充请求配置
    setHeaders([]);
    setQueryParams([]);
    setCertificate('');
    setResponse(null);
  }, [loadServiceApis]);
  
  // 树节点选择处理 - 一级节点点击触发展开/收起
  const handleTreeSelect = useCallback((selectedKeys: React.Key[], info: any) => {
    const selectedNode = info.node as ServiceTreeData;
      
    // 一级节点(服务)不可选,点击触发展开/收起
    if (!selectedNode.isLeaf && selectedNode.key.toString().startsWith('svc-')) {
      // 切换展开/收起状态
      if (expandedKeys.includes(selectedNode.key)) {
        setExpandedKeys(expandedKeys.filter(k => k !== selectedNode.key));
      } else {
        setExpandedKeys([...expandedKeys, selectedNode.key]);
        // 如果是首次展开,加载API列表
        if (!selectedNode.children?.length) {
          loadServiceApis(selectedNode.key.toString(), false);
        }
      }
      return;
    }
      
    // 否则调用原有的选择逻辑
    handleSelectApi(selectedKeys, info);
  }, [expandedKeys, loadServiceApis, handleSelectApi]);

  // 搜索处理
  const handleSearch = useCallback(() => {
    if (searchMode === 'service') {
      loadServices();
    } else {
      // 搜索 API：重新加载所有已展开的服务的 API
      for (const key of expandedKeys) {
        const keyStr = key.toString();
        if (keyStr.startsWith('svc-')) {
          loadServiceApis(keyStr, false);
        }
      }
    }
  }, [searchMode, expandedKeys, loadServices, loadServiceApis]);

  // 切换搜索模式
  const handleToggleSearchMode = useCallback((mode: 'service' | 'api') => {
    setSearchMode(mode);
    setSearchValue('');
  }, []);

  // 检测 URL 是否携带查询参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasQueryParams = Array.from(params.keys()).length > 0;
    setShowSearch(!hasQueryParams);
  }, []);

  // 动态计算 Tree 高度
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (treeContainerRef.current) {
        const containerHeight = treeContainerRef.current.clientHeight;
        setTreeHeight(containerHeight);
      }
    };
    
    updateHeight();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [showSearch]);

  // ===== 参数管理 =====

  const addParam = (
    list: ApiParamItem[],
    setter: (list: ApiParamItem[]) => void,
  ) => {
    const newItem: ApiParamItem = {
      id: `param_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      location: '',
      type: 'string',
      defaultValue: '',
      value: '',
    };
    setter([...list, newItem]);
  };

  const removeParam = (
    list: ApiParamItem[],
    setter: (list: ApiParamItem[]) => void,
    id: string,
  ) => {
    setter(list.filter(item => item.id !== id));
  };

  const updateParam = (
    list: ApiParamItem[],
    setter: (list: ApiParamItem[]) => void,
    id: string,
    field: keyof ApiParamItem,
    value: string,
  ) => {
    setter(
      list.map(item =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const clearParams = (
    setter: (list: ApiParamItem[]) => void,
  ) => {
    setter([]);
  };

  // ===== 发送请求 =====
  const handleSendRequest = async () => {
    if (!apiDetail) {
      message.warning('请先选择一个 API');
      return;
    }

    setSending(true);
    setResponse(null);

    const headersRecord: Record<string, string> = {};
    headers.forEach(h => {
      if (h.name && h.value) {
        headersRecord[h.name] = h.value;
      }
    });

    const queryRecord: Record<string, string> = {};
    queryParams.forEach(q => {
      if (q.name && q.value) {
        queryRecord[q.name] = q.value;
      }
    });

    try {
      const res = await sendDebugRequest({
        domain: apiDetail.serviceAddress,
        method: apiDetail.httpMethod,
        path: apiDetail.path,
        headers: headersRecord,
        query: queryRecord,
        certificate: certificate || undefined,
      });
      setResponse(res);
      setActiveDocTab('result');
      message.success('请求完成');
    } catch {
      message.error('请求失败');
    } finally {
      setSending(false);
    }
  };

  // ===== 清空表单 =====
  const handleClear = () => {
    setHeaders([]);
    setQueryParams([]);
    setCertificate('');
    setResponse(null);
  };

  // ===== 参数表格列 =====
  const createParamColumns = (
    params: ApiParamItem[],
    setter: (list: ApiParamItem[]) => void,
  ): ColumnsType<ApiParamItem> => [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (_: string, record: ApiParamItem) => (
        <Input
          size="small"
          placeholder="参数名"
          value={record.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateParam(params, setter, record.id, 'name', e.target.value)
          }
        />
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (_: string, record: ApiParamItem) => (
        <Input
          size="small"
          placeholder="位置"
          value={record.location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateParam(params, setter, record.id, 'location', e.target.value)
          }
        />
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_: string, record: ApiParamItem) => (
        <Select
          size="small"
          value={record.type}
          style={{ width: '100%' }}
          onChange={(val: string) => updateParam(params, setter, record.id, 'type', val)}
        >
          <Select.Option value="string">string</Select.Option>
          <Select.Option value="integer">integer</Select.Option>
          <Select.Option value="boolean">boolean</Select.Option>
        </Select>
      ),
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 100,
      render: (_: string, record: ApiParamItem) => (
        <Input
          size="small"
          placeholder="默认值"
          value={record.defaultValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateParam(
              params,
              setter,
              record.id,
              'defaultValue',
              e.target.value,
            )
          }
        />
      ),
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (_: string, record: ApiParamItem) => (
        <Input
          size="small"
          placeholder="输入值"
          value={record.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateParam(params, setter, record.id, 'value', e.target.value)
          }
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_: string, record: ApiParamItem) => (
        <Button
          type="link"
          size="small"
          danger
          onClick={() => removeParam(params, setter, record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // 渲染参数区域
  const renderParamSection = (
    title: string,
    params: ApiParamItem[],
    setter: (list: ApiParamItem[]) => void,
  ) => (
    <div>
      <Space
        style={{ marginBottom: 8, justifyContent: 'space-between', width: '100%' }}
      >
        <Text strong>{title}</Text>
        <Space size="small">
          <Button
            size="small"
            onClick={() => addParam(params, setter)}
            type="primary"
            ghost
          >
            新增
          </Button>
          <Button
            size="small"
            onClick={() => clearParams(setter)}
            disabled={params.length === 0}
          >
            清空
          </Button>
        </Space>
      </Space>
      <Table
        size="small"
        dataSource={params}
        rowKey="id"
        pagination={false}
        columns={createParamColumns(params, setter)}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No data"
            />
          ),
        }}
      />
    </div>
  );

  // 渲染 API 文档
  const renderApiDoc = () => {
    if (!apiDetail) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="请选择一个 API 查看文档"
        />
      );
    }

    return (
      <div style={{ padding: '16px 20px' }}>
        {/* 请求基础定义 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#181C1E',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #EDEEF5'
          }}>
            请求基础定义
          </div>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={<span style={{ color: '#454652' }}>API 名称</span>}>
              <span style={{ color: '#181C1E', fontWeight: 500 }}>{apiDetail.apiName}</span>
            </Descriptions.Item>
            <Descriptions.Item label={<span style={{ color: '#454652' }}>Path</span>}>
              <Text code style={{ 
                background: '#F7FAFD',
                padding: '2px 8px',
                borderRadius: 4,
                color: '#3B71EE',
                fontSize: 12
              }}>
                {apiDetail.path}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span style={{ color: '#454652' }}>服务地址</span>}>
              <span style={{ color: '#181C1E' }}>{apiDetail.serviceAddress}</span>
            </Descriptions.Item>
            <Descriptions.Item label={<span style={{ color: '#454652' }}>后端超时</span>}>
              <span style={{ color: '#181C1E' }}>{apiDetail.backendTimeout}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* 请求模式 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#181C1E',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #EDEEF5'
          }}>
            请求模式
          </div>
          <Space size="middle">
            <Tag color={
              apiDetail.httpMethod === 'GET' ? '#16A34A' :
              apiDetail.httpMethod === 'POST' ? '#3B71EE' :
              apiDetail.httpMethod === 'PUT' ? '#F3A700' : '#F53C3C'
            } style={{ 
              fontSize: 13,
              padding: '4px 12px',
              borderRadius: 6,
              fontWeight: 500
            }}>
              {apiDetail.httpMethod}
            </Tag>
            <Tag style={{ 
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 6,
              background: '#F7FAFD',
              color: '#454652',
              border: 'none'
            }}>
              {apiDetail.requestMode}
            </Tag>
          </Space>
        </div>

        {/* API 状态 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#181C1E',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #EDEEF5'
          }}>
            API 状态
          </div>
          <Tag color={
            apiDetail.apiStatus === 'online' ? '#16A34A' :
            apiDetail.apiStatus === 'offline' ? '#7E8494' : '#F53C3C'
          } style={{ 
            fontSize: 12,
            padding: '4px 12px',
            borderRadius: 6,
            fontWeight: 500
          }}>
            {apiDetail.apiStatus === 'online' ? '已上线' :
             apiDetail.apiStatus === 'offline' ? '已下线' : '已弃用'}
          </Tag>
        </div>

        {/* 返回结果示例 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#181C1E',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #EDEEF5'
          }}>
            返回结果示例
          </div>
          <Tabs 
            defaultActiveKey="success" 
            size="small"
            type="card"
            tabBarStyle={{
              marginBottom: 12,
              borderBottom: 'none'
            }}
            tabBarGutter={4}
          >
            <Tabs.TabPane 
              tab={<span style={{ 
                fontWeight: 400,
                fontSize: 12,
                color: '#7E8494'
              }}>成功响应</span>} 
              key="success"
            >
              <div style={{
                background: '#FFFFFF',
                borderRadius: 6,
                padding: 12,
                border: '1px solid #EDEEF5'
              }}>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "'Courier New', 'Consolas', monospace",
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: '#454652',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {apiDetail.successResponseExample}
                </pre>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane 
              tab={<span style={{ 
                fontWeight: 400,
                fontSize: 12,
                color: '#7E8494'
              }}>失败响应</span>} 
              key="failure"
            >
              <div style={{
                background: '#FFFFFF',
                borderRadius: 6,
                padding: 12,
                border: '1px solid #EDEEF5'
              }}>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "'Courier New', 'Consolas', monospace",
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: '#454652',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {apiDetail.failureResponseExample}
                </pre>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 112px)' }}>
      {/* ===== 左侧:API 树形列表 ===== */}
      <Card
        title="API 列表"
        size="small"
        style={{ width: '20%', minWidth: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {showSearch && (
          <div style={{ padding: 12 }}>
            <Input
              size="small"
              placeholder={searchMode === 'service' ? '搜索服务' : '搜索 API'}
              addonBefore={
                <Select
                  value={searchMode}
                  onChange={handleToggleSearchMode}
                  style={{ width: 70, textAlign: 'left' }}
                  size="small"
                  bordered={false}
                >
                  <Select.Option value="service">
                    服务
                  </Select.Option>
                  <Select.Option value="api">
                    API
                  </Select.Option>
                </Select>
              }
              suffix={<SearchOutlined />}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>
        )}
        <div ref={treeContainerRef} style={{ flex: 1, overflow: 'hidden', padding: '0 12px', marginBottom: 12 }}>
          <Tree
            multiple
            blockNode
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={(keys) => handleTreeExpand(keys)}
            onSelect={(keys, info) => handleTreeSelect(keys, info)}
            selectedKeys={selectedApi ? [`api-${selectedApi.id}`] : []}
            height={treeHeight}
          />
        </div>
      </Card>

      {/* ===== 中间：请求配置 ===== */}
      <Card
        size="small"
        title="请求配置"
        style={{ width: 'calc(40% - 16px)', flexShrink: 0, overflow: 'auto' }}
        bodyStyle={{ padding: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 基础信息 - 垂直排列，静态展示 */}
          {apiDetail ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="域名">
                {apiDetail.serviceAddress}
              </Descriptions.Item>
              <Descriptions.Item label="请求方法">
                <Tag color={
                  apiDetail.httpMethod === 'GET' ? 'green' :
                  apiDetail.httpMethod === 'POST' ? 'blue' :
                  apiDetail.httpMethod === 'PUT' ? 'orange' : 'red'
                }>
                  {apiDetail.httpMethod}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Path">
                <Text code>{apiDetail.path}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="API状态">
                <Tag color={
                  apiDetail.apiStatus === 'online' ? 'success' :
                  apiDetail.apiStatus === 'offline' ? 'default' : 'error'
                }>
                  {apiDetail.apiStatus === 'online' ? '已上线' :
                   apiDetail.apiStatus === 'offline' ? '已下线' : '已弃用'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="请选择一个 API"
            />
          )}

          <Divider style={{ margin: '12px 0' }} />

          {/* Headers */}
          {renderParamSection('Headers', headers, setHeaders)}

          <Divider style={{ margin: '4px 0' }} />

          {/* Query */}
          {renderParamSection('Query', queryParams, setQueryParams)}

          <Divider style={{ margin: '4px 0' }} />

          {/* Certificate */}
          <div>
            <Text strong style={{ marginBottom: 8, display: 'block' }}>
              Certificate
            </Text>
            <Input.TextArea
              rows={3}
              placeholder="证书内容（demo）"
              value={certificate}
              onChange={e => setCertificate(e.target.value)}
              style={{ fontSize: 12 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              demo：生成模拟响应（耗时/状态码/返回体）
            </Text>
          </div>

          <Divider style={{ margin: '4px 0' }} />

          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sending}
              onClick={handleSendRequest}
            >
              发送请求
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClear}
            >
              重置
            </Button>
          </Space>
        </div>
      </Card>

      {/* ===== 右侧：文档/结果 ===== */}
      <Card
        size="small"
        style={{ width: 'calc(40% - 16px)', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        bodyStyle={{ padding: 0, flex: 1, overflow: 'hidden' }}
      >
        <Tabs
          activeKey={activeDocTab}
          onChange={key => setActiveDocTab(key as 'doc' | 'result')}
          size="small"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ margin: 0, padding: '0 12px' }}
        >
          <Tabs.TabPane tab="API 文档" key="doc">
            <div style={{ overflow: 'auto', height: 'calc(100vh - 200px)' }}>
              {renderApiDoc()}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="调用结果" key="result">
            <div style={{ overflow: 'auto', height: 'calc(100vh - 200px)', padding: 12 }}>
              {response ? (
                <Tabs defaultActiveKey="body" size="small">
                  <Tabs.TabPane tab="响应体" key="body">
                    <pre
                      style={{
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
                      }}
                    >
                      {response.body}
                    </pre>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="响应 Headers" key="headers">
                    <Table
                      size="small"
                      dataSource={Object.entries(response.headers).map(
                        ([key, value]) => ({
                          key,
                          value,
                        }),
                      )}
                      rowKey="key"
                      pagination={false}
                      columns={[
                        { title: 'Header', dataIndex: 'key', key: 'key', width: 200 },
                        { title: '值', dataIndex: 'value', key: 'value' },
                      ]}
                    />
                  </Tabs.TabPane>
                </Tabs>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="发送请求后查看调用结果"
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
