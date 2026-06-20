'use client';

import { useTelemetry } from '../TelemetryContext';
import { LinuxFleetTab } from '../../src/components/LinuxFleetTab';

export default function Page() {
  const telemetryProps = useTelemetry();
  return <LinuxFleetTab {...telemetryProps} />;
}
