import prisma from '../src/lib/prisma'
import { addExportJobFile } from '../src/lib/fileQueue'

async function run() {
  try {
    const job = await prisma.exportJob.create({ data: { type: 'SNMPB', status: 'PROCESSING', params: {} } })
    await addExportJobFile({ type: 'SNMPB', jobId: job.id })
    console.log('Enqueued export job', job.id)
  } catch (e) {
    console.error('Failed to enqueue export job', e)
  } finally {
    await prisma.$disconnect()
  }
}

run()
