// Graphify Plugin — OpenCode Knowledge Graph Integration
// Integrates OpenCode with the M2A Co-Biz knowledge graph at graphify-out/
// Provides `graphify_query` tool for codebase architecture exploration.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');

function loadGraph() {
  const gPath = join(ROOT, 'graphify-out/graph.json');
  const rPath = join(ROOT, 'graphify-out/GRAPH_REPORT.md');
  if (!existsSync(gPath)) return null;
  return {
    data: JSON.parse(readFileSync(gPath, 'utf-8')),
    report: existsSync(rPath) ? readFileSync(rPath, 'utf-8') : '',
  };
}

function searchNodes(query, nodes, edges) {
  const q = query.toLowerCase();
  const hits = nodes.filter(n =>
    [n.label, n.norm_label, n.community_name, n.file_type, n.source_file]
      .some(f => f && f.toLowerCase().includes(q))
  );
  const ids = new Set(hits.map(n => n.id));
  return {
    nodes: hits,
    edges: edges.filter(e => ids.has(e.source) || ids.has(e.target)),
  };
}

/** @type {import('@opencode-ai/plugin').Plugin} */
const server = async () => ({
  tools: {
    graphify_query: {
      description: 'Cari informasi arsitektur, relasi kode, dan struktur project M2A Co-Biz dari knowledge graph. Gunakan ini untuk menjawab pertanyaan tentang bagaimana suatu fitur bekerja atau bagaimana relasi antar modul.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata kunci pencarian — nama modul, file, fitur, atau kata kunci arsitektur. Contoh: "auth", "checkout", "database", "seller", "Gemini", "security", "file: dashboard"',
          },
        },
        required: ['query'],
      },
      execute: async ({ query }) => {
        const graph = loadGraph();
        if (!graph) return 'Knowledge graph belum digenerate. Jalankan graphify dulu.';

        if (query === '--summary') {
          const communities = [...new Set(graph.data.nodes.map(n => n.community_name).filter(Boolean))];
          return [
            `## Ringkasan Knowledge Graph`,
            ``,
            `**Total Node:** ${graph.data.nodes.length}`,
            `**Total Relasi:** ${graph.data.edges.length}`,
            `**Komunitas (${communities.length}):**`,
            ...communities.map(c => `- ${c}`),
            ``,
            `---`,
            `**Laporan Proyek:**`,
            graph.report,
          ].join('\n');
        }

        const result = searchNodes(query, graph.data.nodes, graph.data.edges);
        if (!result.nodes.length) return `Tidak ada hasil untuk "${query}". Coba: auth, catalog, checkout, seller, database, admin, bendahara, AI, file: namafile`;

        const groups = {};
        for (const n of result.nodes) {
          const g = n.community_name || 'Lainnya';
          (groups[g] ??= []).push(n);
        }

        let out = `## Knowledge Graph: "${query}"\n\nDitemukan ${result.nodes.length} node dan ${result.edges.length} relasi.\n\n`;
        for (const [g, nodes] of Object.entries(groups)) {
          out += `### ${g}\n`;
          for (const n of nodes) {
            out += `- **${n.label}**`;
            if (n.source_file) out += ` — \`${n.source_file}:${n.source_location || '?'}\``;
            if (n.file_type) out += ` (${n.file_type})`;
            out += '\n';
          }
          out += '\n';
        }

        if (result.edges.length) {
          out += `### Relasi (${result.edges.length})\n`;
          for (const e of result.edges) {
            const s = result.nodes.find(n => n.id === e.source)?.label || e.source;
            const t = result.nodes.find(n => n.id === e.target)?.label || e.target;
            out += `- ${s} → ${t}\n`;
          }
        }

        return out;
      },
    },
  },
});

export default {
  id: 'm2a.graphify',
  server,
};
