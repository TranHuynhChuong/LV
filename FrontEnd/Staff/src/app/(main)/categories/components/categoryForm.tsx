'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CategoryList from './categoriesList'; // đường dẫn tùy chỉnh
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Tên thể loại tối thiểu 2 ký tự').max(24, 'Tên thể loại tối đa 24 ký tự'),
  parentId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

type Props = {
  categories: Category[];
  defaultValues?: Partial<FormValues>;
  onSubmit?: (data: FormValues) => void;
};

export default function CategoryForm({
  categories,
  defaultValues,
  onSubmit,
}: Props) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      parentId: defaultValues?.parentId ?? null,
    },
  });

  // Để lưu category được chọn (id) trong dropdown
  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    defaultValues?.parentId ?? null
  );

  const handleSubmit = (data: FormValues) => {
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        className="space-y-6 p-6 bg-white rounded-md shadow-md"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter category name" autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <CategoryList
                  categories={categories}
                  // Khi chọn, gọi setValue của react-hook-form
                  onSelect={(id: string | null) => {
                    setSelectedParentId(id);
                    field.onChange(id);
                  }}
                  selectedId={selectedParentId ?? undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4 justify-end">
          <Button type="submit" className="cursor-pointer">
            Submit
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
