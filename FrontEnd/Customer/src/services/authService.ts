import api from '@/lib/axiosClient';

export const login = async (email: string, pass: string) => {
  try {
    const response = await api.post('/auth/login-customer', { email, pass });
    const token = response.data?.token;
    console.log(window);
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
