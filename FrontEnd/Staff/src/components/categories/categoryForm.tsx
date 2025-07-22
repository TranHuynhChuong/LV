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

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CategoryCombobox from './categoriesCombobox';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import FormFooterActions from '@/components/utils/FormFooterActions';
import { Category } from '@/models/categories';

const formSchema: z.Schema<Category> = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(48, 'Tên tối đa 48 ký tự'),
  parentId: z.number().nullable().optional(),
});

type CategoryFormProps = {
  defaultValues?: Partial<Category>;
  onSubmit?: (data: Category) => void;
  onDelete?: () => void;
};

export default function CategoryForm({
  defaultValues,
  onSubmit,
  onDelete,
}: Readonly<CategoryFormProps>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<Category | null>(null);

  const form = useForm<Category>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: null,
      name: '',
      parentId: null,
      ...defaultValues,
    },
  });

  const handleSubmit = (data: Category) => {
    setFormDataToSubmit(data);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
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
                      onChange={(val) => field.onChange(val?.[0])}
                      excludeId={form.getValues('id') ?? null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormFooterActions isEditing={isEditing} onDelete={() => setIsDeleteDialogOpen(true)} />
        </form>
      </Form>

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        mode="delete"
      />

      {/* Dialog xác nhận thêm/cập nhật */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmSubmit}
        mode="submit"
        isEdit={isEditing}
      />
    </div>
  );
}
