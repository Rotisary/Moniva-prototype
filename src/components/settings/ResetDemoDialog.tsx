import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const CLEARED = [
  'Simulated incoming messages, so the Social Commerce queue starts again',
  'Uploaded or recorded receipts, and any order matches or verifications',
  'Financial institution shares',
  'Reorder reminders',
]

interface ResetDemoDialogProps {
  open: boolean
  businessName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ResetDemoDialog({ open, businessName, onOpenChange, onConfirm }: ResetDemoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Reset demo data?</DialogTitle>
          <DialogDescription>
            This restores {businessName}&apos;s original sample dataset and clears every change made in this browser:
          </DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {CLEARED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="h-9 rounded-full px-4" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" className="h-9 rounded-full px-4" onClick={onConfirm}>
            Reset demo data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
