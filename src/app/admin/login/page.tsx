'use client'

import { useActionState } from 'react' // Update terbaru Next.js pakai ini (dulu useFormState)
import { loginAdmin } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LockKeyhole, School } from 'lucide-react'

// Kita perlu inisial state buat hook form
const initialState = {
  error: '',
}

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAdmin, initialState)


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20">
              <School className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Portal</CardTitle>
          <CardDescription className="text-slate-500">
            Masuk untuk mengelola data SNBP & Siswa
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form action={action} className="space-y-4">
            
            {/* Tampilkan Error kalau ada */}
            {state?.error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Sekolah</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@sekolah.sch.id" 
                className="border-slate-300 focus:border-blue-500"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="******" 
                  className="pl-10 border-slate-300 focus:border-blue-500"
                  required 
                />
                <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium transition-all"
              disabled={isPending}
            >
              {isPending ? 'Sedang Masuk...' : 'Masuk Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}