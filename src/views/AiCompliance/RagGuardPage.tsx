import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function RagGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['rag-guard']} />;
}
