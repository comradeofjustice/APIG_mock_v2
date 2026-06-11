import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function PromptSafetyPage() {
  return <AiCapabilityWorkbench module={capabilityModules['prompt-safety']} />;
}
