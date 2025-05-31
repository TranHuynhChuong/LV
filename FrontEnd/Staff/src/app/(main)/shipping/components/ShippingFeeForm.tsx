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
import { Input } from '@/components/ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CircleHelp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import AddressSelect from './addressSelect';
import ConfirmDialog from '@/components/ConfirmDialog';
import FormFooterActions from '@/components/FormFooterActions';

const formSchema = z
  .object({
    provinceId: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().optional()
    ) as z.ZodType<number | undefined>,
    fee: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z
        .number()
        .optional()
        .refine((val) => val !== undefined, {
          message: 'Vui lòng nhập giá phí',
        })
    ) as z.ZodType<number | undefined>,
    weight: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z
        .number()
        .optional()
        .refine((val) => val !== undefined, {
          message: 'Vui lòng nhập giá phí',
        })
    ) as z.ZodType<number | undefined>,

    surcharge: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number().optional()
    ) as z.ZodType<number | undefined>,
    surchargeUnit: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z
        .number()
        .optional()
        .refine((val) => val === undefined || val >= 100, {
          message: 'Đơn vị phụ phí phải lớn hơn hoặc bằng 100',
        })
    ) as z.ZodType<number | undefined>,
  })
  .refine((data) => data.surcharge === undefined || data.surchargeUnit !== undefined, {
    message: 'Vui lòng nhập đơn vị phụ phí nếu có phụ phí',
    path: ['surchargeUnit'],
  })
  .refine((data) => data.surchargeUnit === undefined || data.surcharge !== undefined, {
    message: 'Vui lòng nhập phụ phí nếu có đơn vị phụ phí',
    path: ['surcharge'],
  });

type FormValues = z.infer<typeof formSchema>;

type Props = {
  defaultValues?: Partial<FormValues>;
  onSubmit?: (data: FormValues) => void;
  onDelete?: () => void;
};

function InfoLabel({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
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
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provinceId: defaultValues.provinceId,
      fee: defaultValues.fee,
      weight: defaultValues.weight,
      surcharge: defaultValues.surcharge,
      surchargeUnit: defaultValues.surchargeUnit,
    },
  });

  const surchargeValue = form.watch('surcharge');

  useEffect(() => {
    if (!surchargeValue) {
      form.setValue('surchargeUnit', undefined);
    }
  }, [surchargeValue, form]);

  const handleSubmit = useCallback((data: FormValues) => {
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
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Phí (VND)"
                    title="Phí vận chuyển cơ bản (VND)"
                    description="Số tiền áp dụng cho đơn hàng dưới ngưỡng trọng lượng cơ bản."
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Nhập số tiền"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Trọng lượng (Kg)"
                    title="Ngưỡng trọng lượng cơ bản (kg)"
                    description="Mức trọng lượng tối đa áp dụng phí cơ bản, vượt mức sẽ tính phụ phí."
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Nhập số trọng lượng"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surcharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Phụ phí (VND)"
                    title="Phụ phí theo đơn vị (VND)"
                    description="Tính thêm cho mỗi đơn vị trọng lượng vượt mức."
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Có thể để trống hoặc nhập số"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surchargeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <InfoLabel
                    label="Đơn vị (Gram)"
                    title="Đơn vị phụ phí (Gram)"
                    description="Mỗi đơn vị vượt mức sẽ bị tính thêm một khoản phụ phí."
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={!surchargeValue}
                    placeholder="Có thể để trống hoặc nhập số"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormFooterActions
          isEditing={isEditing}
          isView={isEditing}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </form>

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        mode="delete"
      />

      {/* Dialog xác nhận thêm/cập nhật */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmSubmit}
        mode="submit"
        isEdit={isEditing}
      />
    </Form>
  );
}
