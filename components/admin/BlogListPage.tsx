'use client';

import { useState, useEffect } from 'react';
import { IconEdit } from '@/components/icons';
import {
  getAllArticles,
  deleteArticle,
  type BlogArticle,
} from '@/lib/blog/blogService';
import {
  ARTICLE_TYPES,
  ARTICLE_STATUS,
  ARTICLE_TYPE_LABELS,
  ARTICLE_STATUS_LABELS,
  type ArticleType,
  type ArticleStatus,
} from '@/lib/constants/enums';
import { useRouter } from 'next/navigation';
import styles from './BlogListPage.module.css';

const typeToClass: Record<ArticleType, string> = {
  [ARTICLE_TYPES.GUIDE]: styles.badgeBlue,
  [ARTICLE_TYPES.OPENINGS]: styles.badgeGreen,
  [ARTICLE_TYPES.PUZZLES]: styles.badgeOrange,
  [ARTICLE_TYPES.ENDGAME]: styles.badgePurple,
};

const statusToClass: Record<ArticleStatus, string> = {
  [ARTICLE_STATUS.DRAFT]: styles.badgeGray,
  [ARTICLE_STATUS.PUBLISHED]: styles.badgeGreen,
  [ARTICLE_STATUS.ARCHIVED]: styles.badgeRed,
};

const statusToLabel: Record<ArticleStatus, string> = {
  [ARTICLE_STATUS.DRAFT]: 'Bản nháp',
  [ARTICLE_STATUS.PUBLISHED]: 'Đã xuất bản',
  [ARTICLE_STATUS.ARCHIVED]: 'Đã lưu trữ',
};

export default function BlogListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<BlogArticle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterType, setFilterType] = useState<ArticleType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchArticles();
  }, [filterType, filterStatus, searchQuery, currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError, count } = await getAllArticles({
      type: filterType || undefined,
      status: filterStatus || undefined,
      search: searchQuery || undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    });
    if (fetchError) {
      setError('Không thể tải danh sách bài viết.');
      console.error('Error fetching articles:', fetchError);
    } else {
      setArticles(data);
      setTotalCount(count);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    const { error: deleteError } = await deleteArticle(articleToDelete.id);
    if (deleteError) {
      setError('Không thể xóa bài viết.');
      console.error('Error deleting article:', deleteError);
    } else {
      setDeleteModalOpen(false);
      setArticleToDelete(null);
      fetchArticles();
    }
    setDeleting(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Quản lý Blog</h1>
            <button
              type="button"
              className={styles.btn}
              onClick={() => router.push('/admin/blog/new')}
            >
              Tạo bài viết mới
            </button>
          </div>

          <div className={styles.filters}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className={styles.select}
              value={filterType}
              onChange={(e) => {
                setFilterType((e.target.value as ArticleType) || '');
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả loại</option>
              <option value="Guide">Hướng dẫn</option>
              <option value="Openings">Khai cuộc</option>
              <option value="Puzzles">Giải trận</option>
              <option value="Endgame">Tàn cuộc</option>
            </select>
            <select
              className={styles.select}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus((e.target.value as ArticleStatus) || '');
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value={ARTICLE_STATUS.DRAFT}>{ARTICLE_STATUS_LABELS[ARTICLE_STATUS.DRAFT]}</option>
              <option value={ARTICLE_STATUS.PUBLISHED}>{ARTICLE_STATUS_LABELS[ARTICLE_STATUS.PUBLISHED]}</option>
              <option value={ARTICLE_STATUS.ARCHIVED}>{ARTICLE_STATUS_LABELS[ARTICLE_STATUS.ARCHIVED]}</option>
            </select>
          </div>

          {error && (
            <div className={styles.alert}>
              <span>{error}</span>
              <button
                type="button"
                className={styles.alertClose}
                onClick={() => setError(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
            </div>
          ) : articles.length === 0 ? (
            <div className={styles.emptyWrap}>
              <p className={styles.emptyText}>Không có bài viết nào.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                      <th>Lượt xem</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className={styles.titleCell}>{a.title}</div>
                          <div className={styles.slugCell}>{a.slug}</div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${typeToClass[a.article_type]}`}>
                            {ARTICLE_TYPE_LABELS[a.article_type] || a.article_type}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${statusToClass[a.status]}`}>
                            {statusToLabel[a.status]}
                          </span>
                        </td>
                        <td>{a.view_count}</td>
                        <td>{new Date(a.created_at).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => router.push(`/admin/blog/${a.id}/edit`)}
                              title="Chỉnh sửa"
                            >
                              <IconEdit size={16} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => {
                                setArticleToDelete(a);
                                setDeleteModalOpen(true);
                              }}
                              title="Xóa"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.paginationBtn}
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </button>
                  <span className={styles.paginationText}>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.paginationBtn}
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {deleteModalOpen && (
          <div className={styles.modalOverlay} onClick={() => !deleting && (setDeleteModalOpen(false), setArticleToDelete(null))}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Xác nhận xóa</h2>
              <p className={styles.modalBody}>
                Bạn có chắc chắn muốn xóa bài viết &quot;{articleToDelete?.title}&quot;? Hành động này không thể hoàn tác.
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSubtle}`}
                  onClick={() => { setDeleteModalOpen(false); setArticleToDelete(null); }}
                  disabled={deleting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
