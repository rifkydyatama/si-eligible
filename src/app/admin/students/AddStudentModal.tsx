'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, UserPlus, Loader2 } from 'lucide-react'
import { addStudent } from './actions'

interface AddStudentModalProps {
  majors: any[]
}

export function AddStudentModal({ majors }: AddStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addStudent(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Student added successfully!",
          variant: "default",
        })
        setIsOpen(false)
        // Reset form
        const form = document.getElementById('add-student-form') as HTMLFormElement
        if (form) form.reset()
        // Refresh page to show new student
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
          <Plus size={16} />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Add New Student
          </DialogTitle>
        </DialogHeader>
        <form id="add-student-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Enter full name" required disabled={isPending} />
          </div>

          <div>
            <Label htmlFor="nisn">NISN</Label>
            <Input id="nisn" name="nisn" placeholder="Enter NISN (10 digits)" maxLength={10} required disabled={isPending} />
          </div>

          <div>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input id="birthDate" name="birthDate" type="date" required disabled={isPending} />
          </div>

          <div>
            <Label htmlFor="majorId">Major</Label>
            <Select name="majorId" required disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select major" />
              </SelectTrigger>
              <SelectContent>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id.toString()}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Average Score</Label>
              <Input id="grade" name="grade" type="number" step="0.01" min="0" max="100" placeholder="0.00" required disabled={isPending} />
            </div>

            <div>
              <Label htmlFor="ranking">Ranking</Label>
              <Input id="ranking" name="ranking" type="number" min="1" placeholder="1" required disabled={isPending} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}