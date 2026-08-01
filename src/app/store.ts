import { create } from 'zustand'
import { EMPTY_DIAGRAM, NODE_TYPE_LABELS } from '../domain/catalog'
import type {
  ActiveStarter,
  DiagramDocument,
  DiagramNode,
  Mode,
  NodeType,
} from '../domain/types'
import { loadDiagram } from '../persistence/diagramStorage'
import { loadMeta } from '../persistence/sessionMeta'
import {
  healthCheck,
  type Finding,
} from '../simulation/health/healthCheck'

type SetDiagramMeta = {
  activeStarter?: ActiveStarter
}

type AppState = {
  mode: Mode
  diagram: DiagramDocument
  selectedNodeId: string | null
  activeStarter: ActiveStarter
  loadRps: number
  failedNodeId: string | null
  findings: Finding[]
  highlightNodeIds: string[]
  highlightEdgeIds: string[]
  diagramRevision: number
  setMode: (mode: Mode) => void
  setSelectedNodeId: (id: string | null) => void
  setLoadRps: (loadRps: number) => void
  simulateFailureOnSelected: () => void
  failNode: (id: string) => void
  clearFailure: () => void
  addNode: (type: NodeType, position?: { x: number; y: number }) => void
  updateNode: (
    id: string,
    patch: Partial<Pick<DiagramNode, 'label' | 'capacity' | 'position'>>,
  ) => void
  clearNodeCapacity: (id: string) => void
  removeNode: (id: string) => void
  addEdge: (source: string, target: string) => void
  removeEdge: (id: string) => void
  setDiagram: (diagram: DiagramDocument, meta?: SetDiagramMeta) => void
  runHealthCheck: () => void
  selectFinding: (finding: Finding) => void
  clearHealthOverlay: () => void
}

let nodeSeq = 0
let edgeSeq = 0

function nextNodeId() {
  nodeSeq += 1
  return `node-${nodeSeq}`
}

function nextEdgeId() {
  edgeSeq += 1
  return `edge-${edgeSeq}`
}

function reseedCounters(diagram: DiagramDocument) {
  for (const n of diagram.nodes) {
    const m = /^node-(\d+)$/.exec(n.id)
    if (m) nodeSeq = Math.max(nodeSeq, Number(m[1]))
  }
  for (const e of diagram.edges) {
    const m = /^edge-(\d+)$/.exec(e.id)
    if (m) edgeSeq = Math.max(edgeSeq, Number(m[1]))
  }
}

function initialDiagram(): DiagramDocument {
  if (typeof window === 'undefined') return EMPTY_DIAGRAM
  try {
    const loaded = loadDiagram(window.localStorage)
    if (loaded) {
      reseedCounters(loaded)
      return loaded
    }
  } catch {
    // ignore
  }
  return EMPTY_DIAGRAM
}

function initialActiveStarter(): ActiveStarter {
  if (typeof window === 'undefined') return null
  try {
    return loadMeta(window.localStorage).activeStarter
  } catch {
    return null
  }
}

const emptyHealth = {
  findings: [] as Finding[],
  highlightNodeIds: [] as string[],
  highlightEdgeIds: [] as string[],
}

function highlightsFromFindings(findings: Finding[]) {
  const highlightNodeIds = [
    ...new Set(findings.flatMap((f) => f.relatedNodeIds)),
  ]
  const highlightEdgeIds = [
    ...new Set(findings.flatMap((f) => f.relatedEdgeIds)),
  ]
  return { highlightNodeIds, highlightEdgeIds }
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'design',
  diagram: initialDiagram(),
  selectedNodeId: null,
  activeStarter: initialActiveStarter(),
  loadRps: 1_500,
  failedNodeId: null,
  diagramRevision: 0,
  ...emptyHealth,

  setMode: (mode) => {
    if (mode === 'health') {
      const findings = healthCheck(get().diagram, {
        activeStarter: get().activeStarter,
      })
      set({
        mode,
        findings,
        ...highlightsFromFindings(findings),
        failedNodeId: null,
      })
      return
    }
    if (mode === 'failure') {
      set({ mode, ...emptyHealth })
      return
    }
    set({ mode, ...emptyHealth, failedNodeId: null })
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setLoadRps: (loadRps) => set({ loadRps: Math.max(0, loadRps) }),

  simulateFailureOnSelected: () => {
    const id = get().selectedNodeId
    if (!id) return
    set({ failedNodeId: id })
  },

  failNode: (id) => set({ failedNodeId: id, selectedNodeId: id }),

  clearFailure: () => set({ failedNodeId: null }),

  setDiagram: (diagram, meta) => {
    reseedCounters(diagram)
    set({
      diagram,
      selectedNodeId: null,
      mode: 'design',
      activeStarter: meta?.activeStarter ?? null,
      failedNodeId: null,
      diagramRevision: get().diagramRevision + 1,
      ...emptyHealth,
    })
  },

  runHealthCheck: () => {
    const findings = healthCheck(get().diagram, {
      activeStarter: get().activeStarter,
    })
    set({ findings, ...highlightsFromFindings(findings) })
  },

  selectFinding: (finding) => {
    set({
      highlightNodeIds: finding.relatedNodeIds,
      highlightEdgeIds: finding.relatedEdgeIds,
    })
  },

  clearHealthOverlay: () => set(emptyHealth),

  addNode: (type, position = { x: 120 + nodeSeq * 24, y: 120 + nodeSeq * 16 }) => {
    const id = nextNodeId()
    const node: DiagramNode = {
      id,
      type,
      label: NODE_TYPE_LABELS[type],
      position,
    }
    set({
      diagram: {
        ...get().diagram,
        nodes: [...get().diagram.nodes, node],
      },
      selectedNodeId: id,
    })
  },

  updateNode: (id, patch) => {
    set({
      diagram: {
        ...get().diagram,
        nodes: get().diagram.nodes.map((n) =>
          n.id === id ? { ...n, ...patch } : n,
        ),
      },
    })
  },

  clearNodeCapacity: (id) => {
    set({
      diagram: {
        ...get().diagram,
        nodes: get().diagram.nodes.map((n) => {
          if (n.id !== id) return n
          const { capacity: _, ...rest } = n
          return rest
        }),
      },
    })
  },

  removeNode: (id) => {
    const { diagram, selectedNodeId } = get()
    set({
      diagram: {
        ...diagram,
        nodes: diagram.nodes.filter((n) => n.id !== id),
        edges: diagram.edges.filter((e) => e.source !== id && e.target !== id),
      },
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    })
  },

  addEdge: (source, target) => {
    if (source === target) return
    const { diagram } = get()
    const exists = diagram.edges.some(
      (e) => e.source === source && e.target === target,
    )
    if (exists) return
    set({
      diagram: {
        ...diagram,
        edges: [
          ...diagram.edges,
          { id: nextEdgeId(), source, target },
        ],
      },
    })
  },

  removeEdge: (id) => {
    const { diagram } = get()
    set({
      diagram: {
        ...diagram,
        edges: diagram.edges.filter((e) => e.id !== id),
      },
    })
  },
}))
