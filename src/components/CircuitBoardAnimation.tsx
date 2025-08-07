import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const { floor, random } = Math

const settings = {
  size: 10,
  leave: 10,
  wireMaxLen: 40,
  stroke: '#d4af37',
  fill: '#1a5d4a',
}

class Cell {
  x = 0
  y = 0
  available = true
  dirInd = floor(random() * 8) // 该节点会往哪个方向延申

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class Wire {
  cells: Cell[] = []

  constructor(start: Cell) {
    start.available = false
    this.cells.push(start)
  }

  validNoCrossOver(c1: Cell, dirInd: number, cellsMap: { [k: string]: Cell }) {
    // 水平垂直肯定不会交叉
    if ([0, 2, 4, 6].includes(dirInd))
      return true
    // 1-tr,3-br,5-bl,7-tl这四个方向会触发交叉重叠判断
    if (dirInd === 1) {
      // 在一些边界中，c3和c4根本不存在，所以不会交叉
      const c3 = cellsMap[`${c1.x},${c1.y - 1}`]?.available ?? true
      const c4 = cellsMap[`${c1.x + 1},${c1.y}`]?.available ?? true
      if (c3 && c4)
        return true
    }
    if (dirInd === 3) {
      const c3 = cellsMap[`${c1.x + 1},${c1.y}`]?.available ?? true
      const c4 = cellsMap[`${c1.x},${c1.y + 1}`]?.available ?? true
      if (c3 && c4)
        return true
    }
    if (dirInd === 5) {
      const c3 = cellsMap[`${c1.x - 1},${c1.y}`]?.available ?? true
      const c4 = cellsMap[`${c1.x},${c1.y + 1}`]?.available ?? true
      if (c3 && c4)
        return true
    }
    if (dirInd === 7) {
      const c3 = cellsMap[`${c1.x - 1},${c1.y}`]?.available ?? true
      const c4 = cellsMap[`${c1.x},${c1.y - 1}`]?.available ?? true
      if (c3 && c4)
        return true
    }
    return false
  }

  generate(cells: Cell[], cellsMap: { [k: string]: Cell }, rows: number, cols: number) {
    // 方向是顺时针旋转定义的，反正只要连续的方向就行，为了给cell依次指定方向
    const dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
    const tryMax = dirs.length

    let hasSpace = true
    while (this.cells.length < settings.wireMaxLen && hasSpace) {
      hasSpace = true

      let dirInc = 0
      let tryNum = 0
      while (tryNum < tryMax) {
        const last = this.cells[this.cells.length - 1]
        const dirInd = (last.dirInd + dirInc) % 8

        const dir = dirs[dirInd]
        const x = last.x + dir[0]
        const y = last.y + dir[1]
        const index = y * cols + x
        // 方向越界
        if (x < 0 || x >= cols || y < 0 || y >= rows || index < 0 || index >= cells.length) {
          dirInc += 1
          tryNum += 1
          continue
        }
        const next = cells[index]
        // 节点占用
        if (!next.available) {
          dirInc += 1
          tryNum += 1
          continue
        }
        // 线路交叉判断
        if (!this.validNoCrossOver(last, dirInd, cellsMap)) {
          dirInc += 1
          tryNum += 1
          continue
        }

        // ok
        next.available = false
        next.dirInd = dirInd
        this.cells.push(next)
        dirInc = 0
        tryNum = 0
        break
      }
      // 所有方向都试过，不成立
      if (tryNum === tryMax) {
        hasSpace = false
        dirInc = 0
        tryNum = 0
      }
    }
  }

  draw(svgElement: SVGSVGElement) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

    let d = ''
    const s = settings.size
    const r = s / 3

    circle1.setAttribute('r', `${r}`)
    circle2.setAttribute('r', `${r}`)
    circle1.setAttribute('stroke', `#fff`)
    circle2.setAttribute('stroke', `#fff`)
    circle1.setAttribute('fill', `#d4af37`)
    circle2.setAttribute('fill', `#d4af37`)

    for (let i = 0; i < this.cells.length; i += 1) {
      const cur = this.cells[i]
      if (i === 0) {
        d += `M ${cur.x * s + s / 2} ${cur.y * s + s / 2}`
        circle1.setAttribute('cx', `${cur.x * s + s / 2}`)
        circle1.setAttribute('cy', `${cur.y * s + s / 2}`)
      }

      if (i < this.cells.length)
        d += ` L ${cur.x * s + s / 2} ${cur.y * s + s / 2}`

      if (i === this.cells.length - 1) {
        circle2.setAttribute('cx', `${cur.x * s + s / 2}`)
        circle2.setAttribute('cy', `${cur.y * s + s / 2}`)
      }
    }

    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', settings.stroke)
    path.setAttribute('stroke-width', `${settings.size / 4}`)
    const length = path.getTotalLength()
    path.setAttribute('stroke-dasharray', `${length}, ${length}`)
    path.setAttribute('stroke-dashoffset', `${length}`)
    path.classList.add('animated-path')
    
    svgElement.appendChild(path)
    svgElement.appendChild(circle1)
    svgElement.appendChild(circle2)
  }
}

const CircuitBoardAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const generateAnimation = () => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    // Clear existing animation
    svg.innerHTML = ''

    const { width, height } = container.getBoundingClientRect()
    svg.setAttribute('width', `${width}`)
    svg.setAttribute('height', `${height}`)

    const rows = floor(height / settings.size)
    const cols = floor(width / settings.size)
    const wireNum = floor(rows * cols / (settings.wireMaxLen + settings.leave))
    const cells: Cell[] = []
    const cellsMap: { [k: string]: Cell } = {} // {'x,y': Cell}
    const wires: Wire[] = []

    // Create cells
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const cell = new Cell(x, y)
        cells.push(cell)
        cellsMap[`${x},${y}`] = cell
      }
    }

    // Generate wires
    while (wires.length < wireNum) {
      const cell = cells[floor(random() * cells.length)]
      if (!cell.available) continue

      const wire = new Wire(cell)
      wires.push(wire)
      wire.generate(cells, cellsMap, rows, cols)
      wire.draw(svg)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setTimeout(generateAnimation, 100)
    }

    // Initial generation
    generateAnimation()

    // Handle window resize
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="circuit-container">
      <svg
        ref={svgRef}
        className="circuit-svg"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      />
      <div className="text-overlay">
        <motion.div 
          className="text-content"
          initial={{ 
            opacity: 0, 
            scale: 0.95,
            y: 20
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.5,
            ease: [0.25, 0.25, 0.25, 1]
          }}
        >
          <div className="text-content-inner">
          <motion.div 
            className="title-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h1 className="title">Welcome to MicroAlchemy</h1>
            <h1 className="title">// MA</h1>
          </motion.div>
          <motion.p 
            className="description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            MicroAlchemy is a company dedicated to providing cutting-edge solutions in the realm of micro-technology and advanced material science. 
          </motion.p>
          <motion.div 
            className="expertise"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="subtitle">Our expertise includes:</h2>
            <ul className="expertise-list">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.4 }}
              >
                Compilers and analog design synthesis <br/> ✳ ✳ ✳
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.5 }}
              >
                Semiconductor device fabrication and design <br/> ❇ ❇ ❇
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.6 }}
              >
                Robotics and automation design for low volume manufacturing <br/> ✳ ✳ ✳
              </motion.li>
            </ul>
          </motion.div>
          <motion.p 
            className="footer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            Stay tuned for more updates and exciting developments!
          </motion.p>
          <motion.p 
            className="contact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
          >
            Email inquiries to <a href="mailto:info@microalchemy.xyz" className="email-link">info@microalchemy.xyz</a>
          </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CircuitBoardAnimation 