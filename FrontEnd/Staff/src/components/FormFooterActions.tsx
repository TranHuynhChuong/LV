'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type FormFooterActionsProps = {
  readonly isEditing?: boolean;
  readonly isView?: boolean;
  readonly onDelete?: () => void;
};

export default function FormFooterActions({
  isEditing = false,
  isView = false,
  onDelete,
}: FormFooterActionsProps) {
  const router = useRouter();

  if (isView) return null;

  return (
    <div className="flex items-center w-full p-6 space-x-4 bg-white rounded-md shadow-sm h-fit">
      <Button
        type="submit"
        className={isEditing ? 'flex-1 cursor-pointer' : 'flex-2 cursor-pointer'}
      >
        {isEditing ? 'Cập nhật' : 'Thêm'}
      </Button>

      {isEditing && onDelete && (
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          className="flex-1 cursor-pointer"
        >
          Xóa
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        className="flex-1 cursor-pointer"
      >
        Hủy
      </Button>
    </div>
  );
}
