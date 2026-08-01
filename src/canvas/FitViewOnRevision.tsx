import { useReactFlow } from '@xyflow/react'
import { useEffect } from 'react'
import { useAppStore } from '../app/store'

/** Refit the viewport when the diagram is replaced (starter / import). */
export function FitViewOnRevision() {
  const { fitView } = useReactFlow()
  const diagramRevision = useAppStore((s) => s.diagramRevision)

  useEffect(() => {
    if (diagramRevision === 0) return
    const id = window.requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 240 })
    })
    return () => window.cancelAnimationFrame(id)
  }, [diagramRevision, fitView])

  return null
}
