import { redirect } from 'next/navigation';

export default function Products() {
  redirect('/products/list/all?status=all');
}
