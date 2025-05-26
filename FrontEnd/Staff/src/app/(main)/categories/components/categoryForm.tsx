'use client';

import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CategoryCombobox } from './categoriesList';

const formSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(48, 'Tên tối đa 48 ký tự'),
  parentId: z.number().nullable().optional(),
});

export type FormData = z.infer<typeof formSchema>;

type CategoryFormProps = {
  defaultValues?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
  onDelete?: () => void;
};

export default function CategoryForm({
  defaultValues,
  onSubmit,
  onDelete,
}: Readonly<CategoryFormProps>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: null,
      name: '',
      parentId: null,
      ...defaultValues,
    },
  });

  const handleSubmit = (data: FormData) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onDelete?.();
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 space-y-4" noValidate>
          <div className="w-full p-6 space-y-6 bg-white rounded-md shadow-sm">
            <h2 className="font-medium">Thông tin thể loại</h2>

            {isEditing && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã thể loại</FormLabel>
                    <FormControl>
                      <Input disabled {...field} value={field.value ?? ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thể loại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thể loại cha</FormLabel>
                  <FormControl>
                    <CategoryCombobox
                      value={field.value ?? null}
                      onChange={(val) => field.onChange(val)}
                      excludeId={form.getValues('id') ?? null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="sticky bottom-0 flex items-center w-full p-6 space-x-4 bg-white rounded-md shadow-sm h-fit">
            <Button
              type="submit"
              className={isEditing ? 'flex-1 cursor-pointer' : 'flex-2 cursor-pointer'}
            >
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </Button>

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
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
        </form>
      </Form>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa?</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10" />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận thêm/cập nhật */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Xác nhận cập nhật?' : 'Xác nhận thêm?'}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10" />
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit} className="cursor-pointer">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
