
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from './ui/badge';

interface CategorizeBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  onUpload: (category: string, note?: string) => void;
}

const stayCategories = ['Hotel', 'Airbnb'];
const transportCategories = ['Train', 'Flight', 'Cab'];
const allCategories = [...stayCategories, ...transportCategories, 'Others'];

export function CategorizeBookingDialog({ open, onOpenChange, fileName, onUpload }: CategorizeBookingDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [note, setNote] = useState('');

  const handleUpload = () => {
    if (selectedCategory) {
      onUpload(selectedCategory, note);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCategory('');
      setNote('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
          <DialogDescription>Categorize your uploaded document.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">What is this for?</h4>
                <div className="flex flex-wrap gap-2">
                    {allCategories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'secondary'}
                            onClick={() => setSelectedCategory(category)}
                            size="sm"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                 <h4 className="text-sm font-medium text-muted-foreground mb-2">Add Note (Optional)</h4>
                 <Textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Return flight details"
                 />
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!selectedCategory}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
