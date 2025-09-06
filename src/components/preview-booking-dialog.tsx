
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Booking } from '@/contexts/trips-context';

interface PreviewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

export function PreviewBookingDialog({ open, onOpenChange, booking }: PreviewBookingDialogProps) {
  const isImage = booking.fileType?.startsWith('image/');
  const isPdf = booking.fileType === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{booking.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 h-full">
          {isImage ? (
            <img src={booking.fileUrl} alt={booking.name} className="max-w-full max-h-full object-contain mx-auto" />
          ) : isPdf ? (
            <iframe src={booking.fileUrl} className="w-full h-full border-0" title={booking.name} />
          ) : (
            <div className="text-center text-muted-foreground flex items-center justify-center h-full">
              <p>Preview is not available for this file type.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
