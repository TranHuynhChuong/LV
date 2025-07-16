import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

export default function DateRangePicker({
  date,
  onChange,
}: {
  date: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd/MM/yyyy')} – {format(date.to, 'dd/MM/yyyy')}
              </>
            ) : (
              format(date.from, 'dd/MM/yyyy')
            )
          ) : (
            <span>Chọn khoảng thời gian</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="range" selected={date} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
