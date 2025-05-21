'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AddressSelect from './addressSelect';

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
  // Nếu có surcharge nhưng không có surchargeUnit → lỗi ở surchargeUnit
  .refine((data) => data.surcharge === undefined || data.surchargeUnit !== undefined, {
    message: 'Vui lòng nhập đơn vị phụ phí nếu có phụ phí',
    path: ['surchargeUnit'],
  })
  // Nếu có surchargeUnit nhưng không có surcharge → lỗi ở surcharge
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

export default function ShippingFeeForm({ defaultValues, onSubmit, onDelete }: Readonly<Props>) {
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormValues | null>(null);

  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provinceId: defaultValues?.provinceId ?? undefined,
      fee: defaultValues?.fee,
      weight: defaultValues?.weight,
      surcharge: defaultValues?.surcharge,
      surchargeUnit: defaultValues?.surchargeUnit,
    },
  });

  const surchargeValue = form.watch('surcharge');

  useEffect(() => {
    if (!surchargeValue) {
      form.setValue('surchargeUnit', undefined);
    }
  }, [surchargeValue, form]);

  const handleSubmit = (data: FormValues) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 " noValidate>
        <div className="w-full p-6 space-y-6 bg-white shadow-sm rounded-md">
          <h2 className=" font-medium text-lg">Thông tin phí vận chuyển</h2>

          {/* Tỉnh/Thành phố */}
          <FormField
            control={form.control}
            name="provinceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khu vực</FormLabel>
                <FormControl>
                  <AddressSelect
                    onChange={(val) => field.onChange(val)}
                    value={field.value ?? undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phí vận chuyển */}
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <HoverCard>
                    <span>Phí (VND)</span>
                    <HoverCardTrigger>
                      <CircleHelp className="cursor-help" size={13} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="top">
                      <h4 className="text-sm font-semibold">Phí vận chuyển cơ bản (VND)</h4>
                      <p className="text-sm">
                        Số tiền áp dụng cho đơn hàng dưới ngưỡng trọng lượng cơ bản.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
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

          {/* Trọng lượng */}
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <HoverCard>
                    <span className="cursor-help">Trọng lượng (Kg)</span>
                    <HoverCardTrigger>
                      <CircleHelp className="cursor-help" size={13} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="top">
                      <h4 className="text-sm font-semibold">Ngưỡng trọng lượng cơ bản (kg)</h4>
                      <p className="text-sm">
                        Mức trọng lượng tối đa áp dụng phí cơ bản, vượt mức sẽ tính phụ phí.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
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

          {/* Phụ phí */}
          <FormField
            control={form.control}
            name="surcharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <HoverCard>
                    <span className="cursor-help">Phụ phí (VND)</span>
                    <HoverCardTrigger>
                      <CircleHelp className="cursor-help" size={13} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="top">
                      <h4 className="text-sm font-semibold">Phụ phí theo đơn vị (VND)</h4>
                      <p className="text-sm">Tính thêm cho mỗi đơn vị trọng lượng vượt mức.</p>
                    </HoverCardContent>
                  </HoverCard>
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

          {/* Đơn vị phụ phí */}
          <FormField
            control={form.control}
            name="surchargeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <HoverCard>
                    <span className="cursor-help">Đơn vị (Gram)</span>
                    <HoverCardTrigger>
                      <CircleHelp className="cursor-help" size={13} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="top">
                      <h4 className="text-sm font-semibold">Đơn vị phụ phí (Gram)</h4>
                      <p className="text-sm">
                        Mỗi đơn vị vượt mức sẽ bị tính thêm một khoản phụ phí.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
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
        <div className="w-full h-fit p-6 bg-white sticky bottom-0 flex items-center space-x-4 rounded-md shadow">
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
      </form>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa phí vận chuyển này?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <div className="w-full h-10"></div>
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
              {isEditing ? 'Xác nhận cập nhật phí vận chuyển?' : 'Xác nhận thêm phí vận chuyển?'}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-10"></div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
