import api from '@/lib/axiosClient';

export const login = async (code: string, pass: string) => {
  try {
    const response = await api.post('/auth/login-staff', { code, pass });
    const token = response.data?.token;

    if (token) {
      localStorage.setItem('token', token);
    }
    return;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Đăng nhập thất bại');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};
