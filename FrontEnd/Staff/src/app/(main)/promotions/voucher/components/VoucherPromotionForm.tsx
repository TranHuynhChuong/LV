'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

import ConfirmDialog from '@/components/ConfirmDialog';
import FormFooterActions from '@/components/FormFooterActions';

import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const VoucherPromotionSchema = z
  .object({
    code: z.string({ required_error: 'Không được để trống' }).max(7),
    from: z.date({ required_error: 'Không được để trống' }),
    to: z.date({ required_error: 'Không được để trống' }),
    type: z.enum(['1', '2'], { required_error: 'Loại mã giảm không hợp lệ' }),
    isPercentage: z.boolean(),
    discountValue: z
      .number({ required_error: 'Không được để trống' })
      .min(0, 'Giá trị giảm phải >= 0'),
    minOrderValue: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(), // nếu là phần trăm
  })
  .refine((data) => data.to > data.from, {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['to'],
  })
  .refine((data) => (data.isPercentage ? !!data.maxDiscount : true), {
    message: 'Phải nhập giá trị giảm tối đa',
    path: ['maxDiscount'],
  });

export type VoucherPromotionFormType = z.infer<typeof VoucherPromotionSchema>;

type VoucherPromotionFormProps = {
  defaultValues?: VoucherPromotionFormType;
  onSubmit?: (data: VoucherPromotionFormType) => void;
};

export default function VoucherPromotionForm({
  defaultValues,
  onSubmit,
}: Readonly<VoucherPromotionFormProps>) {
  const form = useForm<VoucherPromotionFormType>({
    resolver: zodResolver(VoucherPromotionSchema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const { control } = form;
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<VoucherPromotionFormType | null>(null);

  const handleSubmit = (data: VoucherPromotionFormType) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 " noValidate>
          <section className="p-6 space-y-4 bg-white rounded-sm shadow">
            <h3 className={`font-medium ${isEditing ? 'pb-6' : ''}`}>Thông tin cơ bản</h3>
            <FormField
              control={control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="items-start w-32 mt-2 sm:justify-end">
                    Mã khuyến mãi
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <div className="relative w-full ">
                        <Input
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          maxLength={7}
                          className="pr-12"
                          disabled={isEditing}
                        />
                        <span className="absolute text-sm -translate-y-1/2 top-1/2 right-3 text-muted-foreground whitespace-nowrap">
                          {field.value?.length ?? 0} / 7
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-4 ">
              <FormField
                control={control}
                name="from"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="items-start w-32 mt-2 sm:justify-end">Bắt đầu</FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl className="w-fit">
                        <Input
                          type="datetime-local"
                          value={
                            field.value instanceof Date && !isNaN(field.value.getTime())
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ''
                          }
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="to"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="items-start w-32 mt-2 sm:justify-end">Kết thúc</FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl className="w-fit">
                        <Input
                          type="datetime-local"
                          value={
                            field.value instanceof Date && !isNaN(field.value.getTime())
                              ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                              : ''
                          }
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="p-6 space-y-6 bg-white rounded-sm shadow">
            {/* Loại mã giảm */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Loại mã giảm</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <Select
                        value={String(field.value ?? 2)}
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại mã" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1"> Giảm hóa đơn</SelectItem>
                          <SelectItem value="2">Giảm vận chuyển</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isPercentage"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row items-center">
                  <FormLabel className="w-32 mt-2">Giảm theo %</FormLabel>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Giá trị giảm */}
            <FormField
              control={control}
              name="discountValue"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Giá trị giảm</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Đơn hàng tối thiểu */}
            <FormField
              control={control}
              name="minOrderValue"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Đơn tối thiểu</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Giảm tối đa (chỉ hiện khi isPercentage là true) */}
            {form.watch('isPercentage') && (
              <FormField
                control={control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="w-32 mt-2">Giảm tối đa</FormLabel>
                    <div className="flex flex-col flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </section>

          <FormFooterActions isEditing={isEditing} />
        </form>
      </Form>

      {/* Dialog xác nhận thêm/cập nhật */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmSubmit}
        mode="submit"
        isEdit={isEditing}
      />
    </div>
  );
}
