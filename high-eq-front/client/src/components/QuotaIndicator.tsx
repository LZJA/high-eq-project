import { useQuota } from '@/hooks/useQuota';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Crown } from 'lucide-react';
import { Link } from 'wouter';

/**
 * 配额指示器组件
 */
export function QuotaIndicator() {
  const { quota, isLoading, tier, remainingQuota, isUnlimited } = useQuota();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Zap className="size-4 animate-pulse" />
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  if (!quota) {
    return null;
  }

  // PRO 用户显示无限徽章
  if (isUnlimited) {
    return (
      <Badge
        variant="default"
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
      >
        <Crown className="size-3 mr-1" />
        PRO 无限次数
      </Badge>
    );
  }

  const percentage = quota.dailyQuota > 0
    ? (quota.dailyQuotaUsed / quota.dailyQuota) * 100
    : 100;
  const isLow = remainingQuota <= 1;
  const isExhausted = remainingQuota <= 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Zap className={`size-4 ${isExhausted ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-muted-foreground'}`} />
        <span className={`text-sm ${isExhausted ? 'text-destructive font-medium' : ''}`}>
          今日剩余: <strong>{remainingQuota}</strong>/{quota.dailyQuota}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`w-20 h-2 ${isExhausted ? '[&>div]:bg-destructive' : isLow ? '[&>div]:bg-amber-500' : ''}`}
      />
      {isLow && (
        <Link href="/subscription">
          <Button size="sm" variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
            升级 PRO
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * 紧凑版配额指示器（用于导航栏）
 */
export function QuotaIndicatorCompact() {
  const { quota, isLoading, isUnlimited, remainingQuota } = useQuota();

  if (isLoading || !quota) {
    return null;
  }

  if (isUnlimited) {
    return (
      <Badge
        variant="default"
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs"
      >
        <Crown className="size-3 mr-1" />
        PRO
      </Badge>
    );
  }

  const isLow = remainingQuota <= 1;

  return (
    <Badge
      variant={isLow ? "destructive" : "secondary"}
      className="text-xs"
    >
      <Zap className="size-3 mr-1" />
      {remainingQuota}/{quota.dailyQuota}
    </Badge>
  );
}
