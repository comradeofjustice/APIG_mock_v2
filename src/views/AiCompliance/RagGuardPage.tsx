import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function RagGuardPage() {
  return <AiCapabilityWorkbench module={capabilityModules['rag-guard']} />;
}
