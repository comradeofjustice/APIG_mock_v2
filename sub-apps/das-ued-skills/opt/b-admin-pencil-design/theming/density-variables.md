# 信息密度 Variables 配置

## 三档密度值

调用 `set_variables` 传入对应档位的密度变量值。

### high（紧凑）

```json
{
  "density/table-row-height":    36,
  "density/table-header-height": 32,
  "density/input-height":        28,
  "density/btn-height-md":       28,
  "density/btn-height-lg":       32,
  "density/card-padding":        12,
  "density/nav-item-height":     36,
  "density/form-gap":            12
}
```

### medium（标准，默认）

```json
{
  "density/table-row-height":    40,
  "density/table-header-height": 36,
  "density/input-height":        32,
  "density/btn-height-md":       32,
  "density/btn-height-lg":       36,
  "density/card-padding":        16,
  "density/nav-item-height":     40,
  "density/form-gap":            16
}
```

### low（宽松）

```json
{
  "density/table-row-height":    48,
  "density/table-header-height": 44,
  "density/input-height":        36,
  "density/btn-height-md":       36,
  "density/btn-height-lg":       40,
  "density/card-padding":        24,
  "density/nav-item-height":     48,
  "density/form-gap":            24
}
```

---

## 与间距的组合建议

| 信息密度 | 间距缩放 | 适用场景 |
|---------|---------|---------|
| high | spacing 缩小至 ×0.75 | 数据分析、监控大屏 |
| medium | spacing 保持 ×1 | 通用后台 |
| low | spacing 放大至 ×1.25 | 轻量工具、内容管理 |

调整间距时同步更新 `spacing/*` 系列变量。
