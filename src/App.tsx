import React, { useState } from 'react'
import keyGen from 'react-id-generator'

type Mower = {
  x: number;
  y: number;
  orientation: 'N' | 'E' | 'S' | 'W';
  instructions: string;
}

type Position = {
  x: number;
  y: number;
  orientation: 'N' | 'E' | 'S' | 'W';
}

const App: React.FC = () => {
  const [result, setResult] = useState<Position[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => processFileContent(e.target?.result as string)
      reader.readAsText(file)
    }
  }

  const parseDimensions = (dimensionsStr: string): [number | undefined, number | undefined] => {
    const maxX = parseInt(dimensionsStr.slice(0, -1), 10)
    const maxY = parseInt(dimensionsStr.slice(-1), 10)
    return (isNaN(maxX) || isNaN(maxY)) ? [undefined, undefined] : [maxX, maxY]
  }

  const processFileContent = (content: string) => {
    const lines = content.trim().split('\n')
    if (lines.length < 1) {
      console.error('empty file')
      return
    }
    const [maxX, maxY] = parseDimensions(lines[0].trim())
    if (maxX === undefined || maxY === undefined) {
      console.error('invalid lawn')
      return
    }
    const mowers = splitMowers(lines.slice(1))
    const results = mowers.map(mower => executeInstructions(mower, maxX, maxY))
    setResult(results)
  }

   const splitMowers = (lines: string[]): Mower[] => {
    const mowers: Mower[] = []
    for (let i = 0; i < lines.length; i += 2) {
      const positionLine = lines[i]?.trim()
      const instructions = lines[i + 1]?.trim()
      if (!positionLine || !instructions || positionLine.length < 3) {
        console.error('wrong initial setup ', positionLine)
        continue
      }
      const [xValue, yValue, orientation] = [positionLine[0], positionLine[1], positionLine[3]] as [string, string, string]
      const x = parseInt(xValue, 10)
      const y = parseInt(yValue, 10)
      if (isNaN(x) || isNaN(y) || !['N', 'E', 'S', 'W'].includes(orientation)) {
        console.error('setup not valid', positionLine)
        continue
      }
      mowers.push({ x, y, orientation: orientation as 'N' | 'E' | 'S' | 'W', instructions })
    }
    return mowers
  }

  const executeInstructions = ({ x, y, orientation, instructions }: Mower, maxX: number, maxY: number): Position => {
    const directions = ['N', 'E', 'S', 'W'] as const
    let directionIndex = directions.indexOf(orientation)
    const moveForward = () => {
      switch (directions[directionIndex]) {
        case 'N':
          if (y < maxY) y++
          break
        case 'E':
          if (x < maxX) x++
          break
        case 'S':
          if (y > 0) y--
          break
        case 'W':
          if (x > 0) x--
          break
        default:
          break
      }
    }

    instructions.split('').forEach(instruction => {
      switch (instruction) {
        case 'L':
          directionIndex = (directionIndex + 3) % 4
          break
        case 'R':
          directionIndex = (directionIndex + 1) % 4
          break
        case 'F':
          moveForward()
          break
        default:
          console.error(`wrong instruction: ${instruction}`)
          break
      }
    })
    return { x, y, orientation: directions[directionIndex] }
  }

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".txt" />
      <div>
        <h2>Positions finales :</h2>
        <ul>
          {result.map((position, index) => (
            <li key={keyGen()}>
              Tondeuse {index + 1}: [{position.x}, {position.y}] orientée {position.orientation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
