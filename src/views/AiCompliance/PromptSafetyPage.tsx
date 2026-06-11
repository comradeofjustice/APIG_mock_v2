import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function PromptSafetyPage() {
  return <AiCapabilityWorkbench module={capabilityModules['prompt-safety']} />;
}
