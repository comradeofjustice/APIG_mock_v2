import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function McpGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['mcp-guard']} />;
}
