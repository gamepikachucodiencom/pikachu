'use client';

import { useRouter } from 'next/navigation';
import { useShopStore } from '@/stores';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { getVietnameseError } from '@/lib/utils/error-mapping';
import type { ShopItem } from '@/stores/types';
import styles from './ShopPreviewSection.module.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShopPreviewSection() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setItems, setLoading, isLoading } = useShopStore();
  const [previewItems, setPreviewItems] = useState<ShopItem[]>([]);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    loadLatestItems();
  }, []);

  const loadLatestItems = async () => {
    setLoading(true);
    setHasLoadError(false);
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data) {
        const items: ShopItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          currency: 'knb',
          imageUrl: item.image_url,
          category: item.category,
          rarity: item.rarity,
        }));
        setItems(items);
        setPreviewItems(items.slice(0, 6));
      }
    } catch (error) {
      console.error(
        'Error loading shop items:',
        error instanceof Error
          ? error.message
          : ((error as { message?: string })?.message ??
              (error as { code?: string })?.code ??
              String(error))
      );
      showToast(getVietnameseError(error), 'error');
      setHasLoadError(true);
      setPreviewItems([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const rarityLabels: Record<NonNullable<ShopItem['rarity']>, string> = {
    common: 'PHỔ THÔNG',
    rare: 'HIẾM',
    epic: 'SỬ THI',
    legendary: 'HUYỀN THOẠI',
  };

  const getTagClassName = (rarity?: ShopItem['rarity']) => {
    if (rarity === 'legendary' || rarity === 'epic') {
      return styles.badgeHot;
    }
    return styles.badgeSoon;
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className={styles.statusBox}>
          <p className={styles.statusTitle}>Đang cập nhật cửa hàng...</p>
          <p className={styles.statusDescription}>
            Vật phẩm mới sẽ xuất hiện trong giây lát.
          </p>
        </div>
      );
    }

    if (hasLoadError) {
      return (
        <div className={styles.statusBox}>
          <p className={styles.statusTitle}>Không thể tải dữ liệu cửa hàng</p>
          <p className={styles.statusDescription}>
            Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối mạng.
          </p>
        </div>
      );
    }

    if (previewItems.length === 0) {
      return (
        <div className={styles.statusBox}>
          <p className={styles.statusTitle}>Cửa hàng hiện chưa có vật phẩm</p>
          <p className={styles.statusDescription}>
            Hãy quay lại sau để khám phá các bảo vật mới.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {previewItems.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageBox}>
              <div className={`${styles.badge} ${getTagClassName(item.rarity)}`}>
                {item.rarity ? rarityLabels[item.rarity] : 'ĐẶC BIỆT'}
              </div>
              <img
                src={item.imageUrl || '/assets/web/shop-board-1.png'}
                alt={item.name}
                className={styles.itemImage}
              />
            </div>

            <div className={styles.infoBox}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.itemDesc}>
                {item.description || 'Vật phẩm đặc biệt dành cho kỳ thủ.'}
              </p>

              <div className={styles.priceRow}>
                <div className={styles.price}>
                  <span className={styles.coinIcon}>💰</span>
                  {item.price.toLocaleString('vi-VN')} KNB
                </div>
                <button className={styles.previewBtn}>Xem Thử</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* HEADER CỦA SHOP */}
        <div className={styles.header}>
          <div className={styles.titleBadge}>KỲ TRÂN CÁC</div>
          <h2 className={styles.title}>Bảo Vật Giang Hồ</h2>
          <p className={styles.subTitle}>
            Sưu tầm kỳ bàn, kỳ tử và khẳng định đẳng cấp
          </p>
        </div>

        {renderBody()}

        {/* NÚT VÀO CỬA HÀNG FULL */}
        <div className={styles.footer}>
          <Link href="/ban-co-tuong" className={styles.viewAllBtn}>
            Khám Phá Toàn Bộ Kỳ Trân Các
          </Link>
        </div>
      </div>
    </section>
  );
}
