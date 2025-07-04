'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import api from '@/lib/axios';

interface Props {
  year: number;
  month: number; // 0 là toàn năm
}

export default function ExportStatsExcelButton({ year, month }: Readonly<Props>) {
  const handleExport = async () => {
    const isYearMode = month === 0;
    const url = isYearMode
      ? `/orders/stats/export/year/${year}`
      : `/orders/stats/export/month/${year}/${month}`;

    const toastId = toast.loading('Đang xuất file...');

    try {
      const res = await api.get(url, { responseType: 'blob' });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      const fileName = isYearMode
        ? `thong-ke-ban-hang_${year}.xlsx`
        : `thong-ke-ban-hang_${year}-${month}.xlsx`;

      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('Xuất file thành công', { id: toastId });
    } catch (error) {
      console.error('Lỗi xuất file:', error);
      toast.error('Xuất file thất bại!', { id: toastId });
    }
  };

  return (
    <Button onClick={handleExport} className="gap-2 cursor-pointer">
      <Download className="w-4 h-4" />
      Xuất Excel
    </Button>
  );
}
