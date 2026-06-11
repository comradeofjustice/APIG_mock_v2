import AiCapabilityWorkbench from './AiCapabilityWorkbench';
import { capabilityModules } from './capabilityData';

export default function ContentTaggingPage() {
  return <AiCapabilityWorkbench module={capabilityModules['content-tagging']} />;
}
