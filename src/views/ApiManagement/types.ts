/**
 * API 管理 - 类型定义
 */

/** API 状态 */
export type ApiStatus = 'online' | 'offline' | 'deprecated';

/** HTTP 方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** API 定义 */
export interface ApiDefinition {
  id: number;
  apiName: string;
  path: string;
  httpMethod: HttpMethod;
  apiStatus: ApiStatus;
  description?: string;
  requestMode: string;
  updatedAt: string;
  
  // 后端服务信息
  serviceType: string;
  serviceName: string;
  serviceAddress: string;
  backendTimeout: string;

  // 返回结果
  returnType: string;
  successResponseExample: string;
  failureResponseExample: string;

  // 错误码定义
  errorCodes: ErrorCodeItem[];

  // API参数
  parameters?: ApiParameterGroup;
}

/** 错误码条目 */
export interface ErrorCodeItem {
  code: string;
  message: string;
  description?: string;
}

/** API 参数类型 */
export type ApiParamType = 'path' | 'header' | 'query';

/** API 参数项 */
export interface ApiParameter {
  id?: string;
  name: string;
  type: string;
  defaultValue?: string;
  example?: string;
  description?: string;
}

/** API 参数分组 */
export interface ApiParameterGroup {
  path: ApiParameter[];
  header: ApiParameter[];
  query: ApiParameter[];
}

/** API 列表项 */
export interface ApiListItem {
  id: number;
  apiName: string;
  path: string;
  httpMethod: HttpMethod;
  apiStatus: ApiStatus;
  description?: string;
  updatedAt: string;
}

/** 服务节点（一层） */
export interface ApiServiceNode {
  id: string;
  name: string;
  type: 'service';
}

/** API 节点（二层） */
export interface ApiNode {
  id: string;
  serviceId: string;
  apiName: string;
  path: string;
  httpMethod: HttpMethod;
  apiStatus: ApiStatus;
  type: 'api';
}

/** 树节点联合类型 */
export type ApiTreeNode = ApiServiceNode | ApiNode;

/** 服务查询响应 */
export interface ServiceQueryResponse {
  services: ApiServiceNode[];
}

/** API 列表查询响应（支持懒加载） */
export interface ApiListQueryResponse {
  apis: ApiListItem[];
  hasMore: boolean;
}

/** API 调试请求 */
export interface ApiDebugRequest {
  id: number;
  apiId: number;
  domain: string;
  httpMethod: HttpMethod;
  path: string;
  headers: ApiParamItem[];
  query: ApiParamItem[];
  certificate: string;
}

/** API 参数项 */
export interface ApiParamItem {
  name: string;
  location: string;
  type: string;
  defaultValue: string;
  value?: string;
  id: string;
}

/** API 调试响应 */
export interface ApiDebugResponse {
  statusCode: number;
  body: string;
  duration: number;
  headers: Record<string, string>;
}

/** 分页查询 */
export interface ApiQuery {
  keyword?: string;
  currentPage: number;
  pageSize: number;
}

/** 分页响应 */
export interface PageResponse<T> {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}
