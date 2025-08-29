'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CircleHelp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import AddressSelect from './address-select';
import ConfirmDialog from '@/components/utils/confirm-dialog';
import FormFooterActions from '@/components/utils/form-footer-actions';
import { Shipping } from '@/models/shipping';
import CustomCurrencyInput from '../ui/custom-currency-input';

const formSchema: z.Schema<Shipping> = z
  .object({
    provinceId: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ) as z.ZodType<number | undefined>,
    baseFee: z.number().min(1000, { message: 'Giá trị phải lớn hơn 1.000' }),
    baseWeightLimit: z.number().min(1, { message: 'Giá trị phải lớn hơn 1' }),
    extraFeePerUnit: z.number({ required_error: 'Không được để trống' }),
    extraUnit: z.number({ required_error: 'Không được để trống' }),
  })
  .refine((data) => data.extraFeePerUnit === undefined || data.extraUnit !== undefined, {
    message: 'Vui lòng nhập đơn vị phụ phí nếu có phụ phí',
    path: ['surchargeUnit'],
  })
  .refine((data) => data.extraUnit === undefined || data.extraFeePerUnit !== undefined, {
    message: 'Vui lòng nhập phụ phí nếu có đơn vị phụ phí',
    path: ['surcharge'],
  });

type Props = {
  defaultValues?: Partial<Shipping>;
  onSubmit?: (data: Shipping) => void;
  onDelete?: () => void;
};

function InfoLabel({
  label,
  title,
  description,
}: Readonly<{
  label: string;
  title: string;
  description: string;
}>) {
  return (
    <HoverCard>
      <span>{label}</span>
      <HoverCardTrigger>
        <CircleHelp className="cursor-help" size={13} />
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-sm">{description}</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function ShippingFeeForm({
  defaultValues = {},
  onSubmit,
  onDelete,
}: Readonly<Props>) {
  const isEditing = Boolean(Object.keys(defaultValues).length);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<Shipping | null>(null);
  const form = useForm<Shipping>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provinceId: defaultValues.provinceId,
      baseFee: defaultValues.baseFee ?? 0,
      baseWeightLimit: defaultValues.baseWeightLimit ?? 0,
      extraFeePerUnit: defaultValues.extraFeePerUnit ?? 0,
      extraUnit: defaultValues.extraFeePerUnit ?? 0,
    },
  });

  const surchargeValue = form.watch('extraFeePerUnit');

  useEffect(() => {
    if (!surchargeValue) {
      form.setValue('extraUnit', undefined);
    }
  }, [surchargeValue, form]);

  const handleSubmit = useCallback((data: Shipping) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setConfirmDialogOpen(false);
    }
  }, [formDataToSubmit, onSubmit]);

  const handleConfirmDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    onDelete?.();
  }, [onDelete]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <div className="w-full p-6 space-y-6 bg-white rounded-md shadow-sm">
          <h2 className="text-lg font-medium">Thông tin phí vận chuyển</h2>

          <FormField
            control={form.control}
            name="provinceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khu vực</FormLabel>
                <FormControl>
                  <AddressSelect onChange={field.onChange} value={field.value ?? undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseFee"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Phí (VND)"
                    title="Phí vận chuyển cơ bản (VND)"
                    description="Số tiền áp dụng cho đơn hàng dưới ngưỡng trọng lượng cơ bản."
                  />
                </FormLabel>
                <FormControl>
                  <CustomCurrencyInput
                    id={field.name}
                    name={field.name}
                    value={field.value ?? ''}
                    decimalsLimit={0}
                    groupSeparator="."
                    decimalSeparator=","
                    isInvalid={!!fieldState.error}
                    onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseWeightLimit"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Trọng lượng (Kg)"
                    title="Ngưỡng trọng lượng cơ bản (kg)"
                    description="Mức trọng lượng tối đa áp dụng phí cơ bản, vượt mức sẽ tính phụ phí."
                  />
                </FormLabel>
                <FormControl>
                  <CustomCurrencyInput
                    id={field.name}
                    name={field.name}
                    value={field.value ?? ''}
                    decimalsLimit={0}
                    groupSeparator="."
                    decimalSeparator=","
                    isInvalid={!!fieldState.error}
                    onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraFeePerUnit"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Phụ phí (VND)"
                    title="Phụ phí theo đơn vị (VND)"
                    description="Tính thêm cho mỗi đơn vị trọng lượng vượt mức."
                  />
                </FormLabel>
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraUnit"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Đơn vị (Gram)"
                    title="Đơn vị phụ phí (Gram)"
                    description="Mỗi đơn vị vượt mức sẽ bị tính thêm một khoản phụ phí."
                  />
                </FormLabel>
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
              </FormItem>
            )}
          />
        </div>

        <FormFooterActions isEditing={isEditing} onDelete={() => setDeleteDialogOpen(true)} />
      </form>

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        mode="delete"
      />

      {/* Dialog xác nhận thêm/cập nhật */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmSubmit}
        mode="submit"
        isEdit={isEditing}
      />
    </Form>
  );
}
