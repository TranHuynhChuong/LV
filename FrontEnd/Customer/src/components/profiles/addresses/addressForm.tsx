'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import AddressSelect from '@/components/utils/FullAddressSelect';
import { Textarea } from '@/components/ui/textarea';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Address } from '@/models/addresses';

// Schema và types
const formSchema = z.object({
  name: z.string().min(1, 'Họ tên không được để trống'),
  phone: z.string().min(1, 'Số điện thoại không được để trống'),
  provinceId: z.number({ required_error: 'Vui lòng chọn địa chỉ' }),
  wardId: z.number({ required_error: 'Vui lòng chọn địa chỉ' }),
  note: z.string().optional(),
  default: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof formSchema>;
export type AddressFormHandle = {
  submit: () => Promise<AddressFormData | null>;
};

type Props = {
  defaultValue?: Address;
  isComponent?: boolean;
  onProvinceChange?: (provinceId: number) => void;
};

const AddressForm = forwardRef<AddressFormHandle, Props>(
  ({ defaultValue, isComponent = false, onProvinceChange }, ref) => {
    const form = useForm<AddressFormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: defaultValue?.name ?? '',
        phone: defaultValue?.phone ?? '',
        provinceId: defaultValue?.province.id ?? undefined,
        wardId: defaultValue?.ward.id ?? undefined,
        note: defaultValue?.note ?? '',
        default: defaultValue?.default ?? false,
      },
    });

    useEffect(() => {
      if (!defaultValue) return;

      form.reset({
        name: defaultValue.name ?? '',
        phone: defaultValue.phone ?? '',
        provinceId: defaultValue.province.id ?? undefined,
        wardId: defaultValue.ward.id ?? undefined,
        note: defaultValue.note ?? '',
        default: defaultValue.default ?? false,
      });

      if (defaultValue.province?.id) {
        onProvinceChange?.(defaultValue.province.id);
      }
    }, [defaultValue, form]);

    // Cho cha gọi submit và nhận data valid
    useImperativeHandle(ref, () => ({
      submit: async () => {
        let data: AddressFormData | null = null;
        await form.handleSubmit((validData) => {
          data = validData;
        })(); // cần gọi hàm trả về từ handleSubmit

        return data;
      },
    }));

    return (
      <Form {...form}>
        <form className="space-y-4 bg-white">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập họ tên" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập số điện thoại" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Địa chỉ chọn từ dropdown */}
          <FormField
            control={form.control}
            name="wardId"
            render={({ fieldState }) => (
              <FormItem>
                <FormControl>
                  <AddressSelect
                    error={!!fieldState.error}
                    valueProvinceId={form.getValues('provinceId')}
                    valueWardId={form.getValues('wardId')}
                    onSelectProvince={(provinceId) => {
                      form.setValue('provinceId', provinceId, { shouldValidate: true });
                      onProvinceChange?.(provinceId);
                    }}
                    onSelectWard={(wardId) => {
                      form.setValue('wardId', wardId, { shouldValidate: true });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    value={field.value ?? ''}
                    maxLength={250}
                    onChange={field.onChange}
                    className="h-24 resize-none"
                  />
                </FormControl>
                <div className="flex justify-between mx-1">
                  <FormMessage />
                  <div className="text-sm text-right text-muted-foreground whitespace-nowrap flex flex-1 justify-end">
                    {field.value?.length ?? 0} / 250
                  </div>
                </div>
              </FormItem>
            )}
          />

          {!isComponent && (
            <FormField
              control={form.control}
              name="default"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Đặt làm địa chỉ mặc định</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    );
  }
);

AddressForm.displayName = 'AddressForm';
export default AddressForm;
