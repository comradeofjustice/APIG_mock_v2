import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function CodeSafetyPage() {
  return <AiCapabilityWorkbench module={capabilityModules['code-safety']} />;
}
