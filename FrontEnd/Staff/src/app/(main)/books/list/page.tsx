import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/books/list/all?status=all');
}
