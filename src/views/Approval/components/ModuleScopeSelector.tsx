/**
 * 适用模块与操作选择器
 *
 * 功能：
 * - 每条模块以 checkbox + Select 一行水平自由排列换行展示
 * - 默认仅显示 checkbox，勾选后 Select 从右侧伸展展开
 * - 模块整体带 border 样式，使 checkbox / label / Select 在同一容器内过渡不突兀
 * - Select 宽度根据 operations 数量自动计算：(length + 1) * 60
 * - 配合 antd Form.Item 的 name="scopeJson" 使用
 */

import { Checkbox, Select, Tooltip } from 'antd';
import { MODULE_LIST } from '../constants';

interface ModuleScopeSelectorProps {
  value?: Record<string, string[]>;
  onChange?: (value: Record<string, string[]>) => void;
}

export default function ModuleScopeSelector({ value = {}, onChange }: ModuleScopeSelectorProps) {
  const selectedModules = Object.keys(value);

  const handleCheck = (moduleCode: string, checked: boolean) => {
    const next = { ...value };
    if (checked) {
      next[moduleCode] = [];
    } else {
      delete next[moduleCode];
    }
    onChange?.(next);
  };

  const handleOperationChange = (moduleCode: string, operations: string[]) => {
    onChange?.({ ...value, [moduleCode]: operations });
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {MODULE_LIST.map((module) => {
        const checked = selectedModules.includes(module.code);
        const selectWidth = (module.operations.length + 1) * 60;

        return (
          <div
            key={module.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: checked ? '#fff' : '#fafafa',
              cursor: 'pointer',
              transition: 'border-color 0.25s ease, background 0.25s ease',
            }}
          >
            <Checkbox
              checked={checked}
              onChange={(e) => handleCheck(module.code, e.target.checked)}
            />
            <Tooltip title={module.tooltip}>
              <span
                style={{ marginLeft: 4, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCheck(module.code, !checked)}
              >
                {module.name}
              </span>
            </Tooltip>

            <div
              style={{
                overflow: 'hidden',
                transition: 'width 0.25s ease, opacity 0.2s ease',
                width: checked ? selectWidth : 0,
                opacity: checked ? 1 : 0,
                whiteSpace: 'nowrap',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Select
                mode="multiple"
                placeholder="操作类型"
                value={value[module.code] || []}
                onChange={(ops) => handleOperationChange(module.code, ops)}
                style={{ width: selectWidth }}
                size="small"
                allowClear
                options={module.operations.map((op) => ({
                  label: op,
                  value: op,
                }))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
