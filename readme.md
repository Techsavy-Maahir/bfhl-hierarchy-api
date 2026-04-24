# Hierarchy Processing REST API (BFHL Challenge)

A Node.js (Express) REST API that processes directed edge data to build hierarchies, detect cycles, handle multi-parent conflicts, and provide summary statistics.

## Getting Started

### Prerequisites

- Node.js v16+ installed on your system.

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will be available at `http://localhost:3000`.

---

## Hosted API

Base URL:
```
https://bfhl-api-90c6.onrender.com
```

Endpoint:
```
POST /bfhl
```

---

## API Documentation

### POST /bfhl

Processes graph edges and returns hierarchies, cycle detection, and summary.

**Request Body:**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

---

### Example 1 — Basic Tree

**Input:**
```json
{ "data": ["A->B", "A->C", "B->D"] }
```

**Output:**
```json
{
  "user_id": "yourname_ddmmyyyy",
  "email_id": "your@email.com",
  "college_roll_number": "YOUR_ROLL",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

### Example 2 — Cycle Detection

**Input:**
```json
{ "data": ["X->Y", "Y->Z", "Z->X"] }
```

**Output:**
```json
{
  "hierarchies": [
    {
      "root": "X",
      "tree": {},
      "has_cycle": true
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 0,
    "total_cycles": 1,
    "largest_tree_root": ""
  }
}
```

---

### Example 3 — Invalid Entries & Duplicates

**Input:**
```json
{ "data": ["A->B", "A->B", "hello", "1->2"] }
```

**Output:**
```json
{
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": {} } },
      "depth": 2
    }
  ],
  "invalid_entries": ["hello", "1->2"],
  "duplicate_edges": ["A->B"],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

### Example 4 — Multi-Parent Conflict

**Input:**
```json
{ "data": ["A->D", "B->D", "D->E"] }
```

`B->D` is ignored (D already has parent A), but B is still preserved as an isolated root.

**Output:**
```json
{
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "D": { "E": {} } } },
      "depth": 3
    },
    {
      "root": "B",
      "tree": { "B": {} },
      "depth": 1
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 2,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## Testing with PowerShell

```powershell
Invoke-WebRequest -Uri http://localhost:3000/bfhl `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"data": ["A->B", "A->C", "B->D"]}'
```

## Testing with curl (Linux/Mac)

```bash
curl -X POST http://localhost:3000/bfhl \
     -H "Content-Type: application/json" \
     -d '{"data": ["A->B", "A->C", "B->D"]}'
```

---

## Core Logic Rules

| Rule | Behaviour |
|------|-----------|
| **Validation** | Edges must match `X->Y` (single uppercase A–Z). Self-loops rejected. |
| **Duplicates** | First occurrence kept; subsequent occurrences added once to `duplicate_edges`. |
| **Multi-Parent** | If a child already has a parent, the new edge is ignored. The rejected parent is still tracked as a node. |
| **Cycle Detection** | DFS with shared recursion stack. Cycles returned with `has_cycle: true`, no `depth`. |
| **Tree Building** | Recursive nested object. Includes `depth` = longest path node count. |
| **Summary** | `largest_tree_root` = max depth tree; tie-break = lexicographically smaller root. |

---

## Response Schema

```json
{
  "user_id": "string",
  "email_id": "string",
  "college_roll_number": "string",
  "hierarchies": [
    {
      "root": "string",
      "tree": {},
      "depth": "number (trees only)",
      "has_cycle": "true (cycles only)"
    }
  ],
  "invalid_entries": ["string"],
  "duplicate_edges": ["string"],
  "summary": {
    "total_trees": "number",
    "total_cycles": "number",
    "largest_tree_root": "string"
  }
}
```
