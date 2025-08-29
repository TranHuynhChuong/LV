'use client';

import { BookTab } from '@/components/books/book-tab-dynamic-import';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/utils/confirm-dialog';
import FormFooterActions from '@/components/utils/form-footer-actions';
import { Book } from '@/models/book';
import { Promotion, PromotionDetail } from '@/models/promotion';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import BookDiscountTable from './book-discount-table';

export const PromotionDetailSchema: z.Schema<PromotionDetail> = z.object({
  bookId: z.number(),
  percentageBased: z.boolean(),
  value: z.number(),
  purchasePrice: z.number(),
});

const BookPromotionSchema: z.Schema<Promotion> = z
  .object({
    promotionName: z.string().max(128).optional(),
    startDate: z.date({
      required_error: 'Không được để trống',
      invalid_type_error: 'Ngày không hợp lệ',
    }),
    endDate: z.date({
      required_error: 'Không được để trống',
      invalid_type_error: 'Ngày không hợp lệ',
    }),
    detail: z.array(PromotionDetailSchema),
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
  defaultValues?: Promotion;
  dataSelected?: Book[];
  onSubmit?: (data: Promotion) => void;
  onDelete?: () => void;
  isViewing?: boolean;
};

export default function BookPromotionForm({
  defaultValues,
  dataSelected,
  onSubmit,
  onDelete,
  isViewing = false,
}: Readonly<Props>) {
  const form = useForm<Promotion>({
    resolver: zodResolver(BookPromotionSchema),
    defaultValues: {
      ...defaultValues,
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : undefined,
    },
  });
  const { control, register, watch, setValue } = form;
  const isEditing = Boolean(defaultValues && Object.keys(defaultValues).length > 0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<Promotion | null>(null);
  const [openBookTable, setOpenBookTable] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Book[]>(dataSelected ?? []);
  const [detail, setDetail] = useState<PromotionDetail[]>(defaultValues?.detail ?? []);

  const handleSubmit = (data: Promotion) => {
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

  const handleSelect = (selecData: Book[]) => {
    const filteredNewBooks = selecData.filter(
      (p) => !selectedData.some((sd) => sd.bookId === p.bookId)
    );
    setSelectedData([...selectedData, ...filteredNewBooks]);
    const newDetails = filteredNewBooks.map((b) => ({
      bookId: b.bookId,
      percentageBased: true,
      value: 0,
      purchasePrice: undefined,
    }));
    const currentDetails = watch('detail') || [];
    setValue('detail', [...currentDetails, ...newDetails]);
    setDetail([...detail, ...newDetails]);
    setOpenBookTable(false);
  };

  const handleRemove = (id: number) => {
    setSelectedData((prev) => prev.filter((p) => p.bookId !== id));
    setDetail((prev) => prev.filter((p) => p.bookId !== id));
    const currentDetail = watch('detail') || [];
    const newDetail = currentDetail.filter((d: PromotionDetail) => d.bookId !== id);
    setValue('detail', newDetail);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          <section className="p-6 space-y-4 bg-white rounded-sm shadow">
            <h3 className={`font-medium ${isEditing ? 'pb-6' : ''}`}>Thông tin cơ bản</h3>
            <FormField
              control={control}
              name="promotionName"
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
                          readOnly={isViewing}
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
          <section className="p-6 space-y-6 bg-white rounded-sm shadow w-full">
            <div className="flex justify-between flex-1">
              <div>
                <h2 className="font-medium">Sách khuyến mãi</h2>
                <p className="text-xs">
                  Tổng cộng <strong>{selectedData.length}</strong> sách
                </p>
              </div>
              <Button
                className="font-normal cursor-pointer border-zinc-700"
                variant="outline"
                type="button"
                onClick={() => setOpenBookTable(true)}
                disabled={isViewing}
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm sách
              </Button>
            </div>
            <BookDiscountTable
              isViewing={isViewing}
              books={selectedData}
              detail={detail}
              register={register}
              watch={watch}
              setValue={setValue}
              onRemove={handleRemove}
            />
          </section>
          <FormFooterActions
            isEditing={isEditing}
            {...(watch('endDate') &&
              watch('endDate') > new Date() && {
                onDelete: () => setDeleteDialogOpen(true),
              })}
            isViewing={isViewing}
          />
        </form>
      </Form>
      {openBookTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-12 bg-zinc-500/50">
          <div className="max-h-[90vh] max-w-full overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="overflow-y-auto max-h-[90vh] p-6">
              <BookTab
                status="noPromotion"
                currentPage={1}
                selectedData={selectedData}
                onClose={() => setOpenBookTable(false)}
                onConfirmSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      )}

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
