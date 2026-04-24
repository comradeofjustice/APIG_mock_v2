import { Layout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  SafetyOutlined,
  HistoryOutlined,
  SettingOutlined,
  SnippetsOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Text } = Typography;

/** 企业后台布局：包含全局导航菜单 */
export default function EnterpriseLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 当前激活的菜单项
  const selectedKey = location.pathname;

  // 菜单点击事件
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#0F1E4A', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        {/* Logo */}
        <Text strong style={{ color: '#fff', fontSize: 18, marginRight: 48 }}>
          变更治理中心
        </Text>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ flex: 1, background: 'transparent', border: 'none' }}
        >
          <Menu.Item key="/" icon={<HomeOutlined />}>
            首页
          </Menu.Item>
          <Menu.Item key="/multimodal-validation" icon={<SafetyOutlined />}>
            多模态验证
          </Menu.Item>
          <Menu.Item key="/verification-history" icon={<HistoryOutlined />}>
            验证历史
          </Menu.Item>
          <Menu.SubMenu
            key="approval-group"
            icon={<SettingOutlined />}
            title="审批与规则"
          >
            <Menu.Item key="/approval/rules" icon={<SettingOutlined />}>
              审批规则管理
            </Menu.Item>
            <Menu.Item key="/approval/task-center" icon={<SnippetsOutlined />}>
              审批任务中心
            </Menu.Item>
            <Menu.Item key="/approval/my-applications" icon={<UserOutlined />}>
              我的申请
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Header>
      <Content style={{ padding: 24, background: '#F7FAFD', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
