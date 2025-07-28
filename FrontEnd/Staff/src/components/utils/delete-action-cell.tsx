'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/utils/confirm-dialog';
import Loader from '@/components/utils/loader';

type Props = {
  resourceId?: string | null;
  onDelete: (id: string) => Promise<void>;
  onError?: (error: number) => void;
};

export default function DeleteActionCell({ resourceId, onDelete, onError }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleConfirmDelete = async () => {
    if (!resourceId) return;
    setIsSubmitting(true);
    onDelete(resourceId)
      .then(() => {
        toast.success('Xóa thành công');
      })
      .catch((error) => {
        if (onError) {
          if (typeof error === 'object' && error !== null && error.response.status) {
            onError?.(error.response.status);
          } else {
            onError?.(500);
          }
        } else toast.error('Xóa thất bại!');
      })
      .finally(() => {
        setIsSubmitting(false);
        setOpen(false);
      });
  };

  return (
    <>
      {isSubmitting && <Loader />}
      <button className="cursor-pointer hover:underline" onClick={() => setOpen(true)}>
        Xóa
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirmDelete}
        mode="delete"
      />
    </>
  );
}
