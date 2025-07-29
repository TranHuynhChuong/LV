import dynamic from 'next/dynamic';
import ActionHistorySheetLoading from './activitylog-sheet-loading';

export const ActionHistorySheet = dynamic(() => import('@/components/utils/activitylog-sheet'), {
  loading: () => <ActionHistorySheetLoading />,
  ssr: false,
});
