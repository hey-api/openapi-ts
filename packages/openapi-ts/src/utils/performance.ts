const idEnd = (id: string) => `${id}-end`;

const idLength = (id: string) => `${id}-length`;

const idStart = (id: string) => `${id}-start`;

export const Performance = {
  clear: () => {
    performance.clearMarks();
    performance.clearMeasures();
  },
  end: (id: string) => {
    performance.mark(idEnd(id));
  },
  getEntriesByName: (id: string) => performance.getEntriesByName(idLength(id)),
  measure: (id: string) => {
    performance.measure(idLength(id), idStart(id), idEnd(id));
  },
  start: (id: string) => {
    performance.mark(idStart(id));
  },
};
