import colors from 'ansi-colors';

interface LoggerEvent {
  end?: PerformanceMark;
  events: Array<LoggerEvent>;
  name: string;
  start: PerformanceMark;
}

interface Severity {
  color: colors.StyleFunction;
  type: 'duration' | 'percentage';
}

interface StoredEventResult {
  position: ReadonlyArray<number>;
}

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

const getSeverity = (
  duration: number,
  percentage: number,
): Severity | undefined => {
  if (duration > 200) {
    return {
      color: colors.red,
      type: 'duration',
    };
  }
  if (percentage > 30) {
    return {
      color: colors.red,
      type: 'percentage',
    };
  }
  if (duration > 50) {
    return {
      color: colors.yellow,
      type: 'duration',
    };
  }
  if (percentage > 10) {
    return {
      color: colors.yellow,
      type: 'percentage',
    };
  }
  return;
};

export class Logger {
  private events: Array<LoggerEvent> = [];

  private end(result: StoredEventResult): void {
    let event: LoggerEvent | undefined;
    let events = this.events;
    for (const index of result.position) {
      event = events[index];
      if (event?.events) {
        events = event.events;
      }
    }
    if (event && !event.end) {
      event.end = performance.mark(idEnd(event.name));
    }
  }

  report() {
    const firstEvent = this.events[0];
    if (!firstEvent) return;
    const lastEvent = this.events[this.events.length - 1]!;
    const measure = performance.measure(
      idLength('root'),
      idStart(firstEvent.name),
      idEnd(lastEvent.name),
    );
    this.reportEvent({
      end: lastEvent.end,
      events: this.events,
      indent: 0,
      measure,
      name: 'root',
      start: firstEvent!.start,
    });
  }

  private reportEvent({
    indent,
    ...parent
  }: LoggerEvent & {
    indent: number;
    measure: PerformanceMeasure;
  }): void {
    const color = !indent ? colors.cyan : colors.gray;
    const lastIndex = parent.events.length - 1;

    parent.events.forEach((event, index) => {
      const measure = performance.measure(
        idLength(event.name),
        idStart(event.name),
        idEnd(event.name),
      );
      const duration = Math.ceil(measure.duration * 100) / 100;
      const percentage =
        Math.ceil((measure.duration / parent.measure.duration) * 100 * 100) /
        100;
      const severity = indent ? getSeverity(duration, percentage) : undefined;

      let durationLabel = `${duration.toFixed(2).padStart(8)}ms`;
      if (severity?.type === 'duration') {
        durationLabel = severity.color(durationLabel);
      }

      const branch = index === lastIndex ? '└─ ' : '├─ ';
      const prefix = !indent ? '' : '│  '.repeat(indent - 1) + branch;
      const maxLength = 30 - prefix.length;

      const percentageBranch = !indent ? '' : '↳ ';
      const percentagePrefix = indent
        ? ' '.repeat(indent - 1) + percentageBranch
        : '';
      let percentageLabel = `${percentagePrefix}${percentage.toFixed(2)}%`;
      if (severity?.type === 'percentage') {
        percentageLabel = severity.color(percentageLabel);
      }
      console.log(
        colors.gray(prefix) +
          color(
            `${event.name.padEnd(maxLength)} ${durationLabel} (${percentageLabel})`,
          ),
      );
      this.reportEvent({ ...event, indent: indent + 1, measure });
    });
  }

  private start(name: string): PerformanceMark {
    return performance.mark(idStart(name));
  }

  private storeEvent({
    result,
    ...event
  }: Pick<LoggerEvent, 'events' | 'name' | 'start'> & {
    result: StoredEventResult;
  }): void {
    const lastEventIndex = event.events.length - 1;
    const lastEvent = event.events[lastEventIndex];
    if (lastEvent && !lastEvent.end) {
      result.position = [...result.position, lastEventIndex];
      this.storeEvent({ ...event, events: lastEvent.events, result });
      return;
    }
    const length = event.events.push({ ...event, events: [] });
    result.position = [...result.position, length - 1];
  }

  timeEvent(name: string) {
    const start = this.start(name);
    const event: LoggerEvent = {
      events: this.events,
      name,
      start,
    };
    const result: StoredEventResult = {
      position: [],
    };
    this.storeEvent({ ...event, result });
    return {
      mark: start,
      timeEnd: () => this.end(result),
    };
  }
}
