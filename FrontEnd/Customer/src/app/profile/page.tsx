'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    gender: '',
    dob: null as Date | null,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth();

  // 🔄 Lấy dữ liệu người dùng từ API
  useEffect(() => {
    api.get(`/users/customer/${authData.userId}`).then((res) => {
      const data = res.data;
      setProfile({
        fullName: data.KH_hoTen ?? '',
        email: data.KH_email ?? '',
        gender: data.KH_gioiTinh ?? '',
        dob: data.KH_ngaySinh ? new Date(data.KH_ngaySinh) : null,
      });
    });
  }, []);

  // ✅ Gửi cập nhật
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      KH_hoTen: profile.fullName,
      KH_email: profile.email,
      KH_gioiTinh: profile.gender,
      KH_ngaySinh: profile.dob ? profile.dob.toISOString() : null,
    };

    api
      .put(`/users/customer/${authData.userId}`, payload)
      .then(() => {
        toast.success('Cập nhật thành công');
        router.refresh();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Có lỗi xảy ra khi cập nhật');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full min-w-md md:max-w-lg p-6 border shadow rounded-sm"
    >
      {/* Họ tên */}
      <div className="space-y-2">
        <Label>Họ tên</Label>
        <Input
          value={profile.fullName}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        />
      </div>

      {/* Email + nút thay đổi */}
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="flex gap-2 items-center">
          <Input value={profile.email} disabled className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/profile/changeEmail')}
            className="cursor-pointer"
          >
            Thay đổi
          </Button>
        </div>
      </div>
      <div className="flex space-x-4">
        {/* Giới tính */}
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

        {/* Ngày sinh */}
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
                <CalendarIcon className="mr-2 h-4 w-4" />
                {profile.dob ? format(profile.dob, 'dd/MM/yyyy') : 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="right">
              <Calendar
                mode="single"
                selected={profile.dob || undefined}
                onSelect={(date) => setProfile({ ...profile, dob: date ?? null })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end">
        {/* Nút cập nhật */}
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  );
}
