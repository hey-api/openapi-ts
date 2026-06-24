import fs from 'node:fs';
import path from 'node:path';

// Load your exported graph
const nodes = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, 'graph.json'), 'utf-8'));

// Annotate nodes with children count
const annotatedNodes = nodes.map((n) => ({
  childrenCount: n.childrenPointers?.length ?? 0,
  pointer: n.pointer,
}));

// Sort by childrenCount descending
annotatedNodes.sort((a, b) => b.childrenCount - a.childrenCount);

// Print top 20 hotspots
console.log('Top 20 potential bottleneck nodes:\n');
annotatedNodes.slice(0, 20).forEach((n) => {
  console.log(`${n.pointer} — children: ${n.childrenCount}`);
});
