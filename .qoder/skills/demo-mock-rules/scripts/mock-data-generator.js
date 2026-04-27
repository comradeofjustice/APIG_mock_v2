/**
 * Mock 数据生成器
 * 用于生成标准化的 Demo Mock 数据
 *
 * 用法:
 *   node mock-data-generator.js [type] [count]
 *
 * 类型:
 *   user       - 用户数据
 *   approval   - 审批任务数据
 *   rule       - 审批规则数据
 *   log        - 操作日志数据
 *   all        - 生成所有类型 (默认)
 *
 * 示例:
 *   node mock-data-generator.js approval 20
 *   node mock-data-generator.js user 10
 */

const args = process.argv.slice(2);
const type = args[0] || 'all';
const count = parseInt(args[1], 10) || 15;

// ================ 工具函数 ================

const MockUtil = {
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  range(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  date(start, end) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return new Date(s + Math.random() * (e - s)).toISOString().split('T')[0];
  },

  phone() {
    const prefixes = ['138', '139', '150', '159', '186', '188', '133', '135'];
    return this.pick(prefixes) + String(this.range(10000000, 99999999));
  },

  companyName() {
    const prefixes = ['深信服', '奇安信', '绿盟', '启明星辰', '天融信', '安恒', '360', '阿里云'];
    const suffixes = ['科技', '信息安全', '数据安全', '网络安全', '云计算', '通信技术'];
    return this.pick(prefixes) + this.pick(suffixes);
  },
};

// ================ 数据生成器 ================

const generators = {

  // 用户数据
  user(n) {
    const roles = ['管理员', '审计员', '操作员', '查看员'];
    const statuses = ['active', 'inactive', 'locked'];
    return Array.from({ length: n }, (_, i) => ({
      id: MockUtil.uuid(),
      name: `用户_${String(i + 1).padStart(3, '0')}`,
      account: `user${i + 1}`,
      role: MockUtil.pick(roles),
      phone: MockUtil.phone(),
      email: `user${i + 1}@company.com`,
      status: MockUtil.pick(statuses),
      createTime: MockUtil.date('2025-01-01', '2026-04-24'),
      lastLogin: MockUtil.date('2026-01-01', '2026-04-24'),
    }));
  },

  // 审批任务数据
  approval(n) {
    const types = ['规则审批', '权限申请', '策略变更', '资源申请', '配置变更'];
    const priorities = ['high', 'medium', 'low'];
    const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
    const priorityLabel = { high: '紧急', medium: '普通', low: '低优先级' };
    const statusLabel = { pending: '待审批', approved: '已通过', rejected: '已驳回', cancelled: '已撤销' };

    return Array.from({ length: n }, (_, i) => ({
      id: `TASK-${String(i + 1).padStart(4, '0')}`,
      title: `${MockUtil.pick(types)}_${i + 1}`,
      type: MockUtil.pick(types),
      applicant: `用户_${String(MockUtil.range(1, 30)).padStart(3, '0')}`,
      priority: MockUtil.pick(priorities),
      priorityLabel: null, // 由前端映射
      status: MockUtil.pick(statuses),
      statusLabel: null,
      submitTime: MockUtil.date('2026-03-01', '2026-04-24'),
      completeTime: Math.random() > 0.3 ? MockUtil.date('2026-03-15', '2026-04-24') : null,
      description: `这是第 ${i + 1} 条审批任务的详细说明，包含必要的审批信息和上下文。`,
    }));
  },

  // 审批规则数据
  rule(n) {
    const types = ['数据脱敏', '访问控制', '操作审计', '风险阻断', '合规检查'];
    const statuses = ['enabled', 'disabled', 'draft'];
    const statusLabel = { enabled: '已启用', disabled: '已停用', draft: '草稿' };

    return Array.from({ length: n }, (_, i) => ({
      id: `RULE-${String(i + 1).padStart(4, '0')}`,
      name: `${MockUtil.pick(types)}规则_${i + 1}`,
      type: MockUtil.pick(types),
      status: MockUtil.pick(statuses),
      statusLabel: null,
      priority: MockUtil.range(1, 5),
      creator: `用户_${String(MockUtil.range(1, 30)).padStart(3, '0')}`,
      createTime: MockUtil.date('2026-01-01', '2026-04-01'),
      updateTime: MockUtil.date('2026-03-01', '2026-04-24'),
      hitCount: MockUtil.range(0, 9999),
      description: `规则 ${i + 1} 的描述信息，定义了具体的检测条件和响应动作。`,
    }));
  },

  // 操作日志数据
  log(n) {
    const actions = ['create', 'update', 'delete', 'approve', 'reject', 'export', 'import'];
    const modules = ['审批管理', '规则管理', '用户管理', '系统设置', '审计日志'];
    const actionLabel = {
      create: '创建', update: '修改', delete: '删除',
      approve: '通过', reject: '驳回', export: '导出', import: '导入',
    };

    return Array.from({ length: n }, (_, i) => ({
      id: `LOG-${String(i + 1).padStart(6, '0')}`,
      operator: `用户_${String(MockUtil.range(1, 30)).padStart(3, '0')}`,
      module: MockUtil.pick(modules),
      action: MockUtil.pick(actions),
      actionLabel: null,
      target: `${MockUtil.pick(modules)}_${MockUtil.range(1, 50)}`,
      result: Math.random() > 0.1 ? 'success' : 'fail',
      ip: `192.168.${MockUtil.range(1, 255)}.${MockUtil.range(1, 255)}`,
      time: MockUtil.date('2026-04-01', '2026-04-24') + ' ' +
        String(MockUtil.range(8, 18)).padStart(2, '0') + ':' +
        String(MockUtil.range(0, 59)).padStart(2, '0'),
    }));
  },
};

// ================ 输出 ================

function output(name, data) {
  // 补充映射字段
  if (data[0] && data[0].priorityLabel) {
    const pl = { high: '紧急', medium: '普通', low: '低优先级' };
    data.forEach(d => { d.priorityLabel = pl[d.priority] || d.priority; });
  }
  if (data[0] && data[0].statusLabel) {
    const sl = {
      enabled: '已启用', disabled: '已停用', draft: '草稿',
      pending: '待审批', approved: '已通过', rejected: '已驳回', cancelled: '已撤销',
    };
    data.forEach(d => { d.statusLabel = sl[d.status] || d.status; });
  }
  if (data[0] && data[0].actionLabel) {
    const al = {
      create: '创建', update: '修改', delete: '删除',
      approve: '通过', reject: '驳回', export: '导出', import: '导入',
    };
    data.forEach(d => { d.actionLabel = al[d.action] || d.action; });
  }

  console.log(`\n=== ${name} (${data.length} 条) ===`);
  console.log(JSON.stringify(data, null, 2));
  console.log('');
}

// ================ 主入口 ================

if (type === 'all') {
  output('用户数据', generators.user(count));
  output('审批任务', generators.approval(count));
  output('审批规则', generators.rule(count));
  output('操作日志', generators.log(count));
} else if (generators[type]) {
  output(type + '数据', generators[type](count));
} else {
  console.error(`未知类型: ${type}`);
  console.error('可用类型: user, approval, rule, log, all');
  process.exit(1);
}

console.log('✅ Mock 数据生成完成');
