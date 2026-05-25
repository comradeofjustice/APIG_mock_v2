// SQL转API模块类型定义

export type ApiStatus = 'draft' | 'active' | 'deprecated' | 'pending_approval';

export type SecurityLevel = 'low' | 'medium' | 'high';

export type HttpMethod = 'GET' | 'POST';

export type ParameterType = 'string' | 'number' | 'boolean' | 'array';

export type ParameterLocation = 'query' | 'body';

// 参数定义
export interface Parameter {
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  description?: string;
  location: ParameterLocation;
}

// 响应体结构
export interface ResponseSchema {
  success: boolean;
  data: any[];
  total?: number;
  message?: string;
}

// API定义
export interface ApiDefinition {
  id: string;
  name: string;
  description?: string;
  sqlStatement: string;
  databaseType: 'MySQL';
  httpMethod: HttpMethod;
  apiUrl: string;
  parameters?: Parameter[];
  responseSchema?: ResponseSchema;
  securityLevel: SecurityLevel;
  status: ApiStatus;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// SQL校验结果
export interface SqlValidationResult {
  valid: boolean;
  errors?: Array<{
    line: number;
    column: number;
    message: string;
  }>;
  securityLevel?: SecurityLevel;
  extractedParams?: Parameter[];
}

// 调试请求
export interface DebugRequest {
  apiId: string;
  parameters: Record<string, any>;
}

// 调试响应
export interface DebugResponse {
  success: boolean;
  data: any[];
  total?: number;
  executionTime: number; // 执行时间(ms)
  message?: string;
}
