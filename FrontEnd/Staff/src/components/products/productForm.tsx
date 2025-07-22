'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import CurrencyInput from 'react-currency-input-field';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import CategoryCombobox from '@/components/categories/categoriesCombobox';
import { ImagePlus, Trash2 } from 'lucide-react';

import ConfirmDialog from '@/components/utils/ConfirmDialog';
import FormFooterActions from '@/components/utils/FormFooterActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_PRODUCT_IMAGES = 14;
let IS_EDITING = false;

const productSchema = z.object({
  coverImageFile: z
    .union([z.instanceof(File), z.undefined(), z.null()])
    .refine((file) => IS_EDITING || file instanceof File, {
      message: 'Không được để trống',
    }),
  productImageFiles: z.array(z.instanceof(File)).optional(),
  name: z.string({ required_error: 'Không được để trống' }).max(128),
  status: z.string(),
  category: z.array(z.number()).nonempty({ message: 'Không được để trống' }),

  summary: z.string({ required_error: 'Không được để trống' }),
  description: z.string().max(3000).optional(),
  author: z.string({ required_error: 'Không được để trống' }),
  publisher: z.string({ required_error: 'Không được để trống' }),
  publishYear: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  page: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  isbn: z.string({ required_error: 'Không được để trống' }),
  language: z.string({ required_error: 'Không được để trống' }),
  translator: z.string().optional(),
  size: z.string({ required_error: 'Không được để trống' }),
  salePrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  inventory: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  costPrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  weight: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
});

export type ProductFormValues = z.infer<typeof productSchema>;

export type ProductFormType = {
  name: string;
  category: number[];
  status: string;
  summary: string;
  description?: string;
  author: string;
  publisher: string;
  size: string;
  publishYear: number;
  page: number;
  isbn: string;
  language: string;
  translator: string;
  salePrice: number;
  inventory: number;
  costPrice: number;
  weight: number;
  coverImage: string;
  productImages: string[] | null;
};

interface ProductFormProps {
  defaultValue?: ProductFormType | null;
  onSubmit?: (newData: ProductFormValues, productImages?: string[]) => void;
  onDelete?: () => void;
}

export default function ProductForm({
  defaultValue,
  onSubmit,
  onDelete,
}: Readonly<ProductFormProps>) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'Hien',
      category: [],
      ...defaultValue,
    },
  });

  IS_EDITING = !!defaultValue;

  const { control, watch, setValue } = form;

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [formDataToSubmit, setFormDataToSubmit] = useState<ProductFormValues | null>(null);

  const [categoryLabels, setCategoryLabels] = useState<string[]>([]); // giữ lại state
  const [manualSummary, setManualSummary] = useState('');

  const name = watch('name') ?? '';
  const author = watch('author') ?? '';
  const publisher = watch('publisher') ?? '';

  const autoSummary = useMemo(() => {
    return (
      [
        name && `${name}`,
        categoryLabels.length && `Thể loại ${categoryLabels.join(', ')}`,
        author && `Tác giả ${author}`,
        publisher && `Nhà xuất bản ${publisher}`,
      ]
        .filter(Boolean)
        .join('. ') + '.'
    );
  }, [name, author, publisher, categoryLabels]);

  useEffect(() => {
    setValue('summary', `${autoSummary.trim()}\n\n${manualSummary.trim()}`);
  }, [autoSummary, manualSummary, setValue]);

  useEffect(() => {
    if (!defaultValue) return;

    setCoverImage(defaultValue.coverImage ?? null);
    setProductImages(defaultValue.productImages || []);
    const summary = defaultValue.summary ?? '';

    if (summary && autoSummary && summary.startsWith(autoSummary)) {
      const extracted = summary.slice(autoSummary.length).trimStart();
      setManualSummary(extracted);
    } else {
      setManualSummary(summary);
    }
  }, [defaultValue, autoSummary]);

  function getPreviewUrl(file: File | null) {
    if (!file) return null;
    try {
      return URL.createObjectURL(file);
    } catch {
      return null;
    }
  }

  const handleAddProductImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...productImageFiles, ...files].slice(0, MAX_PRODUCT_IMAGES);
    setProductImageFiles(combined);
    form.setValue('productImageFiles', combined);
  };

  const handleRemoveImageFile = (index: number) => {
    const newFiles = productImageFiles.filter((_, idx) => idx !== index);
    setProductImageFiles(newFiles);
    form.setValue('productImageFiles', newFiles);
  };

  const handleRemoveImage = (index: number) => {
    const ImagesLeft = productImages.filter((_, idx) => idx !== index);
    setProductImages(ImagesLeft);
  };

  const deleteCoverImage = () => {
    if (coverImage) {
      setCoverImage(null);
    } else {
      setCoverImageFile(null);
    }
  };

  const handleSubmit = (data: ProductFormValues) => {
    setFormDataToSubmit(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataToSubmit) {
      onSubmit?.(formDataToSubmit, productImages ?? []);
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onDelete?.();
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full" noValidate>
          <section className="p-8 space-y-6 bg-white rounded-sm shadow">
            <h3 className="font-medium">Thông tin cơ bản</h3>
            {/* Cover Image */}
            <FormField
              control={control}
              name="coverImageFile"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Ảnh bìa
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <div className="relative overflow-hidden rounded-md aspect-square w-40 bg-gray-50 group">
                        {!coverImageFile && !coverImage ? (
                          <label
                            className={`absolute inset-0 flex items-center justify-center transition-colors border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500 ${
                              fieldState.invalid ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setCoverImageFile(file);
                                field.onChange(file);
                              }}
                            />
                            <div className="text-xs flex flex-col items-center justify-center text-gray-400">
                              <ImagePlus />
                              (0/1)
                            </div>
                          </label>
                        ) : (
                          <div className="relative aspect-square w-40 overflow-hidden border border-gray-300 rounded-md group">
                            <Image
                              src={getPreviewUrl(coverImageFile) ?? coverImage ?? ''}
                              alt="Ảnh bìa"
                              fill
                              priority
                              sizes="160px"
                              className="object-contain"
                            />
                            <div className="absolute inset-0 transition-opacity opacity-0 bg-black/30 group-hover:opacity-100" />
                            <button
                              type="button"
                              className="absolute bottom-0 right-0 z-10 flex items-center justify-center w-full py-2 text-xs text-white transition-opacity opacity-0 cursor-pointer bg-zinc-600 group-hover:opacity-100"
                              onClick={() => {
                                deleteCoverImage();
                                field.onChange(null);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Product Images */}
            <FormField
              control={control}
              name="productImageFiles"
              render={() => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26  sm:text-end  mt-2">
                    Ảnh sản phẩm
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap max-w-md space-x-2 space-y-2">
                      {productImages.map((url, idx) => {
                        return url ? (
                          <div
                            key={idx}
                            className="relative aspect-square w-20 overflow-hidden border border-gray-300 rounded-md group"
                          >
                            <Image
                              src={url}
                              alt={`Ảnh sản phẩm ${idx + 1}`}
                              fill
                              sizes="80px"
                              className="object-contain"
                            />
                            <div className="absolute inset-0 transition-opacity opacity-0 bg-black/20 group-hover:opacity-100" />
                            <button
                              type="button"
                              className="absolute bottom-0 right-0 z-10 flex items-center justify-center w-full py-2 text-xs text-white transition-opacity opacity-0 cursor-pointer bg-zinc-600 group-hover:opacity-100"
                              onClick={() => handleRemoveImage(idx)}
                              aria-label={`Xóa ảnh ${idx + 1}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : null;
                      })}
                      {productImageFiles.map((file, idx) => {
                        const url = getPreviewUrl(file);
                        return url ? (
                          <div
                            key={idx}
                            className="relative aspect-square w-20 overflow-hidden border border-gray-300 rounded-md group"
                          >
                            <Image
                              src={url}
                              alt={`Ảnh sản phẩm ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 transition-opacity opacity-0 bg-black/20 group-hover:opacity-100" />
                            <button
                              type="button"
                              className="absolute bottom-0 right-0 z-10 flex items-center justify-center w-full py-2 text-xs text-white transition-opacity opacity-0 cursor-pointer bg-zinc-600 group-hover:opacity-100"
                              onClick={() => handleRemoveImageFile(idx)}
                              aria-label={`Xóa ảnh ${idx + 1}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : null;
                      })}

                      {productImages.length + productImageFiles.length < MAX_PRODUCT_IMAGES && (
                        <label
                          htmlFor="add-product-images"
                          className="relative flex items-center justify-center w-20 h-20 overflow-hidden transition-colors border-2 border-gray-400 border-dashed rounded-md cursor-pointer bg-gray-50 hover:border-blue-500"
                          title="Thêm ảnh sản phẩm"
                        >
                          <input
                            id="add-product-images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleAddProductImages}
                          />
                          <div className="text-xs flex flex-col items-center justify-center text-gray-400">
                            <ImagePlus />({productImages.length}/14)
                          </div>
                        </label>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Tên sách
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} maxLength={128} onChange={field.onChange} />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <div className="text-sm text-right text-muted-foreground whitespace-nowrap flex flex-1 justify-end">
                        {field.value?.length || 0} / 128
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Thể loại
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <CategoryCombobox
                        value={field.value}
                        onChange={(value) => {
                          const cleanedValue = (value || []).filter((v) => v !== undefined);
                          field.onChange(cleanedValue);
                        }}
                        onLabelChange={(labels) => {
                          setCategoryLabels(labels);
                        }}
                        className={fieldState.invalid ? 'border border-red-500 rounded-md' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Trạng thái
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Chọn trạng thái --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hien">Hiển thị</SelectItem>
                          <SelectItem value="An">Ẩn</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </section>
          {/* Detail */}
          <section className="p-6 space-y-6 bg-white rounded-sm shadow">
            <h3 className="font-medium">Thông tin chi tiết</h3>

            {/* Summary */}
            <FormField
              control={control}
              name="summary"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Tóm tắt
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <Textarea
                      value={autoSummary}
                      className="h-20 resize-none bg-muted text-muted-foreground"
                      readOnly
                    />
                    <FormControl>
                      <Textarea
                        value={manualSummary}
                        maxLength={800}
                        onChange={(e) => {
                          const newManual = e.target.value;
                          setManualSummary(newManual);
                          field.onChange(`${autoSummary} ${newManual}`.trim().replace(/\s+/g, ' '));
                        }}
                        className="h-40 resize-none"
                        placeholder="Thêm mô tả chi tiết nội dung sách..."
                      />
                    </FormControl>
                    <div className="flex justify-between mx-1">
                      <FormMessage />
                      <div className="text-sm text-right text-muted-foreground whitespace-nowrap flex flex-1 justify-end">
                        {field.value?.length ?? 0} / 800
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">Mô tả</FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Textarea
                        value={field.value ?? ''}
                        maxLength={3000}
                        onChange={field.onChange}
                        className="h-48 resize-none"
                      />
                    </FormControl>
                    <div className="flex justify-between mx-1">
                      <FormMessage />
                      <div className="text-sm text-right text-muted-foreground whitespace-nowrap flex flex-1 justify-end">
                        {field.value?.length ?? 0} / 3000
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="author"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Tác giả
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="publisher"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Nhà xuất bản
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isbn"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>ISBN
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Ngôn ngữ
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="translator"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">Người dịch</FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="size"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row ">
                  <FormLabel className="items-start w-26 sm:justify-end mt-2">
                    <span className="text-red-500">*</span>Kích thước
                  </FormLabel>
                  <div className="flex flex-col flex-1 space-y-1">
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        placeholder="Dài x Rộng x Cao (cm)"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="publishYear"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-26 sm:justify-end mt-2">
                      <span className="text-red-500">*</span>Năm xuất bản
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="page"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-26 sm:justify-end mt-2">
                      <span className="text-red-500">*</span>Số trang
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={field.value ?? ''}
                          onChange={field.onChange}
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
            <h3 className="font-medium">Thông tin bán hàng</h3>
            {/* Sales Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-24 sm:justify-end  mt-2">
                      <span className="text-red-500">*</span>Giá bán
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <CurrencyInput
                          id={field.name}
                          name={field.name}
                          className=" w-full pl-2.5 py-1.5 border-[0.5px] rounded-md"
                          value={field.value ?? ''}
                          decimalsLimit={0}
                          groupSeparator="."
                          decimalSeparator=","
                          prefix="₫"
                          onValueChange={(value) =>
                            field.onChange({ target: { name: field.name, value } })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-24 sm:justify-end  mt-2">
                      <span className="text-red-500">*</span>Giá nhập
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <CurrencyInput
                          id={field.name}
                          name={field.name}
                          className=" w-full pl-2.5 py-1.5 border-[0.5px] rounded-md"
                          value={field.value ?? ''}
                          decimalsLimit={0}
                          groupSeparator="."
                          decimalSeparator=","
                          prefix="₫"
                          onValueChange={(value) =>
                            field.onChange({ target: { name: field.name, value } })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="inventory"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-24 sm:justify-end  mt-2">
                      <span className="text-red-500">*</span>Tồn kho
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="weight"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row ">
                    <FormLabel className="items-start w-24 sm:justify-end  mt-2">
                      <span className="text-red-500">*</span>Trọng lượng
                    </FormLabel>
                    <div className="flex flex-col flex-1 space-y-1">
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            inputMode="numeric"
                            className="pl-13"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />

                          <div className="h-full w-fit absolute top-0 left-2 flex items-center">
                            <span className="border-r-1 border-zinc-400 text-xs py-0.5 pr-2 text-zinc-400">
                              Gram
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <FormFooterActions
            isEditing={IS_EDITING}
            onDelete={onDelete ? () => setDeleteDialogOpen(true) : undefined}
          />
        </form>
      </Form>
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
        isEdit={IS_EDITING}
      />
    </div>
  );
}
