'use client';

import { useTelemetry } from '../TelemetryContext';
import { AlertLogsTab } from '../../src/components/AlertLogsTab';

export default function Page() {
  const telemetryProps = useTelemetry();
  return <AlertLogsTab {...telemetryProps} />;
}
