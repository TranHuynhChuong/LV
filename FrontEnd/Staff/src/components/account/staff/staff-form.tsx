'use client';

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ConfirmDialog from '@/components/utils/confirm-dialog';
import FormFooterActions from '@/components/utils/form-footer-actions';
import { Staff } from '@/models/accounts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema: z.Schema<Staff> = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(48, 'Họ tên tối đa 48 ký tự'),
  phone: z.string().regex(/^\d{9,11}$/, 'Số điện thoại không hợp lệ (9-11 số)'),
  email: z.string().email('Email không hợp lệ').max(128, 'Email không được vượt quá 128 ký tự'),
  role: z.number(),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
  isBlock: z.boolean(),
});

type Props = {
  defaultValues?: Partial<Staff>;
  onSubmit?: (data: Staff) => void;
  isViewing?: boolean;
};

export default function StaffForm({ defaultValues, onSubmit, isViewing }: Readonly<Props>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<Staff | null>(null);
  const roleOptions = [
    { label: 'Quản trị', value: '1' },
    { label: 'Quản lý', value: '2' },
    { label: 'Bán hàng', value: '3' },
  ];
  const form = useForm<Staff>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      fullName: '',
      phone: '',
      email: '',
      role: 3,
      password: '',
      isBlock: false,
      ...defaultValues,
    },
  });

  const handleSubmit = (data: Staff) => {
    setFormDataToSubmit(data);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 space-y-4" noValidate>
          <div className="w-full p-6 space-y-6 bg-white rounded-md shadow-sm">
            <h2 className="font-medium">Thông tin nhân viên</h2>
            {isEditing && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã nhân viên</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="isBlock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khóa tài khoản</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                      disabled={isViewing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ tên" {...field} readOnly={isViewing} />
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
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại" {...field} readOnly={isViewing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Nhập email" {...field} readOnly={isViewing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Vai trò</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer" disabled={isViewing}>
                        <SelectValue placeholder="Chọn vai trò" className="cursor-pointer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {roleOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Nhập mật khẩu"
                      {...field}
                      readOnly={isViewing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormFooterActions isEditing={isEditing} isViewing={isViewing} />
        </form>
      </Form>

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
