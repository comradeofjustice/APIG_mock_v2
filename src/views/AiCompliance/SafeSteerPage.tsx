import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function SafeSteerPage() {
  return <AiCapabilityWorkbench module={capabilityModules['safe-steer']} />;
}
