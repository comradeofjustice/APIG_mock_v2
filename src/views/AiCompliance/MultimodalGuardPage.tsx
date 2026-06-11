import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function MultimodalGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['multimodal-guard']} />;
}
