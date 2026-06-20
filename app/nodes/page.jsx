'use client';

import { useTelemetry } from '../TelemetryContext';
import { NodeFleetTab } from '../../src/components/NodeFleetTab';

export default function Page() {
  const telemetryProps = useTelemetry();
  return <NodeFleetTab {...telemetryProps} />;
}
