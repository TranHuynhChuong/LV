'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
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
import AddressSelect from '@/components/utils/address-select';
import { Address } from '@/models/address';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

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
        provinceId: defaultValue?.provinceId ?? undefined,
        wardId: defaultValue?.wardId ?? undefined,
        note: defaultValue?.note ?? '',
        default: defaultValue?.default ?? false,
      },
    });

    useEffect(() => {
      if (!defaultValue) return;
      form.reset({
        name: defaultValue.name ?? '',
        phone: defaultValue.phone ?? '',
        provinceId: defaultValue.provinceId ?? undefined,
        wardId: defaultValue.wardId ?? undefined,
        note: defaultValue.note ?? '',
        default: defaultValue.default ?? false,
      });

      if (defaultValue.provinceId) {
        onProvinceChange?.(defaultValue.provinceId);
      }
    }, [defaultValue, form, onProvinceChange]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        let data: AddressFormData | null = null;
        await form.handleSubmit((validData) => {
          data = validData;
        })();

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
                  <div className="flex justify-end flex-1 text-sm text-right text-muted-foreground whitespace-nowrap">
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
