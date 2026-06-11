import { useState, type CSSProperties, type ReactNode } from 'react';
import { Avatar, Grid } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ApartmentOutlined,
  BellOutlined,
  BlockOutlined,
  CloseOutlined,
  ControlOutlined,
  DatabaseOutlined,
  DownOutlined,
  ExpandAltOutlined,
  HomeOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { enterpriseTheme } from './theme.config';
import brandShieldIcon from '../assets/brand-shield.jpg';
import './EnterpriseLayout.css';

type NavLeaf = {
  key: string;
  label: string;
  path: string;
  breadcrumbs: string[];
};

type NavSection = {
  key: string;
  label: string;
  path?: string;
  icon: ReactNode;
  breadcrumbs?: string[];
  children?: NavLeaf[];
};

type NavTarget = {
  sectionKey: string;
  label: string;
  path: string;
  breadcrumbs: string[];
  isChild: boolean;
};

const navSections: NavSection[] = [
  {
    key: 'query-analysis',
    label: '查询分析',
    path: '/database-service/manage?section=query-analysis',
    breadcrumbs: ['查询分析'],
    icon: <SearchOutlined />,
  },
  {
    key: 'data-recognition',
    label: '数据识别',
    path: '/database-service/debug?section=data-recognition',
    breadcrumbs: ['数据识别'],
    icon: <DatabaseOutlined />,
  },
  {
    key: 'data-desensitization',
    label: '数据脱敏',
    path: '/verification-history?section=data-desensitization',
    breadcrumbs: ['数据脱敏'],
    icon: <ApartmentOutlined />,
  },
  {
    key: 'data-watermark',
    label: '数据水印',
    path: '/api-management?section=data-watermark',
    breadcrumbs: ['数据水印'],
    icon: <BlockOutlined />,
  },
  {
    key: 'policy-management',
    label: '策略管理',
    path: '/approval/rules?section=policy-management',
    breadcrumbs: ['策略管理'],
    icon: <ControlOutlined />,
  },
  {
    key: 'ai-compliance',
    label: 'AI合规',
    icon: <SafetyCertificateOutlined />,
    children: [
      {
        key: 'prompt-safety',
        label: '提示词安全防护',
        path: '/ai-compliance/prompt-safety',
        breadcrumbs: ['AI合规', '提示词安全防护'],
      },
      {
        key: 'code-safety',
        label: '代码安全防护',
        path: '/ai-compliance/code-safety',
        breadcrumbs: ['AI合规', '代码安全防护'],
      },
      {
        key: 'multimodal-guard',
        label: '多模态内容防护',
        path: '/ai-compliance/multimodal-guard',
        breadcrumbs: ['AI合规', '多模态内容防护'],
      },
      {
        key: 'safe-steer',
        label: '推理时安全引导',
        path: '/ai-compliance/safe-steer',
        breadcrumbs: ['AI合规', '推理时安全引导'],
      },
      {
        key: 'content-tagging',
        label: '内容分类与标签',
        path: '/ai-compliance/content-tagging',
        breadcrumbs: ['AI合规', '内容分类与标签'],
      },
      {
        key: 'rag-guard',
        label: 'RAG防护',
        path: '/ai-compliance/rag-guard',
        breadcrumbs: ['AI合规', 'RAG防护'],
      },
      {
        key: 'mcp-guard',
        label: 'MCP防护',
        path: '/ai-compliance/mcp-guard',
        breadcrumbs: ['AI合规', 'MCP防护'],
      },
    ],
  },
  {
    key: 'notification-delivery',
    label: '通知外送',
    path: '/verification-history?section=notification-delivery',
    breadcrumbs: ['通知外送'],
    icon: <BellOutlined />,
  },
  {
    key: 'system-management',
    label: '系统管理',
    path: '/sql-to-api?section=system-management',
    breadcrumbs: ['系统管理'],
    icon: <SettingOutlined />,
  },
];

const defaultTarget: NavTarget = {
  sectionKey: 'ai-compliance',
  label: '提示词安全防护',
  path: '/ai-compliance/prompt-safety',
  breadcrumbs: ['AI合规', '提示词安全防护'],
  isChild: true,
};

function resolveNavTarget(pathname: string, search: string): NavTarget {
  const current = `${pathname}${search}`;
  const targets: NavTarget[] = [];

  navSections.forEach((section) => {
    if (section.path) {
      targets.push({
        sectionKey: section.key,
        label: section.label,
        path: section.path,
        breadcrumbs: section.breadcrumbs ?? [section.label],
        isChild: false,
      });
    }

    section.children?.forEach((child) => {
      targets.push({
        sectionKey: section.key,
        label: child.label,
        path: child.path,
        breadcrumbs: child.breadcrumbs,
        isChild: true,
      });
    });
  });

  const exactTarget = targets.find((item) => item.path === current);
  if (exactTarget) return exactTarget;

  if (pathname === '/') return defaultTarget;

  const matchByBasePath = targets
    .map((item) => ({ item, basePath: item.path.split('?')[0] }))
    .filter(({ basePath }) => {
      if (basePath === '/') return pathname === '/';
      return pathname === basePath || pathname.startsWith(`${basePath}/`);
    })
    .sort((left, right) => right.basePath.length - left.basePath.length)[0];

  return matchByBasePath?.item ?? defaultTarget;
}

export default function EnterpriseLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();

  const activeTarget = resolveNavTarget(location.pathname, location.search);
  const activeSectionKey = activeTarget.sectionKey;

  const [manualCollapsed, setManualCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('ai-compliance');

  const responsiveCollapsed = !screens.lg;
  const collapsed = responsiveCollapsed || manualCollapsed;

  const shellStyle = {
    '--shell-primary': enterpriseTheme.primaryColor,
    '--shell-header': '#2C3156',
    '--shell-canvas': '#F4F6FB',
    '--shell-border': '#E7EBF3',
    '--shell-text': '#2E3550',
    '--shell-muted': '#8C95A8',
  } as CSSProperties;

  const handleSectionClick = (section: NavSection) => {
    if (section.children?.length) {
      if (collapsed) {
        navigate(section.children[0].path);
        return;
      }

      setExpandedSection((current) => (current === section.key ? '' : section.key));

      if (activeSectionKey !== section.key) {
        navigate(section.children[0].path);
      }

      return;
    }

    if (section.path) {
      navigate(section.path);
    }
  };

  const handleChildClick = (path: string) => {
    setExpandedSection('ai-compliance');
    navigate(path);
  };

  return (
    <div
      className={`enterprise-shell ${collapsed ? 'is-collapsed' : ''}`}
      style={shellStyle}
    >
      <header className="enterprise-shell__header">
        <button
          type="button"
          className="enterprise-shell__brand"
          onClick={() => navigate(defaultTarget.path)}
        >
          <span className="enterprise-shell__brand-mark">
            <img
              src={brandShieldIcon}
              alt=""
              aria-hidden="true"
              className="enterprise-shell__brand-mark-image"
            />
          </span>
          <span className="enterprise-shell__brand-copy">
            恒脑安全垂域大模型系统
          </span>
        </button>

        <div className="enterprise-shell__header-tools">
          <button type="button" className="enterprise-shell__icon-button" aria-label="扩展">
            <ExpandAltOutlined />
          </button>
          <button type="button" className="enterprise-shell__icon-button" aria-label="关闭">
            <CloseOutlined />
          </button>
          <button type="button" className="enterprise-shell__user-chip">
            <Avatar size={34} className="enterprise-shell__avatar" icon={<UserOutlined />} />
            <span className="enterprise-shell__user-name">admin</span>
            <DownOutlined className="enterprise-shell__user-arrow" />
          </button>
        </div>
      </header>

      <div className="enterprise-shell__workspace">
        <aside className="enterprise-shell__sider">
          <nav className="enterprise-shell__nav">
            {navSections.map((section) => {
              const hasChildren = Boolean(section.children?.length);
              const isActive = activeSectionKey === section.key;
              const isExpanded = hasChildren && !collapsed && (expandedSection === section.key || isActive);

              return (
                <section
                  key={section.key}
                  className={[
                    'nav-section',
                    isActive ? 'nav-section--active' : '',
                    isExpanded ? 'nav-section--expanded' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className="nav-section__trigger"
                    onClick={() => handleSectionClick(section)}
                    title={collapsed ? section.label : undefined}
                  >
                    <span className="nav-section__icon">{section.icon}</span>
                    <span className="nav-section__label">{section.label}</span>
                    <DownOutlined className="nav-section__chevron" />
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="nav-section__children">
                      {section.children?.map((child) => {
                        const childActive = activeTarget.path === child.path || (location.pathname === '/' && child.path === defaultTarget.path);

                        return (
                          <button
                            key={child.key}
                            type="button"
                            className={`nav-section__child ${childActive ? 'nav-section__child--active' : ''}`}
                            onClick={() => handleChildClick(child.path)}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>

          <button
            type="button"
            className="enterprise-shell__collapse"
            onClick={() => setManualCollapsed((current) => !current)}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </aside>

        <main className="enterprise-shell__main">
          <div className="enterprise-shell__notice">
            <div className="enterprise-shell__notice-message">
              维保期将于92天后过期，升级功能将被锁定，您将无法享受产品技术支持、故障维修等售后服务！
            </div>
            <div className="enterprise-shell__notice-meta">
              <span>1/2</span>
              <button type="button" className="enterprise-shell__mini-button" aria-label="上一条">
                <LeftOutlined />
              </button>
              <button type="button" className="enterprise-shell__mini-button" aria-label="下一条">
                <RightOutlined />
              </button>
              <button type="button" className="enterprise-shell__mini-button" aria-label="关闭公告">
                <CloseOutlined />
              </button>
            </div>
          </div>

          <div className="enterprise-shell__breadcrumb">
            <HomeOutlined className="enterprise-shell__breadcrumb-home" />
            {activeTarget.breadcrumbs.map((item, index) => (
              <span key={`${item}-${index}`} className="enterprise-shell__breadcrumb-item">
                <span className="enterprise-shell__breadcrumb-divider">/</span>
                <span className={index === activeTarget.breadcrumbs.length - 1 ? 'is-current' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>

          <div className="enterprise-shell__page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
