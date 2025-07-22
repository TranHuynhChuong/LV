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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '@/components/utils/ConfirmDialog';
import FormFooterActions from '@/components/utils/FormFooterActions';
import { Staff } from '@/models/accounts';

const formSchema: z.Schema<Staff> = z.object({
  id: z.string().optional(), // Mã nhân viên - chỉ dùng khi chỉnh sửa
  fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(48, 'Họ tên tối đa 48 ký tự'),
  phone: z.string().regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ (9-11 số)'),
  email: z.string().email('Email không hợp lệ').max(128, 'Email không được vượt quá 128 ký tự'),
  role: z.string(),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
});

type StaffFormProps = {
  defaultValues?: Partial<Staff>;
  onSubmit?: (data: Staff) => void;
  onDelete?: () => void;
  isViewing?: boolean;
};

export function StaffForm({
  defaultValues,
  onSubmit,
  onDelete,
  isViewing,
}: Readonly<StaffFormProps>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
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
      role: '3',
      password: '',
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

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete?.();
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
                      <Input disabled {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ tên" {...field} disabled={isViewing} />
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
                    <Input placeholder="Nhập số điện thoại" {...field} disabled={isViewing} />
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
                    <Input type="email" placeholder="Nhập email" {...field} disabled={isViewing} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full" disabled={isViewing}>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                      disabled={isViewing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormFooterActions
            isEditing={isEditing}
            isViewing={isViewing}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
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
