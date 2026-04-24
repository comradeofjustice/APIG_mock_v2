/**
 * 审批流程 ECharts 关系图组件
 *
 * 功能：
 * - 审批流程可视化（提交 → 各级审批 → 结束）
 * - 圆形节点：起止节点显示"提交"/"结束"，层级节点显示"或签"/"会签"
 * - 节点外侧展示审批人、日志等补充信息
 * - 画布宽度按层级动态调整并居中
 * - 坐标系自适应容器实际宽度
 */

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { ApprovalFlow, LevelStatusMap, TimelineRecord } from '../types'

interface ApprovalFlowChartProps {
  approvalFlow: ApprovalFlow[]
  levelStatusMap?: LevelStatusMap
  timeline?: TimelineRecord[]
  currentLevel?: number
  /** 用户ID→名称映射 */
  userNameMap?: Record<string, string>
  /** 图表高度，默认 280 */
  height?: number
}

// 状态颜色映射
const STATUS_COLORS: Record<string, string> = {
  done: '#52c41a',
  current: '#1677ff',
  pending: '#d9d9d9',
  rejected: '#ff4d4f',
}

export default function ApprovalFlowChart({
  approvalFlow,
  levelStatusMap = {},
  timeline = [],
  currentLevel,
  userNameMap = {},
  height = 280,
}: ApprovalFlowChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // 获取容器实际像素宽度，用于自适应坐标系
    const containerWidth = chartRef.current.offsetWidth || 400
    const containerHeight = height

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const levelCount = approvalFlow.length
    const totalMainNodes = levelCount + 2 // start + levels + end

    // 主节点沿水平居中均匀分布
    const paddingX = 60
    const usableWidth = containerWidth - paddingX * 2
    const xStep = usableWidth / (totalMainNodes - 1 || 1)
    const centerY = containerHeight / 2

    // ========== 构建节点 ==========
    const nodes: any[] = []

    // 起始节点：提交
    nodes.push({
      name: 'start',
      x: paddingX,
      y: centerY,
      symbolSize: 52,
      symbol: 'circle',
      emphasis: { disabled: true },
      itemStyle: { color: '#1677ff' },
      label: {
        show: true,
        formatter: '提交',
        fontSize: 13,
        color: '#fff',
        fontWeight: 500,
      },
      tooltip: { show: false },
    })

    // 审批层级节点 + 外侧信息节点
    approvalFlow.forEach((level, i) => {
      const status = levelStatusMap[level.level] || 'pending'
      const modeText = level.mode === 'or' ? '或签' : '会签'
      const approverNames = level.approvers.map(id => userNameMap[id] || id).join('、')

      // 主圆形节点
      nodes.push({
        name: `level_${level.level}`,
        x: paddingX + xStep * (i + 1),
        y: centerY,
        symbolSize: 56,
        symbol: 'circle',
        itemStyle: { color: STATUS_COLORS[status] },
        emphasis: { disabled: true },
        label: {
          show: true,
          formatter: modeText,
          fontSize: 13,
          color: status === 'pending' ? '#999' : '#fff',
          fontWeight: 500,
        },
        tooltip: {
          formatter: () => {
            let html = `<b>第${level.level}级 (${modeText})</b><br/>`
            html += `审批人：${approverNames || '待指定'}`
            // 查找相关时间线事件
            const relevantEvents = timeline.filter(t => t.action !== 'submit')
            relevantEvents.forEach(evt => {
              html += `<br/>${evt.operatorName || evt.operatorId}：${evt.action === 'approve' ? '通过' : evt.action === 'reject' ? '拒绝' : evt.action}${evt.opinion ? '（' + evt.opinion + '）' : ''}`
            })
            return html
          },
        },
      })

      // 节点外侧信息节点（透明，仅展示文字）
      // 上方：第N级
      nodes.push({
        name: `level_${level.level}_title`,
        x: paddingX + xStep * (i + 1),
        y: centerY - 46,
        symbolSize: 1,
        symbol: 'circle',
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          formatter: `第${level.level}级`,
          fontSize: 12,
          color: '#333',
          fontWeight: 500,
        },
        tooltip: { show: false },
        silent: true,
        emphasis: { disabled: true },
      })

      // 下方：审批人
      const infoY = centerY + 46
      if (approverNames) {
        nodes.push({
          name: `level_${level.level}_info`,
          x: paddingX + xStep * (i + 1),
          y: infoY,
          symbolSize: 1,
          symbol: 'circle',
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            formatter: approverNames.length > 8 ? approverNames.substring(0, 8) + '…' : approverNames,
            fontSize: 11,
            color: '#666',
          },
          tooltip: { show: false },
          silent: true,
          emphasis: { disabled: true },
        })
      }

      // 下方第二行：日志（已完成/已拒绝的显示操作人）
      const logY = infoY + 18
      let logText = ''
      if (status === 'done') {
        const approveEvent = timeline.find(t => t.action === 'approve')
        if (approveEvent) {
          logText = `${approveEvent.operatorName || approveEvent.operatorId} 已通过`
        }
      } else if (status === 'rejected') {
        const rejectEvent = timeline.find(t => t.action === 'reject')
        if (rejectEvent) {
          logText = `${rejectEvent.operatorName || rejectEvent.operatorId} 已拒绝`
        }
      } else if (status === 'current') {
        logText = '审批中…'
      }
      if (logText) {
        nodes.push({
          name: `level_${level.level}_log`,
          x: paddingX + xStep * (i + 1),
          y: logY,
          symbolSize: 1,
          symbol: 'circle',
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            formatter: logText,
            fontSize: 10,
            color: status === 'rejected' ? '#ff4d4f' : status === 'done' ? '#52c41a' : '#999',
          },
          tooltip: { show: false },
          silent: true,
          emphasis: { disabled: true },
        })
      }
    })

    // 终止节点：结束
    const allDone = Object.values(levelStatusMap).length > 0 && Object.values(levelStatusMap).every(s => s === 'done')
    const anyRejected = Object.values(levelStatusMap).some(s => s === 'rejected')
    const endColor = anyRejected ? '#ff4d4f' : allDone ? '#52c41a' : '#d9d9d9'

    nodes.push({
      name: 'end',
      x: paddingX + xStep * (totalMainNodes - 1),
      y: centerY,
      symbolSize: 52,
      symbol: 'circle',
      emphasis: { disabled: true },
      itemStyle: { color: endColor },
      label: {
        show: true,
        formatter: 'End',
        fontSize: 13,
        color: '#fff',
        fontWeight: 500,
      },
      tooltip: { show: false },
    })

    // ========== 构建连线 ==========
    const edges: any[] = []
    const mainNodeNames = ['start', ...approvalFlow.map(l => `level_${l.level}`), 'end']

    for (let i = 0; i < mainNodeNames.length - 1; i++) {
      edges.push({
        source: mainNodeNames[i],
        target: mainNodeNames[i + 1],
        lineStyle: {
          width: 2,
          color: '#bfbfbf',
        },
        tooltip: { show: false },
        silent: true,
        emphasis: { disabled: true },
      })
    }

    // ========== 配置 ==========
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e8e8e8',
        textStyle: { color: '#333', fontSize: 12 },
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: false,
          data: nodes,
          links: edges,
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [4, 10],
          emphasis: {
            focus: 'adjacency',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.15)',
            },
          },
        },
      ],
    }

    instanceRef.current.setOption(option, true)
  }, [approvalFlow, levelStatusMap, timeline, currentLevel, userNameMap, height])

  // 窗口resize
  useEffect(() => {
    const handleResize = () => instanceRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 卸载
  useEffect(() => {
    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
  }, [])

  // 画布宽度按层级动态调整
  //   const levelCount = approvalFlow.length;
  //   let chartWidth: string;
  //   if (levelCount === 1) chartWidth = 'auto';
  //   else if (levelCount === 2) chartWidth = '50%';
  //   else if (levelCount === 3) chartWidth = '75%';
  //   else chartWidth = '100%';
  //   width: chartWidth,

  return (
    <div
      style={{
        maxWidth: '100%',
        minWidth: 320,
        margin: '0 auto',
        height,
        overflow: 'hidden',
      }}
    >
      <div
        ref={chartRef}
        style={{ width: '100%', height }}
      />
    </div>
  )
}
