'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStore, useAuthStore } from '@/stores';
import { useCanAfford } from '@/stores/hooks';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { getPageMetadata } from '@/lib/seo/metadata';
import AppLayout from '@/components/layout/AppLayout';
import type { ShopItem } from '@/stores/types';
import { SHOP_MOCK_ITEMS } from './shopMockData';
import styles from './ShopPage.module.css';

const rarityColors: Record<string, string> = {
  common: 'gray',
  rare: 'blue',
  epic: 'purple',
  legendary: 'yellow',
};

const rarityGradients: Record<string, string> = {
  common: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  rare: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  epic: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  legendary: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
};

export default function ShopPage() {
  const router = useRouter();
  const { items, setItems, addPurchasedItem, setLoading, isLoading } =
    useShopStore();
  const { profile, updateKnb, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();
  const canAfford = useCanAfford();
  const meta = getPageMetadata('/ban-co-tuong');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const getCurrentPathWithQuery = () => {
    if (typeof window === 'undefined') return '/cua-hang';
    return `${window.location.pathname}${window.location.search}`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để mua sắm', 'info');
      return;
    }

    loadShopItems();
  }, [isAuthenticated, showToast]);

  const loadShopItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const normalizedItems = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? '',
          price: item.price,
          currency: 'knb' as const,
          imageUrl: item.image_url ?? item.imageUrl,
          category: item.category,
          rarity: item.rarity,
        }));
        setItems(normalizedItems);
      } else {
        setItems(SHOP_MOCK_ITEMS);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể tải danh sách sản phẩm';
      showToast(errorMessage, 'error');
      setItems(SHOP_MOCK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!isAuthenticated || !profile) {
      showToast('Vui lòng đăng nhập để mua sắm', 'info');
      return;
    }

    if (item.id.startsWith('mock_')) {
      showToast('Đây là dữ liệu demo, chưa thể mua vật phẩm này.', 'info');
      return;
    }

    const knbItem: ShopItem = { ...item, currency: 'knb' };
    if (!canAfford(knbItem)) {
      showToast('Bạn không đủ KNB', 'error');
      return;
    }

    try {
      const newKnb = (profile.knb ?? 0) - item.price;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          knb: newKnb,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      const { error: transError } = await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'purchase',
        amount: -item.price,
        currency: 'knb',
        description: `Mua ${item.name}`,
      });

      if (transError) throw transError;

      updateKnb(newKnb);
      addPurchasedItem(item.id);
      showToast(`Bạn đã mua ${item.name}`, 'success');

      setModalOpened(false);
      setSelectedItem(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể hoàn tất giao dịch';
      showToast(errorMessage, 'error');
    }
  };

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
    setModalOpened(true);
  };

  const filteredItems = items.filter((item) => {
    const categoryMatch =
      categoryFilter === 'all' || item.category === categoryFilter;
    const rarityMatch = rarityFilter === 'all' || item.rarity === rarityFilter;
    return categoryMatch && rarityMatch;
  });

  const categories = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'board', label: 'Bàn Cờ' },
    { value: 'piece', label: 'Quân Cờ' },
    { value: 'theme', label: 'Giao Diện' },
    { value: 'powerup', label: 'Hiệu Ứng' },
    { value: 'other', label: 'Khác' },
  ];

  const rarities = [
    { value: 'all', label: 'Tất cả phẩm chất' },
    { value: 'legendary', label: 'Thần Khí' },
    { value: 'epic', label: 'Sử Thi' },
    { value: 'rare', label: 'Hiếm' },
    { value: 'common', label: 'Thường' },
  ];

  const getRarityLabel = (rarity?: ShopItem['rarity']) => {
    if (rarity === 'legendary') return 'Thần Khí';
    if (rarity === 'epic') return 'Sử Thi';
    if (rarity === 'rare') return 'Hiếm';
    return 'Thường';
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className={styles.container}>
          <div className={styles.authRequired}>
            <div className={styles.authContent}>
              <h1 className={styles.authTitle}>{meta.h1}</h1>
              <p className={styles.authDescription}>
                Vui lòng đăng nhập để xem và mua sắm các vật phẩm cờ tướng
              </p>
              <button
                className={styles.authButton}
                onClick={() =>
                  router.push(`/dang-nhap?next=${encodeURIComponent(getCurrentPathWithQuery())}`)
                }
              >
                Đăng Nhập / Đăng Ký
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className={styles.shopWrapper}>
        <div className={styles.shopHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.shopTitle}>{meta.h1}</h1>
            <p className={styles.shopSubtitle}>{meta.description}</p>
          </div>

          {profile && (
            <div className={styles.balanceCard}>
              <span className={styles.balanceLabel}>Kim Nguyên Bảo:</span>
              <span className={styles.coinAmount}>
                {(profile.knb ?? 0).toLocaleString('vi-VN')}
                <Image src="/assets/web/knb.png" alt="KNB" width={24} height={24} />
              </span>
              <button className={styles.rechargeBtn}>Nạp Thêm</button>
            </div>
          )}
        </div>

        <div className={styles.filterControls}>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.tabBtn} ${categoryFilter === category.value ? styles.tabActive : ''}`}
                onClick={() => setCategoryFilter(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <select
            className={styles.raritySelect}
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
          >
            {rarities.map((rarity) => (
              <option key={rarity.value} value={rarity.value}>
                {rarity.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div>Đang cập nhật cửa hàng...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {filteredItems.map((item) => {
              const affordable = canAfford({ ...item, currency: 'knb' });

              return (
                <div
                  key={item.id}
                  className={`${styles.itemCard} ${item.rarity ? styles[item.rarity] : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  {item.rarity && (
                    <div className={styles.rarityBadge}>
                      {getRarityLabel(item.rarity)}
                    </div>
                  )}

                  <div className={styles.imageContainer}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={styles.itemImage}
                      />
                    ) : (
                      <div
                        className={styles.placeholderImage}
                        style={{
                          background: item.rarity
                            ? rarityGradients[item.rarity]
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        <span className={styles.placeholderText}>
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemDescription}>
                      {item.description || 'Vật phẩm hiếm dành cho kỳ thủ.'}
                    </p>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        {item.price.toLocaleString('vi-VN')} KNB
                        <Image
                          src="/assets/web/knb.png"
                          alt="KNB"
                          width={20}
                          height={20}
                        />
                      </span>
                      <button
                        className={styles.buyBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        {affordable ? 'Mua Ngay' : 'Không Đủ'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalOpened && selectedItem && (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setModalOpened(false);
              setSelectedItem(null);
            }}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{selectedItem.name}</h2>
                <button
                  className={styles.modalCloseButton}
                  onClick={() => {
                    setModalOpened(false);
                    setSelectedItem(null);
                  }}
                >
                  ✕
                </button>
              </div>
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className={styles.modalImage}
                />
              )}
              <div className={styles.modalBody}>
                <p className={styles.modalDescription}>
                  {selectedItem.description}
                </p>
                <div className={styles.modalBadges}>
                  <span
                    className={styles.modalBadge}
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.2)',
                      color: '#fbbf24',
                    }}
                  >
                    {selectedItem.price.toLocaleString('vi-VN')} KNB
                  </span>
                  {selectedItem.rarity && (
                    <span
                      className={styles.modalBadge}
                      style={{
                        backgroundColor:
                          rarityColors[selectedItem.rarity] === 'gray'
                            ? '#6b7280'
                            : rarityColors[selectedItem.rarity] === 'blue'
                              ? '#3b82f6'
                              : rarityColors[selectedItem.rarity] === 'purple'
                                ? '#a855f7'
                                : rarityColors[selectedItem.rarity] === 'yellow'
                                  ? '#fbbf24'
                                  : '#4b5563',
                        color: 'white',
                      }}
                    >
                      {getRarityLabel(selectedItem.rarity)}
                    </span>
                  )}
                  <span className={styles.modalBadgeOutline}>
                    {
                      categories.find((c) => c.value === selectedItem.category)
                        ?.label
                    }
                  </span>
                </div>
              </div>
              <button
                className={`${styles.purchaseButton} ${!canAfford({ ...selectedItem, currency: 'knb' }) ? styles.purchaseButtonDisabled : ''}`}
                onClick={() => handlePurchase(selectedItem)}
                disabled={!canAfford({ ...selectedItem, currency: 'knb' })}
              >
                {canAfford({ ...selectedItem, currency: 'knb' })
                  ? `Mua Ngay - ${selectedItem.price.toLocaleString('vi-VN')} KNB`
                  : 'Không Đủ KNB'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
