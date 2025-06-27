'use client';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 1. Định nghĩa schema validate
const formSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  taxCode: z.string().min(1, 'Vui lòng nhập mã số thuế'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  email: z.string().email('Email không hợp lệ'),
});

// 2. Export types
export type InvoiceFormData = z.infer<typeof formSchema>;

export type InvoiceFormHandle = {
  submit: () => Promise<InvoiceFormData | null>;
};

type Props = {
  defaultValue?: Partial<InvoiceFormData>;
};

// 3. Component chính
const InvoiceForm = forwardRef<InvoiceFormHandle, Props>(({ defaultValue }, ref) => {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValue?.name ?? '',
      taxCode: defaultValue?.taxCode ?? '',
      address: defaultValue?.address ?? '',
      email: defaultValue?.email ?? '',
    },
  });

  // Expose hàm submit ra ngoài qua ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      let result: InvoiceFormData | null = null;
      await form.handleSubmit((data) => {
        result = data;
      })();
      return result;
    },
  }));

  // 4. Mảng cấu hình các trường
  const fields: {
    label: string;
    name: keyof InvoiceFormData;
    type?: string;
    colSpan2?: boolean;
  }[] = [
    { label: 'Họ tên', name: 'name' },
    { label: 'Mã số thuế', name: 'taxCode' },
    { label: 'Địa chỉ', name: 'address', colSpan2: true },
    { label: 'Email nhận hóa đơn', name: 'email', type: 'email', colSpan2: true },
  ];

  return (
    <Form {...form}>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((fieldConfig) => (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }) => (
              <FormItem className={fieldConfig.colSpan2 ? 'md:col-span-2' : ''}>
                <FormLabel>{fieldConfig.label}</FormLabel>
                <FormControl>
                  <Input {...field} type={fieldConfig.type ?? 'text'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </form>
    </Form>
  );
});

InvoiceForm.displayName = 'InvoiceForm';
export default InvoiceForm;
