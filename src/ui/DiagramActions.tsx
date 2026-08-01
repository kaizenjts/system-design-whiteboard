import { useEffect, useRef } from 'react'
import { useAppStore } from '../app/store'
import { parseDiagram, serializeDiagram } from '../persistence/diagramStorage'
import { STARTERS, starterById, type StarterId } from '../starters/catalog'

export function DiagramActions() {
  const setDiagram = useAppStore((s) => s.setDiagram)
  const diagram = useAppStore((s) => s.diagram)
  const fileRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const el = pickerRef.current
      if (!el?.open) return
      if (event.target instanceof Node && el.contains(event.target)) return
      el.open = false
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function loadStarter(id: StarterId) {
    const starter = starterById(id)
    setDiagram(starter.create(), { activeStarter: starter.id })
    if (pickerRef.current) pickerRef.current.open = false
  }

  function exportJson() {
    const blob = new Blob([serializeDiagram(diagram)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.v1.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImportFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        setDiagram(parseDiagram(text))
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : 'Could not import diagram',
        )
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="diagram-actions" aria-label="Diagram actions">
      <details ref={pickerRef} className="starter-picker">
        <summary className="action-btn starter-picker-summary">
          Load starter
        </summary>
        <div className="starter-picker-menu" role="menu">
          {STARTERS.map((starter) => (
            <button
              key={starter.id}
              type="button"
              role="menuitem"
              className="starter-picker-item"
              onClick={() => loadStarter(starter.id)}
            >
              {starter.label}
            </button>
          ))}
        </div>
      </details>
      <button type="button" className="action-btn" onClick={exportJson}>
        Export
      </button>
      <button
        type="button"
        className="action-btn"
        onClick={() => fileRef.current?.click()}
      >
        Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          onImportFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
