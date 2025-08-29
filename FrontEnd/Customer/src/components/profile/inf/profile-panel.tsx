'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePanel() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    gender: '',
    dob: null as Date | null,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId) return;
    api
      .get(`/users/customer/inf/${authData.userId}`)
      .then((res) => {
        const data = res.data;
        setProfile({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          gender: data.gender ?? '',
          dob: data.dob ? new Date(data.dob) : null,
        });
      })
      .catch(() => router.back());
  }, [authData.userId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      fullName: profile.fullName,
      email: profile.email,
      gender: profile.gender,
      dob: profile.dob ? profile.dob.toISOString() : null,
    };

    if (!authData.userId) return;

    api
      .put(`/users/customer/${authData.userId}`, payload)
      .then(() => {
        toast.success('Cập nhật thành công');
        router.refresh();
      })
      .catch(() => {
        toast.error('Có lỗi xảy ra khi cập nhật');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 space-y-6 bg-white border rounded-md">
      <div className="space-y-2">
        <Label>Họ tên</Label>
        <Input
          value={profile.fullName}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="flex items-center gap-2">
          <Input value={profile.email} readOnly className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile/change-email')}
            className="cursor-pointer"
          >
            Thay đổi
          </Button>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="space-y-2">
          <Label>Giới tính</Label>
          <Select
            value={profile.gender}
            onValueChange={(value) => setProfile({ ...profile, gender: value })}
          >
            <SelectTrigger className="min-w-24">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Nữ">Nữ</SelectItem>
              <SelectItem value="Khác">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ngày sinh</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !profile.dob && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {profile.dob ? format(profile.dob, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="right">
              <Calendar
                mode="single"
                selected={profile.dob || undefined}
                onSelect={(date: Date | undefined) => setProfile({ ...profile, dob: date ?? null })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  );
}
