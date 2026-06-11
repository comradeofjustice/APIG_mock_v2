import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function CodeSafetyPage() {
  return <AiCapabilityWorkbench module={capabilityModules['code-safety']} />;
}
