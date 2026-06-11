import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function A2aGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['a2a-guard']} />;
}
