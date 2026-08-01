import { SimulatorCanvas } from '../canvas/SimulatorCanvas'
import { useDiagramAutoSave } from '../persistence/useDiagramAutoSave'
import { MODES } from '../domain/types'
import { DiagramActions } from '../ui/DiagramActions'
import { FailurePanel } from '../ui/FailurePanel'
import { FindingsPanel } from '../ui/FindingsPanel'
import { Inspector } from '../ui/Inspector'
import { Palette } from '../ui/Palette'
import { TrafficPanel } from '../ui/TrafficPanel'
import { useAppStore } from './store'

export function App() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  useDiagramAutoSave()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">SDS</span>
          <div>
            <h1>System Design Simulator</h1>
            <p className="brand-sub">
              1 Pick starter · 2 Health · 3 Traffic presets · 4 Fail Database /
              Queue
            </p>
          </div>
        </div>
        <div className="header-controls">
          <DiagramActions />
          <nav className="mode-switcher" aria-label="Simulator mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={mode === m.id ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Palette />
        <SimulatorCanvas />
        {mode === 'health' ? (
          <FindingsPanel />
        ) : mode === 'traffic' ? (
          <TrafficPanel />
        ) : mode === 'failure' ? (
          <FailurePanel />
        ) : (
          <Inspector />
        )}
      </main>
    </div>
  )
}
