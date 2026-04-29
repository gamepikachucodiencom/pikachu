import type { ShopItem } from '@/stores/types';

export const SHOP_MOCK_ITEMS: ShopItem[] = [
  {
    id: 'mock_board_huyet_quan',
    name: 'Bàn Cờ Huyết Quản',
    description: 'Bàn cờ tông đỏ đen với hoa văn chiến tướng cổ.',
    price: 999,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/2b0f0f/ffca28?text=Ban+Co+Huyet+Quan',
    category: 'board',
    rarity: 'legendary',
  },
  {
    id: 'mock_board_bach_ngoc',
    name: 'Bàn Cờ Bạch Ngọc',
    description: 'Thiết kế thanh nhã, phù hợp cho kỳ thủ phong cách.',
    price: 599,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/e0f2f1/00695c?text=Ban+Co+Bach+Ngoc',
    category: 'board',
    rarity: 'epic',
  },
  {
    id: 'mock_piece_luu_ly',
    name: 'Bộ Quân Lưu Ly',
    description: 'Quân cờ ánh xanh lưu ly, nổi bật trên mọi bàn đấu.',
    price: 499,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/e8eaf6/3f51b5?text=Quan+Co+Luu+Ly',
    category: 'piece',
    rarity: 'epic',
  },
  {
    id: 'mock_piece_hoa_long',
    name: 'Quân Cờ Hỏa Long',
    description: 'Hiệu ứng sắc lửa mạnh mẽ cho những nước cờ quyết định.',
    price: 899,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/ffebd4/d84315?text=Quan+Co+Hoa+Long',
    category: 'piece',
    rarity: 'legendary',
  },
  {
    id: 'mock_avatar_chan_long',
    name: 'Khung Avatar Chân Long',
    description: 'Khung hồ sơ cao cấp dành cho cao thủ giang hồ.',
    price: 299,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/fff8e1/ff8f00?text=Khung+Chan+Long',
    category: 'other',
    rarity: 'legendary',
  },
  {
    id: 'mock_effect_loi_dien',
    name: 'Hiệu Ứng Lôi Điện (Chiếu)',
    description: 'Hiệu ứng chiếu tướng bằng tia sét đầy uy lực.',
    price: 199,
    currency: 'knb',
    imageUrl:
      'https://placehold.co/400x400/f3e5f5/8e24aa?text=Hieu+Ung+Loi+Dien',
    category: 'powerup',
    rarity: 'rare',
  },
];
