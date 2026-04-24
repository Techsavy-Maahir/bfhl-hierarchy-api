const http = require('http');

const tests = [
  { name: "TC1 - Basic Tree",        data: ["A->B", "A->C", "B->D"] },
  { name: "TC2 - Duplicate Edges",   data: ["A->B", "A->B", "A->B"] },
  { name: "TC3 - All Invalid",       data: ["hello", "1->2", "A->", "A->A", "AB->C"] },
  { name: "TC4 - Simple Cycle",      data: ["X->Y", "Y->Z", "Z->X"] },
  { name: "TC6 - Multi-Parent",      data: ["A->D", "B->D", "D->E"] },
  { name: "TC7 - Pure Cycle (no root)", data: ["A->B", "B->C", "C->A"] },
  { name: "TC9 - Mixed Everything",  data: ["A->B","A->C","B->D","C->E","E->F","X->Y","Y->Z","Z->X","G->H","G->H","G->I","hello","1->2","A->"] },
  { name: "FINAL - Cycle+Orphan+Multi+Tree", data: ["A->B","B->A","C->D","E->D","X->Y","Y->Z"] }
];

function post(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ data });
    const req = http.request({
      hostname: 'localhost', port: 3000, path: '/bfhl', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const t of tests) {
    const r = await post(t.data);
    const s = r.summary;
    console.log(`\n[${t.name}]`);
    console.log(`  Trees: ${s.total_trees} | Cycles: ${s.total_cycles} | Largest: "${s.largest_tree_root}"`);
    console.log(`  Invalid: [${r.invalid_entries.join(', ')}] | Duplicates: [${r.duplicate_edges.join(', ')}]`);
    console.log(`  Hierarchies: ${r.hierarchies.map(h => h.has_cycle ? `${h.root}(cycle)` : `${h.root}(d=${h.depth})`).join(', ')}`);
  }
  console.log('\n✅ All tests completed.');
  process.exit(0);
})();
