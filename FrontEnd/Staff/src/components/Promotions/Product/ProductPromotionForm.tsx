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

import ConfirmDialog from '@/components/utils/ConfirmDialog';
import FormFooterActions from '@/components/utils/FormFooterActions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import ProductDiscountTable from './ProductDiscountTable';

import { format } from 'date-fns';
import { ProductPromotionDetail } from '@/models/promotionProduct';
import { ProductOverView } from '@/models/products';
import ProductTab from '@/components/products/productTab';

const ProductPromotionSchema: z.Schema<ProductPromotionDetail> = z
  .object({
    name: z.string().max(128).optional(),
    from: z.date({ required_error: 'Không được để trống' }),
    to: z.date({ required_error: 'Không được để trống' }),
    details: z.array(
      z.object({
        productId: z.number(),
        isPercent: z.boolean(),
        value: z.number(),
        isBlocked: z.boolean(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    if (data.from && data.from <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu phải lớn hơn hiện tại',
        path: ['from'],
      });
    }

    if (data.from && data.to && data.to <= data.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        path: ['to'],
      });
    }
  });

type ProductPromotionFormProps = {
  defaultValues?: ProductPromotionDetail;
  availableProducts?: ProductOverView[];
  onSubmit?: (data: ProductPromotionDetail) => void;
  onDelete?: () => void;
  isViewing?: boolean;
};

type Detail = {
  value: number;
  productId: number;
  isPercent: boolean;
  isBlocked: boolean;
};

export default function ProductPromotionForm({
  defaultValues,
  availableProducts,
  onSubmit,
  onDelete,
  isViewing = false,
}: Readonly<ProductPromotionFormProps>) {
  const form = useForm<ProductPromotionDetail>({
    resolver: zodResolver(ProductPromotionSchema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const { control, register, watch, setValue } = form;
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<ProductPromotionDetail | null>(null);

  const [openProductTable, setOpenProductTable] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<ProductOverView[]>(availableProducts ?? []);
  const [detail, setDetail] = useState<Detail[]>(defaultValues?.details ?? []);

  const handleSubmit = (data: ProductPromotionDetail) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit);
      setConfirmDialogOpen(false);
    }
  };

  const handleDelete = () => {
    onDelete?.();
    setDeleteDialogOpen(false);
  };

  const handleSelect = (selecData: ProductOverView[]) => {
    const filteredNewProducts = selecData.filter((p) => !selectedData.some((sd) => sd.id === p.id));

    setSelectedData([...selectedData, ...filteredNewProducts]);

    const newDetails = filteredNewProducts.map((p) => ({
      productId: p.id,
      isPercent: true,
      value: 0,
      isBlocked: false,
    }));

    const currentDetails = watch('details') || [];
    setValue('details', [...currentDetails, ...newDetails]);

    setDetail([...detail, ...newDetails]);
    setOpenProductTable(false);
  };

  const handleRemove = (id: number) => {
    setSelectedData((prev) => prev.filter((p) => p.id !== id));
    setDetail((prev) => prev.filter((p) => p.productId !== id));
    const currentDetail = watch('details') || [];
    const newDetail = currentDetail.filter((d: Detail) => d.productId !== id);
    setValue('details', newDetail);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          <fieldset disabled={isViewing} className="space-y-4">
            <section className="p-6 space-y-4 bg-white rounded-sm shadow">
              <h3 className={`font-medium ${isEditing ? 'pb-6' : ''}`}>Thông tin cơ bản</h3>

              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-32 mt-2 sm:justify-end">
                      Tên khuyến mãi
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <div className="relative w-full ">
                          <Input
                            value={field.value ?? ''}
                            maxLength={128}
                            onChange={field.onChange}
                            className="pr-18"
                          />
                          <span className="absolute text-sm -translate-y-1/2 top-1/2 right-3 text-muted-foreground whitespace-nowrap">
                            {field.value?.length ?? 0} / 48
                          </span>
                        </div>
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                      </div>
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
                            disabled={isEditing && field.value && field.value < new Date()}
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
              <div className="flex justify-between flex-1">
                <div>
                  <h2 className="font-medium">Sản phẩm khuyến mãi</h2>
                  <p className="text-xs">
                    Tổng cộng <strong>{selectedData.length}</strong> sản phẩm
                  </p>
                </div>

                <Button
                  className="font-normal cursor-pointer border-zinc-700"
                  variant="outline"
                  type="button"
                  onClick={() => setOpenProductTable(true)}
                  disabled={isViewing}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
                </Button>
              </div>

              <ProductDiscountTable
                isViewing={isViewing}
                products={selectedData}
                detail={detail}
                register={register}
                watch={watch}
                setValue={setValue}
                onRemove={handleRemove}
              />
            </section>
          </fieldset>
          <FormFooterActions
            isEditing={isEditing}
            {...(watch('from') &&
              watch('from') > new Date() && {
                onDelete: () => setDeleteDialogOpen(true),
              })}
            isViewing={isViewing}
          />
        </form>
      </Form>
      {openProductTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-500/50 py-12">
          <div className="max-h-[90vh] max-w-full overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="overflow-y-auto max-h-[90vh] p-6">
              <ProductTab
                status="noPromotion"
                currentPage={1}
                selectedData={selectedData}
                onClose={() => setOpenProductTable(false)}
                onConfirmSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận thêm/cập nhật */}
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
