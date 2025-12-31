import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ExportsPage() {
  const exportsList = await prisma.exportJob.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Export Jobs</h1>
      <div className="grid gap-4">
        {exportsList.map((e: any) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{e.type} — {new Date(e.createdAt).toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Status: {e.status}</div>
                  {e.fileUrl && <div className="text-xs text-blue-600"><a href={e.fileUrl} target="_blank" rel="noreferrer">Download</a></div>}
                </div>
                <div>
                  <form action={`/api/admin/export/snmpb`}>
                    <Button type="submit" className="bg-emerald-600">Regenerate</Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
