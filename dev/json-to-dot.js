import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'graph.json'), 'utf-8'));

// --- Filter nodes for readability ---
const threshold = 10; // high-fanout threshold
const filteredSet = new Set();

// Include nodes with children > threshold and their immediate children
for (const n of nodes) {
  const childCount = n.childrenPointers?.length ?? 0;
  if (childCount > threshold) {
    filteredSet.add(n.pointer);
    for (const child of n.childrenPointers || []) {
      filteredSet.add(child);
    }
  }
}

// Filtered nodes list
const filteredNodes = nodes.filter((n) => filteredSet.has(n.pointer));

// Start the .dot file
let dot = 'digraph OpenAPIGraph {\nrankdir=LR;\nnode [style=filled];\n';

// Add nodes with color based on fanout
for (const n of filteredNodes) {
  const childCount = n.childrenPointers?.length ?? 0;
  const color = childCount > 50 ? 'red' : childCount > 20 ? 'orange' : 'lightgray';
  dot += `"${n.pointer}" [label="${n.pointer}\\n${childCount} children", fillcolor=${color}];\n`;
}

// Add edges: node -> its children
for (const n of filteredNodes) {
  for (const child of n.childrenPointers || []) {
    if (filteredSet.has(child)) {
      dot += `"${n.pointer}" -> "${child}";\n`;
    }
  }
}

dot += '}\n';

// Write to a file
fs.writeFileSync(path.resolve(__dirname, 'graph.dot'), dot);
console.log('graph.dot created!');

// Instructions:
// Render with Graphviz:
// dot -Tpng graph.dot -o graph.png
// or
// dot -Tsvg graph.dot -o graph.svg
