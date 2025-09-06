
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Member } from '@/contexts/trips-context';
import { Separator } from './ui/separator';
import { Link, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name is required.' }),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  memberToEdit?: Member | null;
  onUpdateMember?: (member: Member) => void;
  tripId?: string;
}

export function AddMemberDialog({ open, onOpenChange, onAddMember, memberToEdit, onUpdateMember, tripId }: AddMemberDialogProps) {
  const isEditMode = !!memberToEdit;
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: memberToEdit?.name || '',
      phone: memberToEdit?.phone || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      name: memberToEdit?.name || '',
      phone: memberToEdit?.phone || '',
    });
  }, [memberToEdit, form]);

  const { isSubmitting } = form.formState;

  function onSubmit(values: FormValues) {
    if (isEditMode && onUpdateMember) {
        onUpdateMember({ ...memberToEdit, ...values });
    } else {
        onAddMember(values);
    }
    handleOpenChange(false);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
    }
    onOpenChange(isOpen);
  }

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/join-trip?tripId=${tripId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
        title: "Link Copied!",
        description: "The invite link has been copied to your clipboard.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Member' : 'Add a New Member'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this member.' : 'Add a new friend to your trip manually or invite them with a link.'}
          </DialogDescription>
        </DialogHeader>
        
        {!isEditMode && (
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Invite via Link</Label>
                <div className="flex items-center space-x-2">
                    <Input 
                        value={`${window.location.origin}/join-trip?tripId=${tripId}`}
                        readOnly
                        className="bg-muted"
                    />
                    <Button type="button" size="icon" onClick={handleCopyLink}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-background px-2 text-xs text-muted-foreground">OR</span>
              </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditMode ? 'Name' : 'Add Manually'}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} disabled={isSubmitting || (isEditMode && memberToEdit.isYou)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9876543210" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Member')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
