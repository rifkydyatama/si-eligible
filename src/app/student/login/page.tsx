"use client"

import { useActionState } from 'react'
import { loginStudent } from './actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Calendar, Shield } from 'lucide-react'

export default function StudentLoginPage() {
  const initialState = { error: '' }
  const [state, action, isPending] = useActionState(loginStudent, initialState)
  const [showCaptcha] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-green-600 rounded-full shadow-lg shadow-green-600/20">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Portal Siswa</CardTitle>
          <CardDescription className="text-slate-500">
            Masuk untuk melihat hasil SNBP & mengajukan sanggahan
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
              <Label htmlFor="nisn" className="text-slate-700">NISN</Label>
              <div className="relative">
                <Input
                  id="nisn"
                  name="nisn"
                  placeholder="Masukkan NISN"
                  className="pl-10 border-slate-300 focus:border-green-500"
                  required
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-slate-700">Tanggal Lahir</Label>
              <div className="relative">
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  className="pl-10 border-slate-300 focus:border-green-500"
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {showCaptcha && (
              <div className="space-y-2">
                <Label className="text-slate-700">Verifikasi</Label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Ketik "1234":</span>
                  <Input
                    name="captcha"
                    className="flex-1 h-8 border-slate-300 focus:border-green-500"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-medium transition-all"
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
