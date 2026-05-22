/**
 * API 管理 - Mock API 服务
 */

import type { ApiDefinition, ApiListItem, PageResponse, ApiQuery, ApiServiceNode, ApiListQueryResponse } from './types';
import { getMockApiDetail, getMockApiList, getMockServices, getMockApisByService } from './mockData';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 分页查询 API 列表
 */
export async function queryApiList(
  params: ApiQuery,
): Promise<PageResponse<ApiListItem>> {
  await delay(300);
  const { keyword, currentPage, pageSize } = params;
  const result = getMockApiList(keyword, currentPage, pageSize);
  return {
    totalCount: result.totalCount,
    currentPage,
    pageSize,
    data: result.data,
  };
}

/**
 * 查询服务列表
 */
export async function queryServices(
  keyword?: string,
): Promise<{ services: ApiServiceNode[] }> {
  await delay(200);
  const services = getMockServices(keyword);
  return { services };
}

/**
 * 查询服务下的 API 列表（懒加载）
 */
export async function queryApisByService(
  serviceId: string,
  params?: {
    keyword?: string;
    offset?: number;
    limit?: number;
  },
): Promise<ApiListQueryResponse> {
  await delay(300);
  const { keyword, offset = 0, limit = 200 } = params || {};
  const result = getMockApisByService(serviceId, keyword, offset, limit);
  return {
    apis: result.apis,
    hasMore: result.hasMore,
  };
}

/**
 * 获取 API 定义详情
 */
export async function getApiDetail(
  apiId: number,
): Promise<ApiDefinition> {
  await delay(200);
  return getMockApiDetail(apiId);
}

/**
 * 导出 API 文档 - OpenAPI
 */
export async function exportOpenApiDoc(
  apiId: number,
): Promise<void> {
  await delay(500);
  // Mock 导出
  console.log('导出 OpenAPI 文档，API ID:', apiId);
}

/**
 * 导出 API 文档 - Word
 */
export async function exportWordDoc(
  apiId: number,
): Promise<void> {
  await delay(500);
  // Mock 导出
  console.log('导出 Word 文档，API ID:', apiId);
}

/**
 * 发送 API 调试请求（Mock）
 */
export async function sendDebugRequest(_params: {
  domain: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  certificate?: string;
}): Promise<{
  statusCode: number;
  body: string;
  duration: number;
  headers: Record<string, string>;
}> {
  await delay(800);
  return {
    statusCode: 200,
    body: JSON.stringify({
      code: 0,
      data: { taskId: 'w-001' },
    }, null, 2),
    duration: 156,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'req-abc123',
    },
  };
}
