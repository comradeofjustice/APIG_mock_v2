/**
 * API 管理 - Mock 数据
 */

import type { ApiDefinition, ApiListItem, ErrorCodeItem, ApiParameterGroup, ApiServiceNode } from './types';

// ========== 错误码定义 ==========

export const MOCK_ERROR_CODES: ErrorCodeItem[] = [
  { code: '0', message: '成功', description: '请求处理成功' },
  { code: '50000', message: '系统异常', description: '服务器内部错误' },
  { code: '40001', message: '参数错误', description: '请求参数校验失败' },
  { code: '40003', message: '无权限', description: 'API Key 无权限访问' },
];

// ========== API 参数定义 ==========

export const MOCK_API_PARAMETERS: ApiParameterGroup = {
  path: [
    {
      id: 'p1',
      name: 'version',
      type: 'String',
      defaultValue: 'v1',
      example: 'v1',
      description: 'API版本号',
    },
  ],
  header: [
    {
      id: 'h1',
      name: 'Content-Type',
      type: 'String',
      defaultValue: 'application/json',
      example: 'application/json',
      description: '请求内容类型',
    },
    {
      id: 'h2',
      name: 'Authorization',
      type: 'String',
      example: 'Bearer xxxxx',
      description: '认证令牌',
    },
  ],
  query: [
    {
      id: 'q1',
      name: 'callback',
      type: 'String',
      example: 'https://example.com/callback',
      description: '回调地址',
    },
    {
      id: 'q2',
      name: 'timeout',
      type: 'Number',
      defaultValue: '30',
      example: '60',
      description: '超时时间（秒）',
    },
  ],
};

// ========== API 定义 ==========

export const MOCK_API_DEFINITION: ApiDefinition = {
  id: 1,
  apiName: 'feidaili-文件水印-开放API',
  path: '/api/v1/file/watermark',
  httpMethod: 'POST',
  apiStatus: 'online',
  description: '文件水印开放能力（演示数据）',
  requestMode: '开放API',
  updatedAt: '2026-05-21 09:30:06',
  serviceType: 'HTTP',
  serviceName: 'feidaili',
  serviceAddress: 'https://feidaili.example.com',
  backendTimeout: '30000ms',
  returnType: 'JSON',
  successResponseExample: JSON.stringify({
    code: 0,
    data: {
      taskId: 'w-001',
    },
  }, null, 2),
  failureResponseExample: JSON.stringify({
    code: 50000,
    message: '系统异常',
  }, null, 2),
  errorCodes: MOCK_ERROR_CODES,
  parameters: MOCK_API_PARAMETERS,
};

// ========== API 列表 Mock ==========

export const MOCK_API_LIST: ApiListItem[] = [
  {
    id: 1,
    apiName: 'feidaili-文件水印-开放API',
    path: '/api/v1/file/watermark',
    httpMethod: 'POST',
    apiStatus: 'online',
    description: '文件水印开放能力（演示数据）',
    updatedAt: '2026-05-21 09:30:06',
  },
  {
    id: 2,
    apiName: 'feidaili-图片审核-开放API',
    path: '/api/v1/image/review',
    httpMethod: 'POST',
    apiStatus: 'online',
    description: '图片内容审核',
    updatedAt: '2026-05-20 14:22:10',
  },
  {
    id: 3,
    apiName: 'feidaili-文本检测-内部API',
    path: '/api/v1/text/detect',
    httpMethod: 'POST',
    apiStatus: 'online',
    description: '文本敏感内容检测',
    updatedAt: '2026-05-19 11:15:30',
  },
  {
    id: 4,
    apiName: 'feidaili-用户信息查询',
    path: '/api/v1/user/info',
    httpMethod: 'GET',
    apiStatus: 'online',
    description: '查询用户基本信息',
    updatedAt: '2026-05-18 09:00:00',
  },
  {
    id: 5,
    apiName: 'feidaili-数据上报-v1',
    path: '/api/v1/data/report',
    httpMethod: 'POST',
    apiStatus: 'deprecated',
    description: '数据上报接口（已弃用）',
    updatedAt: '2026-05-01 10:00:00',
  },
];

// ========== 服务 Mock ==========

export const MOCK_SERVICES: ApiServiceNode[] = [
  { id: 'svc-1', name: '飞代理服务', type: 'service' },
  { id: 'svc-2', name: '内容审核服务', type: 'service' },
  { id: 'svc-3', name: '用户服务', type: 'service' },
  { id: 'svc-4', name: '数据服务', type: 'service' },
];

// 服务与 API 的映射关系
export const SERVICE_API_MAP: Record<string, number[]> = {
  'svc-1': [1, 2, ...Array.from({ length: 250 }, (_, i) => 100 + i)], // 模拟252个API，展示加载更多
  'svc-2': [3],
  'svc-3': [4],
  'svc-4': [5],
};

// ========== Mock 数据池操作 ==========

/** 获取模拟 API 定义详情 */
export function getMockApiDetail(apiId: number): ApiDefinition {
  return {
    ...MOCK_API_DEFINITION,
    id: apiId,
  };
}

/** 获取模拟 API 列表 */
export function getMockApiList(
  keyword?: string,
  currentPage = 1,
  pageSize = 20,
): { totalCount: number; data: ApiListItem[] } {
  let filtered = MOCK_API_LIST;
  if (keyword) {
    filtered = filtered.filter(
      item =>
        item.apiName.includes(keyword) ||
        item.path.includes(keyword) ||
        item.description?.includes(keyword),
    );
  }
  const start = (currentPage - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return { totalCount: filtered.length, data };
}

/** 获取服务列表 */
export function getMockServices(keyword?: string): ApiServiceNode[] {
  let services = MOCK_SERVICES;
  if (keyword) {
    services = services.filter(s => s.name.includes(keyword));
  }
  return services;
}

/** 获取服务下的 API 列表（支持懒加载） */
export function getMockApisByService(
  serviceId: string,
  keyword?: string,
  offset = 0,
  limit = 200,
): { apis: ApiListItem[]; hasMore: boolean } {
  const apiIds = SERVICE_API_MAP[serviceId] || [];
  let apis = apiIds
    .map(id => {
      // 为模拟数据生成API信息
      const existingApi = MOCK_API_LIST.find(item => item.id === id);
      if (existingApi) return existingApi;
      // 生成模拟API
      return {
        id,
        apiName: `模拟API-${id}`,
        path: `/api/v1/mock/${id}`,
        httpMethod: 'POST' as const,
        apiStatus: 'online' as const,
        description: `模拟API描述-${id}`,
        updatedAt: '2026-05-21 10:00:00',
      };
    })
    .filter((item): item is ApiListItem => item !== undefined);

  if (keyword) {
    apis = apis.filter(
      item =>
        item.apiName.includes(keyword) ||
        item.path.includes(keyword) ||
        item.description?.includes(keyword),
    );
  }

  const total = apis.length;
  const slicedApis = apis.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return { apis: slicedApis, hasMore };
}
