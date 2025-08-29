'use client';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { useEffect, useState } from 'react';
import { Category } from '@/models/category';
import CategoriesTable from './category-table';

function computeLevel(categories: Category[], categoryId: number) {
  let level = 1;
  let current = categories.find((c) => c.categoryId === categoryId);
  while (current && current.categoryId !== null) {
    const parent = categories.find((c) => c.categoryId === current?.parentId);
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
      const categoriesRaw: Category[] = res.data;
      if (!categoriesRaw) return;
      const categoriesMapped: Category[] = categoriesRaw.map((cat) => {
        const parentCategory = categoriesRaw.find((c) => c.categoryId === cat.parentId);
        const childrenCount = categoriesRaw.filter((c) => c.parentId === cat.categoryId).length;
        return {
          categoryId: cat.categoryId,
          name: cat.name,
          parentId: cat.parentId ?? null,
          parent: parentCategory ? parentCategory.name : '',
          childrenCount,
          level: computeLevel(categoriesRaw, cat.categoryId ?? 0),
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
