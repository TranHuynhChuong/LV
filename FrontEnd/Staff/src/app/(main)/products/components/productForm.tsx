'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

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
import { useState } from 'react';
import CategoryCombobox from '@/components/CategoriesCombobox';
import { Trash2 } from 'lucide-react';

import ConfirmDialog from '@/components/ConfirmDialog';
import FormFooterActions from '@/components/FormFooterActions';

const MAX_PRODUCT_IMAGES = 14;
let IS_EDITING = false;

const productSchema = z.object({
  coverImageFile: z
    .union([z.instanceof(File), z.undefined()])
    .refine((file) => IS_EDITING || file instanceof File, {
      message: 'Không được để trống',
    }),
  productImageFiles: z.array(z.instanceof(File)).optional(),
  name: z.string({ required_error: 'Không được để trống' }).max(128),
  summary: z.string({ required_error: 'Không được để trống' }).max(1000),
  category: z
    .array(z.number({ required_error: 'Không được để trống' }).min(1, 'Phần tử không hợp lệ'))
    .min(1, { message: 'Không được để trống' }),

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
  price: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  stock: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  cost: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
  weight: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ required_error: 'Không được để trống' })
  ) as z.ZodType<number | undefined>,
});

export type ProductFormValues = z.infer<typeof productSchema>;

export type Product = {
  name: string;
  summary: string;
  category: number[];
  description?: string;
  author: string;
  publisher: string;
  publishYear: number;
  page: number;
  isbn: string;
  language: string;
  translator: string;
  price: number;
  stock: number;
  cost: number;
  weight: number;
  coverImage: string;
  productImages: string[] | null;
};

interface ProductFormProps {
  defaultValue?: Product | null;
  onSubmit?: (newData: ProductFormValues, coverImage?: string, productImages?: string[]) => void;
  onDelete?: () => void;
}

export default function ProductForm({ defaultValue, onSubmit, onDelete }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...defaultValue,
    },
  });

  IS_EDITING = !!defaultValue;

  const { control } = form;
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(defaultValue?.coverImage || null);
  const [productImages, setProductImages] = useState<string[]>(defaultValue?.productImages || []);

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [formDataToSubmit, setFormDataToSubmit] = useState<ProductFormValues | null>(null);

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
      onSubmit?.(formDataToSubmit, coverImage ?? '', productImages ?? []);
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          <section className="p-6 space-y-6 bg-white rounded-sm shadow">
            <h3 className="font-medium">Thông tin cơ bản</h3>
            <div className="flex flex-col items-start space-x-0 space-y-8 sm:flex-row sm:space-x-8 sm:space-y-0">
              {/* Cover Image */}
              <FormField
                control={control}
                name="coverImageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh bìa</FormLabel>
                    <FormControl>
                      <div className="relative overflow-hidden rounded-md w-42 h-42 bg-gray-50 group">
                        {!coverImageFile && !coverImage ? (
                          <label className="absolute inset-0 flex items-center justify-center transition-colors border-2 border-gray-400 border-dashed rounded-md cursor-pointer hover:border-blue-500">
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
                            <span className="text-3xl text-gray-400">+</span>
                          </label>
                        ) : (
                          <div className="relative w-full h-full overflow-hidden border-2 border-gray-400 rounded-md group">
                            <Image
                              src={getPreviewUrl(coverImageFile) || coverImage || ''}
                              alt="Ảnh bìa"
                              fill
                              className="object-cover"
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
                  </FormItem>
                )}
              />

              {/* Product Images */}
              <FormField
                control={control}
                name="productImageFiles"
                render={() => (
                  <FormItem>
                    <FormLabel>Ảnh sản phẩm (tối đa {MAX_PRODUCT_IMAGES})</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap max-w-md space-x-2 space-y-2">
                        {productImages.map((url, idx) => {
                          return url ? (
                            <div
                              key={idx}
                              className="relative w-20 h-20 overflow-hidden border border-gray-300 rounded-md group"
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
                              className="relative w-20 h-20 overflow-hidden border border-gray-300 rounded-md group"
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
                            <span className="text-3xl text-gray-400">+</span>
                          </label>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sách</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} maxLength={128} onChange={field.onChange} />
                  </FormControl>
                  <div className="flex justify-between mt-1 text-sm text-right text-muted-foreground">
                    <FormMessage />
                    {field.value?.length || 0} / 128
                  </div>
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thể loại</FormLabel>
                  <FormControl>
                    <CategoryCombobox
                      value={field.value}
                      leafOnly={true}
                      onChange={(value) => {
                        const cleanedValue = (value || []).filter((v) => v !== undefined);
                        field.onChange(cleanedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
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
                <FormItem>
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ''}
                      maxLength={1000}
                      onChange={field.onChange}
                      className="h-40 resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between mt-1 text-sm text-right text-muted-foreground">
                    <FormMessage />
                    {field.value?.length || 0} / 1000
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ''}
                      maxLength={3000}
                      onChange={field.onChange}
                      className="h-48 resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between mt-1 text-sm text-right text-muted-foreground">
                    <FormMessage />
                    {field.value?.length || 0} / 3000
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tác giả</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà xuất bản</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="publishYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm xuất bản</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số trang</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngôn ngữ</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="translator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người dịch</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <section className="p-6 space-y-6 bg-white rounded-sm shadow">
            <h3 className="font-medium">Thông tin bán hàng</h3>
            {/* Sales Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá nhập</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trọng lượng (g)</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <FormFooterActions isEditing={IS_EDITING} onDelete={() => setDeleteDialogOpen(true)} />
        </form>
      </Form>
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
        isEdit={IS_EDITING}
      />
    </div>
  );
}
