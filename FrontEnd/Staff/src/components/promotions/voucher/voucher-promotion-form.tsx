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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ConfirmDialog from '@/components/utils/confirm-dialog';
import FormFooterActions from '@/components/utils/form-footer-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Voucher } from '@/models/voucher';
import CustomCurrencyInput from '@/components/ui/custom-currency-input';

const VoucherPromotionSchema: z.Schema<Voucher> = z
  .object({
    voucherId: z.string({ required_error: 'Không được để trống' }).max(7),
    startDate: z.date({
      required_error: 'Không được để trống',
      invalid_type_error: 'Ngày không hợp lệ',
    }),
    endDate: z.date({
      required_error: 'Không được để trống',
      invalid_type_error: 'Ngày không hợp lệ',
    }),
    type: z.string({ required_error: 'Không được để trống' }),
    isPercentage: z.boolean().optional().default(false),
    value: z.number({ required_error: 'Không được để trống' }).min(0, 'Giá trị giảm phải >= 0'),
    minValue: z.number().min(0).optional(),
    maxValue: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    if (data.startDate && data.startDate <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu phải lớn hơn hiện tại',
        path: ['startDate'],
      });
    }

    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        path: ['endDate'],
      });
    }
  });

type Props = {
  defaultValues?: Voucher;
  onSubmit?: (data: Voucher) => void;
  onDelete?: () => void;
  isViewing?: boolean;
};

export default function VoucherPromotionForm({
  defaultValues,
  onSubmit,
  onDelete,
  isViewing = false,
}: Readonly<Props>) {
  const form = useForm<Voucher>({
    resolver: zodResolver(VoucherPromotionSchema),
    defaultValues: {
      ...defaultValues,
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : undefined,
    },
  });

  const { control, watch } = form;
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<Voucher | null>(null);

  const handleSubmit = (data: Voucher) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  };

  const handleDelete = () => {
    onDelete?.();
    setDeleteDialogOpen(false);
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          <section className="p-6 space-y-4 bg-white rounded-sm shadow">
            <h3 className={`font-medium ${isEditing ? 'pb-6' : ''}`}>Thông tin cơ bản</h3>
            <FormField
              control={control}
              name="voucherId"
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
                          readOnly={isEditing ?? isViewing}
                        />
                        <span className="absolute text-sm -translate-y-1/2 top-1/2 right-3 text-muted-foreground whitespace-nowrap">
                          {String(field.value ?? '').length} / 7
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
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="items-start w-32 mt-2 sm:justify-end">Bắt đầu</FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl className="w-fit">
                        <Input
                          type="datetime-local"
                          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          value={
                            field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? new Date(val) : null);
                          }}
                          readOnly={isViewing}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="items-start w-32 mt-2 sm:justify-end">Kết thúc</FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl className="w-fit">
                        <Input
                          type="datetime-local"
                          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          value={
                            field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? new Date(val) : null);
                          }}
                          readOnly={isViewing}
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
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Loại mã giảm</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <Select
                        value={String(field.value ?? '')}
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                        disabled={isViewing}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại mã" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hd"> Giảm hóa đơn</SelectItem>
                          <SelectItem value="vc">Giảm vận chuyển</SelectItem>
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
                <FormItem className="flex flex-col items-center sm:flex-row">
                  <FormLabel className="w-32 mt-2">Giảm theo %</FormLabel>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={isViewing}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="value"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Giá trị giảm</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <CustomCurrencyInput
                        id={field.name}
                        name={field.name}
                        value={field.value ?? ''}
                        decimalsLimit={0}
                        groupSeparator="."
                        decimalSeparator=","
                        prefix={form.watch('isPercentage') ? '%' : '₫'}
                        isInvalid={!!fieldState.error}
                        onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="minValue"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col sm:flex-row">
                  <FormLabel className="w-32 mt-2">Đơn tối thiểu</FormLabel>
                  <div className="flex flex-col flex-1">
                    <FormControl>
                      <CustomCurrencyInput
                        id={field.name}
                        name={field.name}
                        value={field.value ?? ''}
                        decimalsLimit={0}
                        groupSeparator="."
                        decimalSeparator=","
                        prefix="₫"
                        isInvalid={!!fieldState.error}
                        onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {form.watch('isPercentage') && (
              <FormField
                control={control}
                name="maxValue"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="w-32 mt-2">Giảm tối đa</FormLabel>
                    <div className="flex flex-col flex-1">
                      <FormControl>
                        <CustomCurrencyInput
                          id={field.name}
                          name={field.name}
                          value={field.value ?? ''}
                          decimalsLimit={0}
                          groupSeparator="."
                          decimalSeparator=","
                          prefix="₫"
                          isInvalid={!!fieldState.error}
                          onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </section>
          <FormFooterActions
            isEditing={isEditing}
            {...(watch('startDate') &&
              watch('startDate') > new Date() && {
                onDelete: () => setDeleteDialogOpen(true),
              })}
            isViewing={isViewing}
          />
        </form>
      </Form>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmSubmit}
        mode="submit"
        isEdit={isEditing}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        mode="delete"
      />
    </div>
  );
}
