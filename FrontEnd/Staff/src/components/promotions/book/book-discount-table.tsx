'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Book } from '@/models/book';
import { Promotion, PromotionDetail } from '@/models/promotion';
import { Trash2 } from 'lucide-react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import CurrencyInput from 'react-currency-input-field';

type Props = {
  books?: Book[];
  detail?: PromotionDetail[];
  watch: UseFormWatch<Promotion>;
  register: UseFormRegister<Promotion>;
  setValue: UseFormSetValue<Promotion>;
  onRemove?: (id: number) => void;
  isViewing?: boolean;
};

export default function BookDiscountTable({
  books,
  detail,
  watch,
  register,
  setValue,
  onRemove,
  isViewing = false,
}: Readonly<Props>) {
  function calcFinalPrice(price: number, value: number, isPercent: boolean): number {
    if (isPercent) {
      return Math.max(0, price - (value / 100) * price);
    }
    return Math.max(0, price - value);
  }

  const mergedData = detail?.map((item) => {
    const book = books?.find((b) => b.bookId === item.bookId);
    return {
      detail: item,
      book,
    };
  });
  if (mergedData?.length === 0) return null;
  else {
    return (
      <div className="bg-white border rounded-sm overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-center">
              <TableHead>Sách</TableHead>
              <TableHead>Giá gốc</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Giảm</TableHead>
              <TableHead>Kiểu</TableHead>
              <TableHead>Giá sau giảm</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Xóa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mergedData?.map(({ detail: item, book }, index) => {
              if (!book) return null;
              const isPercent = watch(`detail.${index}.percentageBased`) ?? true;
              const rawValue = watch(`detail.${index}.value`);
              const value = isNaN(Number(rawValue)) ? 0 : Number(rawValue);
              const purchasePricePath = `detail.${index}.purchasePrice` as const;
              const valuePath = `detail.${index}.value` as const;
              const percentPath = `detail.${index}.percentageBased` as const;
              const idPath = `detail.${index}.bookId` as const;

              return (
                <TableRow key={item.bookId} className="align-middle">
                  <TableCell>
                    <input type="hidden" {...register(idPath)} value={item.bookId} />
                    <div className="flex gap-2 ">
                      <Avatar className="w-10 h-10 rounded-sm">
                        <AvatarImage
                          src={typeof book.images === 'string' ? book.images : book.images[0].url}
                          alt={book.title}
                        />
                        <AvatarFallback>#{book.bookId}</AvatarFallback>
                      </Avatar>
                      <div className="max-w-26 md:max-w-48">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs truncate cursor-default">{book.title}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p> {book.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="text-xs text-muted-foreground">#{book.bookId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CurrencyInput
                      className=" w-26 pl-2.5 py-1.5 border-[0.5px] rounded-md"
                      decimalsLimit={0}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="₫"
                      readOnly
                      value={book.importPrice}
                    />
                  </TableCell>
                  <TableCell>
                    <CurrencyInput
                      className=" w-26 pl-2.5 py-1.5 border-[0.5px] rounded-md"
                      decimalsLimit={0}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="₫"
                      readOnly
                      value={book.sellingPrice}
                    />
                  </TableCell>
                  <TableCell>
                    {isPercent ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        readOnly={isViewing}
                        value={rawValue ?? 0}
                        onChange={(e) => {
                          const parsed = Number(e.target.value);
                          setValue(valuePath, parsed);
                          setValue(
                            purchasePricePath,
                            calcFinalPrice(book.sellingPrice, parsed, true)
                          );
                        }}
                        className="w-26"
                      />
                    ) : (
                      <CurrencyInput
                        className="w-26 pl-2.5 py-1.5 border-[0.5px] rounded-md"
                        decimalsLimit={0}
                        groupSeparator="."
                        decimalSeparator=","
                        prefix="₫"
                        readOnly={isViewing}
                        value={rawValue ?? 0}
                        onValueChange={(value) => {
                          const parsed = Number(value ?? 0);
                          setValue(valuePath, parsed);
                          setValue(
                            purchasePricePath,
                            calcFinalPrice(book.sellingPrice, parsed, false)
                          );
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      disabled={isViewing}
                      onValueChange={(val) => {
                        setValue(percentPath, val === 'percent');
                        setValue(
                          purchasePricePath,
                          calcFinalPrice(book.sellingPrice, value, val === 'percent')
                        );
                      }}
                      value={isPercent ? 'percent' : 'amount'}
                    >
                      <SelectTrigger className="w-16 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-16 ">
                        <SelectItem value="percent" className="cursor-pointer">
                          %
                        </SelectItem>
                        <SelectItem value="amount" className="cursor-pointer">
                          ₫
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <CurrencyInput
                      className=" w-26 pl-2.5 py-1.5 border-[0.5px] rounded-md"
                      decimalsLimit={0}
                      groupSeparator="."
                      decimalSeparator=","
                      prefix="₫"
                      readOnly
                      value={calcFinalPrice(book.sellingPrice, value, isPercent)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={book.inventory}
                      readOnly
                      className="w-18 disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => onRemove?.(book.bookId)}
                      size="icon"
                      className="cursor-pointer"
                      disabled={isViewing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}
