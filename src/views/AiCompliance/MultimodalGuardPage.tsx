import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function MultimodalGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['multimodal-guard']} />;
}
