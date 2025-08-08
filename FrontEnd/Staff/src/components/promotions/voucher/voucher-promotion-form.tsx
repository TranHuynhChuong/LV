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
import { VoucherPromotionDetail } from '@/models/promotionVoucher';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CurrencyInput from 'react-currency-input-field';

const VoucherPromotionSchema: z.Schema<VoucherPromotionDetail> = z
  .object({
    id: z.string({ required_error: 'Không được để trống' }).max(7),
    startAt: z.date({ required_error: 'Không được để trống' }),
    endAt: z.date({ required_error: 'Không được để trống' }),
    type: z.string({ required_error: 'Không được để trống' }),
    isPercentage: z.boolean().optional().default(false),
    discountValue: z
      .number({ required_error: 'Không được để trống' })
      .min(0, 'Giá trị giảm phải >= 0'),
    minOrderValue: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    if (data.startAt && data.startAt <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu phải lớn hơn hiện tại',
        path: ['startAt'],
      });
    }

    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        path: ['endAt'],
      });
    }
  });

type Props = {
  defaultValues?: VoucherPromotionDetail;
  onSubmit?: (data: VoucherPromotionDetail) => void;
  onDelete?: () => void;
  isViewing?: boolean;
};

export default function VoucherPromotionForm({
  defaultValues,
  onSubmit,
  onDelete,
  isViewing = false,
}: Readonly<Props>) {
  const form = useForm<VoucherPromotionDetail>({
    resolver: zodResolver(VoucherPromotionSchema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const { control, watch } = form;
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<VoucherPromotionDetail | null>(null);

  const handleSubmit = (data: VoucherPromotionDetail) => {
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
          <fieldset className="space-y-4">
            <section className="p-6 space-y-4 bg-white rounded-sm shadow">
              <h3 className={`font-medium ${isEditing ? 'pb-6' : ''}`}>Thông tin cơ bản</h3>
              <FormField
                control={control}
                name="id"
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
                  name="startAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row">
                      <FormLabel className="items-start w-32 mt-2 sm:justify-end">
                        Bắt đầu
                      </FormLabel>
                      <div className="flex flex-col flex-1 space-y-1">
                        <FormControl className="w-fit">
                          <Input
                            type="datetime-local"
                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                            value={
                              field.value instanceof Date && !isNaN(field.value.getTime())
                                ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                : ''
                            }
                            onChange={(e) => field.onChange(new Date(e.target.value))}
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
                  name="endAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row">
                      <FormLabel className="items-start w-32 mt-2 sm:justify-end">
                        Kết thúc
                      </FormLabel>
                      <div className="flex flex-col flex-1 space-y-1">
                        <FormControl className="w-fit">
                          <Input
                            type="datetime-local"
                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                            value={
                              field.value instanceof Date && !isNaN(field.value.getTime())
                                ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                : ''
                            }
                            onChange={(e) => field.onChange(new Date(e.target.value))}
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
                name="discountValue"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="w-32 mt-2">Giá trị giảm</FormLabel>
                    <div className="flex flex-col flex-1">
                      <FormControl>
                        <CurrencyInput
                          value={field.value ?? ''}
                          onValueChange={(value) => field.onChange(Number(value))}
                          className="w-full pl-2.5 py-1.5 border border-gray-300 rounded-md"
                          decimalsLimit={0}
                          groupSeparator="."
                          decimalSeparator=","
                          prefix={form.watch('isPercentage') ? '%' : '₫'}
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
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row">
                    <FormLabel className="w-32 mt-2">Đơn tối thiểu</FormLabel>
                    <div className="flex flex-col flex-1">
                      <FormControl>
                        <CurrencyInput
                          value={field.value ?? ''}
                          onValueChange={(value) => field.onChange(Number(value))}
                          className="w-full pl-2.5 py-1.5 border border-gray-300 rounded-md"
                          decimalsLimit={0}
                          groupSeparator="."
                          decimalSeparator=","
                          prefix="₫"
                          readOnly={isViewing}
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
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row">
                      <FormLabel className="w-32 mt-2">Giảm tối đa</FormLabel>
                      <div className="flex flex-col flex-1">
                        <FormControl>
                          <CurrencyInput
                            value={field.value ?? ''}
                            onValueChange={(value) => field.onChange(Number(value))}
                            className="w-full pl-2.5 py-1.5 border border-gray-300 rounded-md"
                            decimalsLimit={0}
                            groupSeparator="."
                            decimalSeparator=","
                            prefix="₫"
                            readOnly={isViewing}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </section>
          </fieldset>
          <FormFooterActions
            isEditing={isEditing}
            {...(watch('startAt') &&
              watch('startAt') > new Date() && {
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
