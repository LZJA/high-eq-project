import { useQuota } from '@/hooks/useQuota';
import { AI_MODELS } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * 模型选择器组件（带权限控制）
 */
export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const { tier } = useQuota();
  const isPro = tier === 'pro';

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择 AI 模型" />
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => {
          const isAllowed = model.tier.includes(tier as 'free' | 'pro');

          return (
            <SelectItem
              key={model.value}
              value={model.value}
              disabled={!isAllowed}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span>{model.label}</span>
                {!isAllowed && (
                  <Badge variant="outline" className="ml-auto text-amber-600 border-amber-600 text-xs">
                    <Lock className="size-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
