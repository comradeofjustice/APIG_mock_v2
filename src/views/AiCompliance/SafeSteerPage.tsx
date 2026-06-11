import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function SafeSteerPage() {
  return <AiCapabilityWorkbench module={capabilityModules['safe-steer']} />;
}
