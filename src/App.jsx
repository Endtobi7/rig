import { useMemo, useRef, useState } from 'react'
import './App.css'

import frameImage from '../1.PNG'
import lowerTowersImage from '../tour.PNG'
import rightTraverseImage from '../2.PNG'
import leftTraverseImage from '../traverse droite.PNG'
import blueTraverseImage from '../3.PNG'
import zAssemblyImage from '../4.PNG'
import blueOverlayImage from '../overbleu.PNG'
import rightTraverseOverlayImage from '../overgreen traverse droite.png'
import leftTraverseOverlayImage from '../overgreen travers gauch.png'
import motorOverlayImage from '../overlay moteur.PNG'
import axisReferenceImage from '../image_2026-05-07_164402938.png'

const CALIBRATION = {
  frame: { width: 1617, height: 1035 },
  ranges: {
    x: 220,
    y: 180,
    z: 140,
  },
}

const clamp = (value, min = -1, max = 1) => Math.max(min, Math.min(max, value))

function App() {
  const sceneRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [axes, setAxes] = useState({ x: 0, y: 0, z: 0 })

  const transforms = useMemo(() => {
    const xOffset = axes.x * CALIBRATION.ranges.x
    const yOffset = axes.y * CALIBRATION.ranges.y
    const zOffset = -axes.z * CALIBRATION.ranges.z

    const toPercentX = (value) => (value / CALIBRATION.frame.width) * 100
    const toPercentY = (value) => (value / CALIBRATION.frame.height) * 100

    return {
      green: {
        transform: `translate3d(${toPercentX(xOffset)}%, 0%, 0)`,
      },
      blue: {
        transform: `translate3d(${toPercentX(xOffset)}%, ${toPercentY(yOffset)}%, 0)`,
      },
      z: {
        transform: `translate3d(${toPercentX(xOffset)}%, ${toPercentY(yOffset + zOffset)}%, 0)`,
      },
    }
  }, [axes.x, axes.y, axes.z])

  const updateFromDrag = (clientX, clientY) => {
    const scene = sceneRef.current
    if (!scene) {
      return
    }

    const rect = scene.getBoundingClientRect()
    if (!rect.width || !rect.height) {
      return
    }

    const normalizedX = ((clientX - rect.left) / rect.width - 0.5) * 2
    const normalizedY = (0.5 - (clientY - rect.top) / rect.height) * 2

    setAxes((current) => ({
      ...current,
      x: clamp(normalizedX),
      y: clamp(normalizedY),
    }))
  }

  return (
    <main className="app">
      <section className="scene-wrapper">
        <div
          ref={sceneRef}
          className={`scene ${isDragging ? 'is-dragging' : ''}`}
          onPointerDown={(event) => {
            setIsDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
            updateFromDrag(event.clientX, event.clientY)
          }}
          onPointerMove={(event) => {
            if (isDragging) {
              updateFromDrag(event.clientX, event.clientY)
            }
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
        >
          <img className="layer" src={frameImage} alt="H-Bot fixed frame" draggable={false} />
          <img className="layer" src={lowerTowersImage} alt="H-Bot lower towers" draggable={false} />

          <img className="layer moving" style={transforms.green} src={leftTraverseImage} alt="Left green traverse" draggable={false} />
          <img className="layer moving" style={transforms.green} src={rightTraverseImage} alt="Right green traverse" draggable={false} />
          <img className="layer moving" style={transforms.green} src={leftTraverseOverlayImage} alt="Left traverse continuity overlay" draggable={false} />
          <img className="layer moving" style={transforms.green} src={rightTraverseOverlayImage} alt="Right traverse continuity overlay" draggable={false} />

          <img className="layer moving" style={transforms.blue} src={blueTraverseImage} alt="Blue central traverse" draggable={false} />
          <img className="layer moving" style={transforms.blue} src={blueOverlayImage} alt="Blue traverse continuity overlay" draggable={false} />
          <img className="layer moving" style={transforms.blue} src={motorOverlayImage} alt="Motor and transmission static overlay" draggable={false} />

          <img className="layer moving" style={transforms.z} src={zAssemblyImage} alt="Z-axis assembly" draggable={false} />

          <img className="axis-reference" src={axisReferenceImage} alt="Cartesian axes reference" draggable={false} />
        </div>
      </section>

      <section className="controls" aria-label="Motion controls">
        {['x', 'y', 'z'].map((axis) => (
          <label key={axis} className="control">
            <span>{axis.toUpperCase()}</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(axes[axis] * 100)}
              onChange={(event) => {
                const nextValue = Number(event.target.value) / 100
                setAxes((current) => ({ ...current, [axis]: clamp(nextValue) }))
              }}
            />
          </label>
        ))}
      </section>
    </main>
  )
}

export default App
