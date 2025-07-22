import { Order, OrderDto, OrderOverviewDto } from '.';
import { mapActivityLogsFromDto } from '../activityLogs';

export async function mapOrderFromDto(dto: OrderDto): Promise<Order> {
  return {
    orderId: dto.DH_id ?? '',
    createdAt: dto.DH_ngayTao ?? '',
    status: dto.DH_trangThai ?? '',
    discountInvoice: dto.DH_giamHD ?? 0,
    discountShipping: dto.DH_giamVC ?? 0,
    shippingFee: dto.DH_phiVC ?? 0,
    invoice: {
      taxCode: dto.DH_HD?.HD_mst ?? '',
      fullName: dto.DH_HD?.HD_hoTen ?? '',
      address: dto.DH_HD?.HD_diaChi ?? '',
      email: dto.DH_HD?.HD_email ?? '',
    },
    customerId: dto.KH_id ?? 0,
    customerEmail: dto.KH_email ?? null,
    activityLogs: mapActivityLogsFromDto(dto.lichSuThaoTac),
    shippingInfo: {
      recipientName: dto.thongTinNhanHang?.NH_hoTen ?? '',
      phoneNumber: dto.thongTinNhanHang?.NH_soDienThoai ?? '',
      addressInfo: {
        provinceId: dto.thongTinNhanHang.T_id,
        wardId: dto.thongTinNhanHang.X_id,
        fullText: dto.thongTinNhanHang.NH_diaChi,
      },
      note: dto.thongTinNhanHang?.NH_ghiChu ?? '',
    },
    reviewed: dto.DH_daDanhGia ?? false,
    orderDetails: (dto.chiTietDonHang ?? []).map(
      (item: {
        SP_id: number;
        CTDH_soLuong: number;
        CTDH_giaMua: number;
        CTDH_giaBan: number;
        CTDH_giaNhap: number;
        SP_ten: string;
        SP_anh: string;
        SP_trangThai: number;
      }) => ({
        productId: item.SP_id ?? 0,
        quantity: item.CTDH_soLuong ?? 0,
        priceBuy: item.CTDH_giaMua ?? 0,
        priceSell: item.CTDH_giaBan ?? 0,
        priceImport: item.CTDH_giaNhap ?? 0,
        productName: item.SP_ten ?? '',
        productImage: item.SP_anh ?? '',
        productStatus: item.SP_trangThai ?? 0,
      })
    ),
  };
}

export function mapOrderOverviewListFromDto(dtos: OrderOverviewDto[]) {
  return dtos.map((dto) => ({
    orderId: dto.DH_id ?? '',
    createdAt: dto.DH_ngayTao ?? '',
    status: dto.DH_trangThai ?? 0,
    discountInvoice: dto.DH_giamHD ?? 0,
    discountShipping: dto.DH_giamVC ?? 0,
    shippingFee: dto.DH_phiVC ?? 0,

    customerId: dto.KH_id ?? null,
    customerEmail: dto.KH_email ?? null,
    reviewed: dto.DH_daDanhGia ?? false,
    orderDetails: (dto.chiTietDonHang ?? []).map((item) => ({
      productId: item.SP_id ?? 0,
      quantity: item.CTDH_soLuong ?? 0,
      priceBuy: item.CTDH_giaMua ?? 0,
      priceSell: item.CTDH_giaBan ?? 0,
      priceImport: item.CTDH_giaNhap ?? 0,
      productName: item.SP_ten ?? '',
      productImage: item.SP_anh ?? '',
      productStatus: item.SP_trangThai ?? 0,
    })),
  }));
}
