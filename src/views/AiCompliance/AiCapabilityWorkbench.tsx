import { type CSSProperties } from 'react';
import { Button, Checkbox, Input, Radio, Select, Slider, Switch } from 'antd';

import type { CapabilityModule, StrategyField } from './capabilityData';

import './capabilityWorkbench.css';

const { TextArea } = Input;

type AiCapabilityWorkbenchProps = {
  module: CapabilityModule;
};

function renderField(field: StrategyField) {
  switch (field.kind) {
    case 'input':
      return <Input defaultValue={field.value} suffix={field.suffix} />;
    case 'textarea':
      return (
        <TextArea
          defaultValue={field.value}
          autoSize={{ minRows: field.rows ?? 3, maxRows: (field.rows ?? 3) + 2 }}
        />
      );
    case 'select':
      return (
        <Select defaultValue={field.value}>
          {field.options.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      );
    case 'switch':
      return (
        <div className="strategy-switch">
          <Switch defaultChecked={field.checked} />
          <span className="strategy-switch__text">
            {field.checked ? field.checkedLabel ?? '开启' : field.uncheckedLabel ?? '关闭'}
          </span>
        </div>
      );
    case 'slider':
      return (
        <div className="strategy-slider">
          <Slider
            defaultValue={field.value}
            min={field.min}
            max={field.max}
            tooltipVisible={false}
          />
          <span className="strategy-slider__value">
            {field.value}
            {field.suffix ?? ''}
          </span>
        </div>
      );
    case 'checkbox':
      return <Checkbox.Group className="strategy-checkbox-group" options={field.options} defaultValue={field.value} />;
    case 'radio':
      return (
        <Radio.Group defaultValue={field.value} className="strategy-radio-group">
          {field.options.map((option) => (
            <Radio.Button key={option} value={option}>
              {option}
            </Radio.Button>
          ))}
        </Radio.Group>
      );
    default:
      return null;
  }
}

export default function AiCapabilityWorkbench(props: AiCapabilityWorkbenchProps) {
  const { module } = props;

  const themeStyle = {
    '--cap-accent': module.theme.base,
    '--cap-soft': module.theme.soft,
    '--cap-line': module.theme.line,
    '--cap-contrast': module.theme.contrast,
  } as CSSProperties;

  return (
    <div className="capability-page capability-page--formal" style={themeStyle}>
      <div className="capability-layout">
        <article className="capability-card capability-card--config">
          <div className="capability-card__head">
            <div className="capability-card__title">配置图</div>
            <div className="capability-card__actions">
              <Button>重置</Button>
              <Button type="primary">保存策略</Button>
            </div>
          </div>

          <div className="strategy-form">
            {module.formSections.map((section) => (
              <section key={section.title} className="strategy-section">
                <div className="strategy-section__title">{section.title}</div>

                <div className="strategy-field-grid">
                  {section.fields.map((field) => (
                    <div
                      key={`${section.title}-${field.label}`}
                      className={`strategy-field ${field.span === 2 ? 'is-span-2' : ''}`}
                    >
                      <div className="strategy-field__label">{field.label}</div>
                      <div className="strategy-field__control">{renderField(field)}</div>
                      {field.helper ? <div className="strategy-field__helper">{field.helper}</div> : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <article className="capability-card capability-card--output">
          <div className="capability-card__head">
            <div className="capability-card__title">结构化结果</div>
          </div>

          <div className="structured-output-list">
            {module.structuredOutputs.map((output) => (
              <div key={output.title} className="structured-output">
                <div className="structured-output__head">
                  <span>{output.title}</span>
                  <span>{output.mode === 'json' ? 'JSON' : '文本'}</span>
                </div>
                <pre>{output.content}</pre>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
