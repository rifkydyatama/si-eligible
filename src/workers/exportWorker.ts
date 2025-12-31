import prisma from '../lib/prisma'
import * as XLSX from 'xlsx'
import { ensurePublicExportsDir, uploadBufferToS3 } from '../lib/storage'
import fs from 'fs'
import path from 'path'
import { listPendingJobs, readJobFile, removeJobFile } from '../lib/fileQueue'

// Simple file-based worker loop. Run this process separately (npm run worker).
async function processOnce() {
  const jobs = listPendingJobs()
  if (jobs.length === 0) return
  const name = jobs[0]
  try {
    const payload = readJobFile(name)
    const { type, jobId } = payload
    if (type === 'SNMPB') {
      const students = await prisma.student.findMany({ where: { isEligible: true }, include: { major: true } })
      const rows = students.map((s: any) => ({ NISN: s.nisn, NAME: s.name, MAJOR: s.major?.name || '', AVERAGE: s.averageScore, RANKING: s.ranking }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Eligible')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      const filename = `snmpb-export-${Date.now()}.xlsx`

      let fileUrl = `/exports/${filename}`
      if (process.env.S3_BUCKET && process.env.AWS_REGION) {
        try {
          const { uploadBufferToS3 } = await import('../lib/storage')
          fileUrl = await uploadBufferToS3(Buffer.from(buffer), `exports/${filename}`)
        } catch (e) {
          console.error('S3 upload failed, falling back to local file', e)
        }
      }

      if (!fileUrl.startsWith('http')) {
        const dir = ensurePublicExportsDir()
        const filePath = path.join(dir, filename)
        fs.writeFileSync(filePath, buffer)
      }

      await prisma.exportJob.update({ where: { id: jobId }, data: { status: 'DONE', fileUrl } })
    }

    // remove job file
    removeJobFile(name)
  } catch (err) {
    console.error('Failed processing job', name, err)
    try {
      const payload = readJobFile(name)
      await prisma.exportJob.update({ where: { id: payload.jobId }, data: { status: 'FAILED' } })
    } catch (e) { /* ignore */ }
    // remove to avoid blocking
    removeJobFile(name)
  }
}

// Runner: poll directory every 3s
if (require.main === module) {
  console.log('Starting file-based export worker (polling every 3s)')
  setInterval(processOnce, 3000)
}

export { processOnce }
