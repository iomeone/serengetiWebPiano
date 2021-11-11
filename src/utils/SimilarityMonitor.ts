import { MonitorMode } from 'models/SimilarityMonitor';

export function similarityMonitorModeToNumber(mode: MonitorMode): number {
  return mode as number;
}

export function numberToSimilarityMonitorMode(modeNum: number): MonitorMode {
  return modeNum as MonitorMode;
}

export function similarityMonitorModeToStr(mode: MonitorMode): string {
  return MonitorMode[mode];
}
