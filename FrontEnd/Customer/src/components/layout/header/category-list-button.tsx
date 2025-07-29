'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import api from '@/lib/axios-client';
import { ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type CategoryDto = {
  TL_id: number;
  TL_ten: string;
  TL_idTL?: number;
};

type Categories = {
  name: string;
  id: number;
  parent: string;
};

type CategoryNode = {
  id: number;
  name: string;
  children: CategoryNode[];
};

function buildCategoryTree(flatList: Categories[]): CategoryNode[] {
  const idMap = new Map<number, CategoryNode>();
  const nameToId = new Map<string, number>();
  const tree: CategoryNode[] = [];
  flatList.forEach((cat) => {
    idMap.set(cat.id, { id: cat.id, name: cat.name, children: [] });
    nameToId.set(cat.name, cat.id);
  });
  flatList.forEach((cat) => {
    const node = idMap.get(cat.id)!;
    if (!cat.parent) {
      tree.push(node);
    } else {
      const parentId = nameToId.get(cat.parent);
      const parentNode = parentId ? idMap.get(parentId) : null;
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });
  return tree;
}

export function CategoryLink({
  id,
  children,
}: Readonly<{ id: number; children: React.ReactNode }>) {
  const params = new URLSearchParams();
  params.set('c', id.toString());
  params.set('p', '1');
  params.set('s', '1');
  return <Link href={`/search?${params.toString()}`}>{children}</Link>;
}

export function CategoryTreeNodes({ nodes }: Readonly<{ nodes: CategoryNode[] }>) {
  const [open, setOpen] = useState<{ [id: number]: boolean }>({});
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      nodes.forEach((node) => {
        if (!(node.id in next)) {
          next[node.id] = false;
        }
      });
      return next;
    });
  }, [nodes]);

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id} className="pt-2 pl-4 my-2 text-sm border-t-1">
          <div className={`flex items-center justify-between `}>
            <CategoryLink id={node.id}>{node.name}</CategoryLink>
            {node.children.length > 0 && (
              <button
                type="button"
                className="ml-4"
                onClick={() =>
                  setOpen((prev) => ({
                    ...prev,
                    [node.id]: !prev[node.id],
                  }))
                }
              >
                <ChevronRight
                  className={`transition-transform duration-200 ${
                    open[node.id] ? 'rotate-90' : ''
                  }`}
                  size={18}
                />
              </button>
            )}
          </div>
          {open[node.id] && node.children.length > 0 && <CategoryTreeNodes nodes={node.children} />}
        </div>
      ))}
    </div>
  );
}

export function CategoryTreeMenuOnDesktop({ nodes }: Readonly<{ nodes: CategoryNode[] }>) {
  return (
    <>
      <div className="hidden h-full md:pb-4 md:block ">
        <div className="flex items-center h-full px-1 bg-white">
          <Menu />
        </div>
      </div>
      <div className="absolute left-0 z-50 hidden w-full px-4 pb-6 transition-all duration-200 bg-white shadow rounded-b-md h-fit lg:px-0 top-full md:group-hover:block">
        <ScrollArea className="h-90">
          <div className="flex flex-wrap p-6 space-y-5 h-fit">
            {nodes.map((node) => (
              <div key={node.id} className="px-5 min-w-42 max-w-fit flex-1/3 lg:flex-1/4 xl:flex-1">
                <CategoryLink id={node.id}>
                  <span className="mb-1 text-sm font-bold uppercase text-zinc-700">
                    {node.name}
                  </span>
                </CategoryLink>

                <div className="px-2">
                  <CategoryTreeNodes nodes={node.children} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

export function CategoryTreeMenuOnMobile({ nodes }: Readonly<{ nodes: CategoryNode[] }>) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <div className="h-full md:pb-4">
          <div className="flex items-center h-full px-1 bg-white">
            <Menu />
          </div>
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <ScrollArea className="h-screen">
          <SheetHeader>
            <SheetTitle>Danh mục thể loại</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div>
            {nodes.map((node) => (
              <div key={node.id} className="px-6 mb-6">
                <CategoryLink id={node.id}>
                  <span className="mb-1 text-sm font-bold uppercase text-zinc-700">
                    {node.name}
                  </span>
                </CategoryLink>

                <div>
                  <CategoryTreeNodes nodes={node.children} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default function CategoryList() {
  const [data, setData] = useState<Categories[]>([]);
  const [treeData, setTreeData] = useState<CategoryNode[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const data = res.data as CategoryDto[];

        const categoriesMapped = data.map((cat) => ({
          id: cat.TL_id,
          name: cat.TL_ten,
          parent: data.find((c) => c.TL_id === cat.TL_idTL)?.TL_ten || '',
        }));

        setData(categoriesMapped);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setData([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const tree = buildCategoryTree(data);
      setTreeData(tree);
    }
  }, [data]);

  return (
    <div className="h-full group">
      <CategoryTreeMenuOnMobile nodes={treeData} />
      <CategoryTreeMenuOnDesktop nodes={treeData} />
    </div>
  );
}
