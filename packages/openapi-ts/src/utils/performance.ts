const idEnd = (id: string) => `${id}-end`;

const idLength = (id: string) => `${id}-length`;

const idStart = (id: string) => `${id}-start`;

export const Performance = {
  clear: (): void => {
    performance.clearMarks();
    performance.clearMeasures();
  },
  end: (id: string): PerformanceMark => performance.mark(idEnd(id)),
  getEntriesByName: (id: string): PerformanceEntryList =>
    performance.getEntriesByName(idLength(id)),
  measure: (id: string): PerformanceMeasure =>
    performance.measure(idLength(id), idStart(id), idEnd(id)),
  start: (id: string): PerformanceMark => performance.mark(idStart(id)),
};

export class PerformanceReport {
  totalMeasure: PerformanceMeasure;

  constructor({ totalMark }: { totalMark: string }) {
    this.totalMeasure = Performance.measure(totalMark);
  }

  public report({ marks }: { marks: ReadonlyArray<string> }) {
    const totalDuration = Math.ceil(this.totalMeasure.duration * 100) / 100;
    const totalName = this.totalMeasure.name;
    console.warn(
      `${totalName.substring(0, totalName.length - idLength('').length)}: ${totalDuration.toFixed(2)}ms`,
    );

    marks.forEach((mark) => {
      const markMeasure = Performance.measure(mark);
      const markDuration = Math.ceil(markMeasure.duration * 100) / 100;
      const percentage =
        Math.ceil(
          (markMeasure.duration / this.totalMeasure.duration) * 100 * 100,
        ) / 100;
      console.warn(
        `${mark}: ${markDuration.toFixed(2)}ms (${percentage.toFixed(2)}%)`,
      );
    });
  }
}
