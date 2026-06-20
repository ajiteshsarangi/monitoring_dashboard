'use client';

import { useTelemetry } from '../TelemetryContext';
import { DashboardTab } from '../../src/components/DashboardTab';

export default function Page() {
  const telemetryProps = useTelemetry();
  return <DashboardTab {...telemetryProps} />;
}
