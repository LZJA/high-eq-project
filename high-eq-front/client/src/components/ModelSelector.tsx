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
import { Lock } from 'lucide-react';

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
  const selectedModel = AI_MODELS.find((model) => model.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-auto min-h-10 py-2">
        {selectedModel ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
            <span className="truncate font-medium">{selectedModel.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {selectedModel.costPoints} 点/次
              {selectedModel.supportsImage ? ' · 支持截图' : ''}
            </span>
          </div>
        ) : (
          <SelectValue placeholder="选择 AI 模型" />
        )}
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => {
          const isAllowed = model.tier.includes(tier as 'free' | 'lite' | 'pro');

          return (
            <SelectItem
              key={model.value}
              value={model.value}
              disabled={!isAllowed}
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="min-w-0">
                  <div>{model.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {model.costPoints} 点/次{model.supportsImage ? ' · 支持截图' : ''}
                  </div>
                </div>
                {!isAllowed && (
                  <Badge variant="outline" className="ml-auto text-amber-600 border-amber-600 text-xs">
                    <Lock className="size-3 mr-1" />
                    {model.description}
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
