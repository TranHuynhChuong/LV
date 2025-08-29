'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = {
  isEditing?: boolean;
  isViewing?: boolean;
  onDelete?: () => void;
};

export default function FormFooterActions({
  isEditing = false,
  isViewing = false,
  onDelete,
}: Readonly<Props>) {
  const router = useRouter();

  return (
    <div className="flex items-center w-full p-6 space-x-4 bg-white rounded-md shadow-sm h-fit">
      {!isViewing && (
        <Button type="submit" className={`${isEditing ? 'flex-1' : 'flex-2'} cursor-pointer`}>
          {isEditing ? 'Cập nhật' : 'Thêm'}
        </Button>
      )}

      {!isViewing && isEditing && onDelete && (
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
        {isViewing ? 'Thoát' : 'Hủy'}
      </Button>
    </div>
  );
}
