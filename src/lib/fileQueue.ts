import fs from 'fs'
import path from 'path'

const queueDir = path.join(process.cwd(), 'data', 'exports')
fs.mkdirSync(queueDir, { recursive: true })

export async function addExportJobFile(payload: any) {
  const id = payload.jobId || Date.now()
  const filePath = path.join(queueDir, `${id}.json`)
  await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')
}

export function listPendingJobs() {
  return fs.readdirSync(queueDir).filter(f => f.endsWith('.json'))
}

export function readJobFile(name: string) {
  const filePath = path.join(queueDir, name)
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

export function removeJobFile(name: string) {
  const filePath = path.join(queueDir, name)
  fs.unlinkSync(filePath)
}
