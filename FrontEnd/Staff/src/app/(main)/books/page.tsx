import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/books/list?type=live&status=all');
}
