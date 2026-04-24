const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/bfhl', (req, res) => {
    console.log('Received payload:', req.body);
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ is_success: false, message: "Invalid input format." });
    }

    const seenEdges = new Set();
    const duplicateSet = new Set();
    const duplicate_edges = [];
    const invalid_entries = [];
    const parentMap = new Map();
    const graph = new Map();
    const nodes = new Set();
    const childrenSet = new Set();

    data.forEach(item => {
        const raw = item;
        const entry = typeof item === 'string' ? item.trim() : String(item).trim();

        const match = entry.match(/^([A-Z])->([A-Z])$/);
        if (!match) {
            invalid_entries.push(String(raw));
            return;
        }

        const [_, parent, child] = match;
        if (parent === child) {
            invalid_entries.push(String(raw));
            return;
        }

        if (seenEdges.has(entry)) {
            if (!duplicateSet.has(entry)) {
                duplicate_edges.push(entry);
                duplicateSet.add(entry);
            }
            return;
        }
        seenEdges.add(entry);

        if (parentMap.has(child)) {
            nodes.add(parent);
            return;
        }

        parentMap.set(child, parent);
        if (!graph.has(parent)) graph.set(parent, []);
        graph.get(parent).push(child);
        nodes.add(parent);
        nodes.add(child);
        childrenSet.add(child);
    });

    const roots = Array.from(nodes).filter(node => !childrenSet.has(node)).sort();

    const hierarchies = [];
    const globalVisited = new Set();
    let total_trees = 0;
    let total_cycles = 0;
    let maxDepthOverall = 0;
    let largest_tree_root = "";

    function processComponent(node, visited, stack) {
        if (stack.has(node)) return { isCycle: true };
        if (visited.has(node)) return { tree: {}, depth: 0 };

        visited.add(node);
        stack.add(node);
        globalVisited.add(node);

        const children = graph.get(node) || [];
        const tree = {};
        let maxDepth = 1;

        for (const child of children) {
            const res = processComponent(child, visited, stack);
            if (res.isCycle) return { isCycle: true };

            tree[child] = res.tree;
            maxDepth = Math.max(maxDepth, 1 + res.depth);
        }

        stack.delete(node);
        return { tree, depth: maxDepth };
    }

    while (globalVisited.size < nodes.size) {
        let root = roots.find(r => !globalVisited.has(r));

        if (!root) {
            root = Array.from(nodes)
                .filter(n => !globalVisited.has(n))
                .sort()[0];
        }

        if (!root) break;

        const result = processComponent(root, new Set(), new Set());

        if (result.isCycle) {
            total_cycles++;
            hierarchies.push({ root, tree: {}, has_cycle: true });
        } else {
            total_trees++;
            hierarchies.push({ root, tree: { [root]: result.tree }, depth: result.depth });

            if (result.depth > maxDepthOverall) {
                maxDepthOverall = result.depth;
                largest_tree_root = root;
            } else if (result.depth === maxDepthOverall) {
                if (!largest_tree_root || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }
    }

    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

    const response = {
        user_id: "maahir_rayaan_29012006",
        email_id: "ms4045@srmist.edu.in",
        college_roll_number: "RA2311003020695",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
