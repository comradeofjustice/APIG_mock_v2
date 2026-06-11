import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function McpGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['mcp-guard']} />;
}
