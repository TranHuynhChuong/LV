'use client';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { useEffect, useState } from 'react';
import { Category, CategoryDto } from '@/models/categories';
import CategoriesTable from './category-table';

function computeLevel(categories: CategoryDto[], categoryId: number) {
  let level = 1;
  let current = categories.find((c) => c.TL_id === categoryId);
  while (current && current.TL_idTL !== null) {
    const parent = categories.find((c) => c.TL_id === current?.TL_idTL);
    if (parent) {
      level++;
      current = parent;
    } else break;
  }
  return level;
}

export default function CategoryPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<Category[]>([]);
  const [levelOptions, setLevelOptions] = useState<number[]>([]);

  const getData = async () => {
    try {
      const res = await api.get('/categories');
      const categoriesRaw: CategoryDto[] = res.data;
      if (!categoriesRaw) return;
      const categoriesMapped: Category[] = categoriesRaw.map((cat) => {
        const parentCategory = categoriesRaw.find((c) => c.TL_id === cat.TL_idTL);
        const childrenCount = categoriesRaw.filter((c) => c.TL_idTL === cat.TL_id).length;
        return {
          id: cat.TL_id,
          name: cat.TL_ten,
          parentId: cat.TL_idTL ?? null,
          parent: parentCategory ? parentCategory.TL_ten : '',
          childrenCount,
          level: computeLevel(categoriesRaw, cat.TL_id ?? 0),
        };
      });
      const uniqueLevels = Array.from(
        new Set(
          categoriesMapped
            .map((c) => c.level)
            .filter((level): level is number => level !== undefined)
        )
      ).sort((a, b) => a - b);
      setLevelOptions(uniqueLevels);
      setData(categoriesMapped);
    } catch {
      setData([]);
    }
  };

  useEffect(() => {
    getData();
    const handler = () => getData();
    EventBus.on('category:refetch', handler);
    return () => {
      EventBus.off('category:refetch', handler);
    };
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Thể loại' }]);
  }, [setBreadcrumbs]);

  return <CategoriesTable data={data} levelOptions={levelOptions} />;
}
