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

const roles = ['Admin', 'Manager', 'Sale'] as const;

const formSchema = z.object({
  id: z.string().optional(), // Mã nhân viên - chỉ dùng khi chỉnh sửa
  fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(48, 'Họ tên tối đa 48 ký tự'),
  phone: z.string().regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ (9-11 số)'),
  email: z.string().email('Email không hợp lệ').max(128, 'Email không được vượt quá 128 ký tự'),
  role: z.enum(roles, {
    errorMap: () => ({ message: 'Phải chọn vai trò' }),
  }),
  password: z
    .string()
    .min(6, 'Mật khẩu ít nhất 6 ký tự')
    .max(72, 'Mật khẩu tối đa 72 ký tự')
    .optional(),
});

export type FormData = z.infer<typeof formSchema>;

type StaffFormProps = {
  defaultValues?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
  onDelete?: () => void;
  view?: boolean;
};

export function StaffForm({ defaultValues, onSubmit, onDelete, view }: Readonly<StaffFormProps>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
  const router = useRouter();
  const isView = Boolean(view ?? false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      fullName: '',
      phone: '',
      email: '',
      role: 'Sale',
      password: '',
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
                    <Input placeholder="Nhập họ tên" {...field} disabled={isView} />
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
                    <Input placeholder="Nhập số điện thoại" {...field} disabled={isView} />
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
                    <Input type="email" placeholder="Nhập email" {...field} disabled={isView} />
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
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full" disabled={isView}>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
                    <Input type="text" placeholder="Nhập mật khẩu" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!isView && (
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
          )}
        </form>
      </Form>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa nhân viên này?</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10"></div>
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
            <DialogTitle>
              {isEditing ? 'Xác nhận cập nhật nhân viên?' : 'Xác nhận thêm nhân viên?'}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-10"></div>
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
