import AiCapabilityWorkbench from '@/views/Home/AiCapabilityWorkbench';
import { capabilityModules } from '@/views/Home/capabilityData';

export default function ContentTaggingPage() {
  return <AiCapabilityWorkbench module={capabilityModules['content-tagging']} />;
}
