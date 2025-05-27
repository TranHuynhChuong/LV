'use client';

import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CategoryCombobox from '@/components/CategoriesCombobox';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

const MAX_PRODUCT_IMAGES = 14;
let IS_EDITING = false;

const productSchema = z.object({
  coverImageFile: z
    .union([
      z.instanceof(File),
      z.undefined(), // cần thiết cho optional
    ])
    .refine((file) => IS_EDITING || file instanceof File, {
      message: 'Không được để trống',
    }),
  productImageFiles: z.array(z.instanceof(File)).optional(),
  name: z.string({ required_error: 'Không được để trống' }).max(128),
  summary: z.string({ required_error: 'Không được để trống' }).max(2000),
  category: z.number({ required_error: 'Không được để trống' }),
  description: z.string().max(3000).optional(),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
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
  category: number;
  description?: string;
  attributes?: { key: string; value: string }[];
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

  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(defaultValue?.coverImage || null);
  const [productImages, setProductImages] = useState<string[]>(defaultValue?.productImages || []);

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [formDataToSubmit, setFormDataToSubmit] = useState<ProductFormValues | null>(null);
  const router = useRouter();

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
          <section className="p-6 bg-white rounded-sm shadow space-y-6">
            <div className=" flex space-x-8 items-start">
              {/* Cover Image */}
              <FormField
                control={control}
                name="coverImageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh bìa</FormLabel>
                    <FormControl>
                      <div className="relative w-42 h-42  rounded-md bg-gray-50 overflow-hidden group">
                        {!coverImageFile && !coverImage ? (
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-md border-2 border-dashed border-gray-400 hover:border-blue-500  transition-colors">
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
                            <span className="text-gray-400 text-3xl">+</span>
                          </label>
                        ) : (
                          <div className="relative w-full h-full group rounded-md border-2 border-gray-400 overflow-hidden">
                            <Image
                              src={getPreviewUrl(coverImageFile) || coverImage || ''}
                              alt="Ảnh bìa"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                              type="button"
                              className="absolute bottom-0 right-0 bg-zinc-600 text-white w-full py-2 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
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
                      <div className="flex flex-wrap gap-2">
                        {productImages.map((url, idx) => {
                          return url ? (
                            <div
                              key={idx}
                              className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-300 group"
                            >
                              <Image
                                src={url}
                                alt={`Ảnh sản phẩm ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-zinc-600 text-white w-full py-2 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
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
                              className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-300 group"
                            >
                              <Image
                                src={url}
                                alt={`Ảnh sản phẩm ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-zinc-600 text-white w-full py-2 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
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
                            className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-md cursor-pointer relative overflow-hidden flex items-center justify-center bg-gray-50 hover:border-blue-500 transition-colors"
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
                            <span className="text-gray-400 text-3xl">+</span>
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ''} maxLength={128} onChange={field.onChange} />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {field.value?.length || 0} / 128
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryCombobox
                      value={field.value}
                      leafOnly={true}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <FormField
              control={control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ''}
                      maxLength={2000}
                      onChange={field.onChange}
                      className="h-40 resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {field.value?.length || 0} / 2000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ''}
                      maxLength={3000}
                      onChange={field.onChange}
                      className="h-48 resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    {field.value?.length || 0} / 3000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <section className="p-6 bg-white rounded-sm shadow space-y-6">
            {/* Attributes */}
            <div className="space-y-4 justify-end flex flex-col">
              <FormLabel>Attributes</FormLabel>
              {fields.map((item, index) => (
                <div key={item.id} className="flex space-x-2 items-center w-full">
                  <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                    <Input
                      placeholder="Attribute"
                      {...register(`attributes.${index}.key` as const)}
                    />
                    <Input
                      placeholder="Value"
                      {...register(`attributes.${index}.value` as const)}
                    />
                  </div>

                  <Button type="button" className="cursor-pointer" onClick={() => remove(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="border-dashed border-2 cursor-pointer"
                onClick={() => append({ key: '', value: '' })}
              >
                + Thêm thông tin
              </Button>
            </div>
          </section>
          <section className="p-6 bg-white rounded-sm shadow space-y-6">
            {/* Sales Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
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
                    <FormLabel>Stock</FormLabel>
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
                    <FormLabel>Cost</FormLabel>
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
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <div className="sticky bottom-0 flex items-center w-full p-6 space-x-4 bg-white rounded-md shadow-sm h-fit">
            <Button
              type="submit"
              className={IS_EDITING ? 'flex-1 cursor-pointer' : 'flex-2 cursor-pointer'}
            >
              {IS_EDITING ? 'Cập nhật' : 'Thêm'}
            </Button>

            {IS_EDITING && (
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
      </Form>
      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa?</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10" />
          <DialogFooter className="flex justify-end gap-2">
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
            <DialogTitle>{IS_EDITING ? 'Xác nhận cập nhật?' : 'Xác nhận thêm?'}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10" />
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmSubmit} className="cursor-pointer">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
