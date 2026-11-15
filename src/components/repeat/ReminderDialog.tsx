import { SimulatedNotice } from '@/components/moniva/SimulatedNotice'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ReorderReminder } from '@/data/types'
import { formatDateTime } from '@/lib/format'

interface ReminderDialogProps {
  customerName?: string
  reminder?: ReorderReminder
  onClose: () => void
}

export function ReminderDialog({ customerName, reminder, onClose }: ReminderDialogProps) {
  return (
    <Dialog open={reminder !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 p-6 sm:max-w-lg">
        {reminder && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Reorder reminder for {customerName}</DialogTitle>
              <DialogDescription>Marked as reminded {formatDateTime(reminder.remindedAt)}.</DialogDescription>
            </DialogHeader>
            <p className="max-w-[90%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
              {reminder.message}
            </p>
            <SimulatedNotice>Preview only. Moniva does not send messages in this demo.</SimulatedNotice>
            <div className="flex justify-end">
              <Button className="h-9 rounded-full px-4" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
