import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type EdgeTypes,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react'
import { useCallback, useMemo, type DragEvent } from 'react'
import { useAppStore } from '../app/store'
import { PALETTE_TYPES } from '../domain/catalog'
import { EmptyCanvasHint } from '../ui/EmptyCanvasHint'
import { simulateFailure } from '../simulation/failure/failure'
import { simulateTraffic } from '../simulation/traffic/traffic'
import { ArchitectureNode } from './ArchitectureNode'
import { FailureEdge } from './FailureEdge'
import { FitViewOnRevision } from './FitViewOnRevision'
import { isPaletteNodeType, PALETTE_DND_MIME } from './paletteDnD'
import { TrafficEdge } from './TrafficEdge'
import { WiringEdge } from './WiringEdge'
import { toFlowEdges, toFlowNodes } from './adapters'

import '@xyflow/react/dist/style.css'

const nodeTypes = Object.fromEntries(
  PALETTE_TYPES.map((type) => [type, ArchitectureNode]),
) as NodeTypes

const edgeTypes = {
  wiring: WiringEdge,
  traffic: TrafficEdge,
  failure: FailureEdge,
} as EdgeTypes

export function SimulatorCanvas() {
  return (
    <ReactFlowProvider>
      <SimulatorCanvasInner />
    </ReactFlowProvider>
  )
}

function SimulatorCanvasInner() {
  const mode = useAppStore((s) => s.mode)
  const diagram = useAppStore((s) => s.diagram)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const highlightNodeIds = useAppStore((s) => s.highlightNodeIds)
  const highlightEdgeIds = useAppStore((s) => s.highlightEdgeIds)
  const findings = useAppStore((s) => s.findings)
  const healthHighlightMode = useAppStore((s) => s.healthHighlightMode)
  const findingPulseKey = useAppStore((s) => s.findingPulseKey)
  const loadRps = useAppStore((s) => s.loadRps)
  const failedNodeId = useAppStore((s) => s.failedNodeId)
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId)
  const updateNode = useAppStore((s) => s.updateNode)
  const removeNode = useAppStore((s) => s.removeNode)
  const addNode = useAppStore((s) => s.addNode)
  const addEdge = useAppStore((s) => s.addEdge)
  const removeEdge = useAppStore((s) => s.removeEdge)
  const { screenToFlowPosition } = useReactFlow()

  const traffic = useMemo(
    () => (mode === 'traffic' ? simulateTraffic(diagram, loadRps) : null),
    [mode, diagram, loadRps],
  )

  const failure = useMemo(
    () =>
      mode === 'failure' ? simulateFailure(diagram, failedNodeId) : null,
    [mode, diagram, failedNodeId],
  )

  const nodes = useMemo(() => {
    if (traffic) {
      const loadByNodeId = Object.fromEntries(
        traffic.nodes.map((n) => [n.nodeId, n.loadRps]),
      )
      return toFlowNodes(diagram, {
        selectedNodeId,
        highlightNodeIds: traffic.highlightNodeIds,
        warningNodeIds: traffic.warningNodeIds,
        bottleneckNodeIds: traffic.bottleneckNodeIds,
        loadByNodeId,
      })
    }
    if (failure) {
      const failureByNodeId = new Map(
        failure.nodes.map((n) => [
          n.nodeId,
          { state: n.state, reason: n.reason },
        ]),
      )
      const cascadeHopByNodeId = cascadeHops(
        diagram,
        failure.failedNodeId,
        failure.blastRadiusNodeIds,
      )
      return toFlowNodes(diagram, {
        selectedNodeId,
        highlightNodeIds: failure.blastRadiusNodeIds,
        failureByNodeId,
        cascadeHopByNodeId,
        showCapacityHint: false,
      })
    }
    const findingSeverityByNodeId = severityByNode(findings, highlightNodeIds)
    return toFlowNodes(diagram, {
      selectedNodeId,
      highlightNodeIds,
      findingSeverityByNodeId,
      healthHighlightMode,
      findingPulseKey,
      showCapacityHint: mode === 'design',
    })
  }, [
    diagram,
    selectedNodeId,
    highlightNodeIds,
    findings,
    healthHighlightMode,
    findingPulseKey,
    traffic,
    failure,
    mode,
  ])

  const edges = useMemo(() => {
    if (traffic) {
      const edgeLoadById = Object.fromEntries(
        traffic.edgeLoads.map((e) => [e.edgeId, e.loadRps]),
      )
      return toFlowEdges(diagram, {
        edgeMode: 'traffic',
        highlightEdgeIds: traffic.highlightEdgeIds,
        bottleneckNodeIds: traffic.bottleneckNodeIds,
        warningNodeIds: traffic.warningNodeIds,
        edgeLoadById,
      })
    }
    if (failure) {
      return toFlowEdges(diagram, {
        edgeMode: 'failure',
        highlightNodeIds: failure.blastRadiusNodeIds,
      })
    }
    return toFlowEdges(diagram, { highlightEdgeIds })
  }, [diagram, highlightEdgeIds, traffic, failure])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          updateNode(change.id, { position: change.position })
        }
        if (change.type === 'remove') {
          removeNode(change.id)
        }
        if (change.type === 'select') {
          if (change.selected) {
            setSelectedNodeId(change.id)
          } else if (selectedNodeId === change.id) {
            setSelectedNodeId(null)
          }
        }
      }
    },
    [removeNode, selectedNodeId, setSelectedNodeId, updateNode],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          removeEdge(change.id)
        }
      }
    },
    [removeEdge],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addEdge(connection.source, connection.target)
      }
    },
    [addEdge],
  )

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      if (mode !== 'design') return
      const raw = event.dataTransfer.getData(PALETTE_DND_MIME)
      if (!isPaletteNodeType(raw)) return
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode(raw, position)
    },
    [addNode, mode, screenToFlowPosition],
  )

  return (
    <div
      className={[
        'canvas-stage',
        mode === 'traffic' ? 'canvas-live-traffic' : '',
        mode === 'failure' && failedNodeId ? 'canvas-live-failure' : '',
        mode === 'health' && findings.length > 0 ? 'canvas-live-health' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(mode === 'traffic' ||
        (mode === 'failure' && failedNodeId) ||
        (mode === 'health' && findings.length > 0)) && (
        <div className="canvas-live-chip" aria-live="polite">
          <span className="live-dot" />
          {mode === 'traffic'
            ? `Live traffic · ${loadRps.toLocaleString()} req/s`
            : mode === 'failure'
              ? 'Failure cascade'
              : `${findings.length} health finding${findings.length === 1 ? '' : 's'}`}
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={18} size={1} color="var(--canvas-grid)" />
        <Controls />
        <MiniMap pannable zoomable />
        <FitViewOnRevision />
      </ReactFlow>
      <EmptyCanvasHint />
    </div>
  )
}

/** Undirected hop distance from the failed root within the blast set. */
function cascadeHops(
  diagram: { edges: { source: string; target: string }[] },
  failedNodeId: string | null,
  blastIds: readonly string[],
): Map<string, number> {
  const hops = new Map<string, number>()
  if (!failedNodeId) return hops

  const blast = new Set(blastIds)
  const adj = new Map<string, string[]>()
  for (const id of blast) adj.set(id, [])
  for (const e of diagram.edges) {
    if (!blast.has(e.source) || !blast.has(e.target)) continue
    adj.get(e.source)?.push(e.target)
    adj.get(e.target)?.push(e.source)
  }

  const queue = [failedNodeId]
  hops.set(failedNodeId, 0)
  while (queue.length > 0) {
    const cur = queue.shift()!
    const nextHop = (hops.get(cur) ?? 0) + 1
    for (const nb of adj.get(cur) ?? []) {
      if (hops.has(nb)) continue
      hops.set(nb, nextHop)
      queue.push(nb)
    }
  }

  for (const id of blast) {
    if (!hops.has(id)) hops.set(id, 1)
  }
  return hops
}

function severityByNode(
  findings: { severity: 'high' | 'medium'; relatedNodeIds: string[] }[],
  highlightNodeIds: readonly string[],
): Map<string, 'high' | 'medium'> {
  const map = new Map<string, 'high' | 'medium'>()
  const highlighted = new Set(highlightNodeIds)
  if (highlighted.size === 0) return map

  for (const f of findings) {
    for (const id of f.relatedNodeIds) {
      if (!highlighted.has(id)) continue
      const prev = map.get(id)
      if (prev === 'high') continue
      if (f.severity === 'high' || !prev) map.set(id, f.severity)
    }
  }
  return map
}
