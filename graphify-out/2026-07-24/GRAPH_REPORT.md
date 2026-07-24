# Graph Report - D:\coding\VIBECODING\M2A-Co-Biz  (2026-07-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 18 nodes · 19 edges · 4 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- agent
- instructions
- opencode.json
- permission

## God Nodes (most connected - your core abstractions)
1. `instructions` - 5 edges
2. `agent` - 3 edges
3. `build` - 3 edges
4. `permission` - 3 edges
5. `plan` - 3 edges
6. `permission` - 3 edges
7. `plugin` - 2 edges
8. `edit` - 2 edges
9. `bash` - 2 edges
10. `$schema` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 0 thin omitted)

### Community 0 - "agent"
Cohesion: 0.40
Nodes (5): agent, build, plan, mode, mode

### Community 1 - "instructions"
Cohesion: 0.40
Nodes (5): instructions, AGENTS.md, DESIGN.md, PRD.md, SAR.md

### Community 2 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 3 - "permission"
Cohesion: 0.67
Nodes (4): permission, bash, edit, permission

## Knowledge Gaps
- **8 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `AGENTS.md`, `PRD.md`, `SAR.md` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `agent` connect `agent` to `opencode.json`?**
  _High betweenness centrality (0.569) - this node is a cross-community bridge._
- **Why does `instructions` connect `instructions` to `opencode.json`?**
  _High betweenness centrality (0.426) - this node is a cross-community bridge._
- **Why does `plan` connect `agent` to `permission`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `AGENTS.md` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._