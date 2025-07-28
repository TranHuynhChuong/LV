'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import api from '@/lib/axios-client';
import { DateRange } from 'react-day-picker';
import { endOfDay, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

type Props = {
  range: DateRange | undefined;
};

export default function ExportStatsExcelButton({ range }: Readonly<Props>) {
  const { authData } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleExport = async () => {
    if (!range?.from || !range?.to || !authData.userId) return;

    const toastId = toast.loading('Đang xuất file...');
    setLoading(true);
    try {
      const fromDate = startOfDay(range.from).toISOString();
      const toDate = endOfDay(range.to).toISOString();

      const res = await api.get(`/orders/stats/export`, {
        params: {
          from: fromDate,
          to: toDate,
          staffId: authData.userId,
        },
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      const fileName =
        fromDate && toDate
          ? `thong-ke-ban-hang_${fromDate}_den_${toDate}.xlsx`
          : `thong-ke-ban-hang.xlsx`;

      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('Xuất file thành công', { id: toastId });
    } catch {
      toast.error('Xuất file thất bại!', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !range?.from || !range?.to || !authData.userId;

  return (
    <Button onClick={handleExport} className="gap-2 cursor-pointer" disabled={disabled}>
      <Download className="w-4 h-4" />
      Xuất Excel
    </Button>
  );
}
