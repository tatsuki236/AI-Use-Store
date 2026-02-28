interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 30) return `${diffDay}日前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}ヶ月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-amber-400" : "text-gray-200 dark:text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        まだレビューはありません
      </p>
    );
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Stars rating={Math.round(avgRating)} />
        <span className="font-medium text-foreground">
          {avgRating.toFixed(1)}
        </span>
        <span>({reviews.length}件のレビュー)</span>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-border/60 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    U
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">匿名ユーザー</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(review.created_at)}
              </span>
            </div>
            <Stars rating={review.rating} />
            {review.comment && (
              <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
