import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

type ActivePage = "app" | "history" | "favorites";

interface AppNavProps {
  /** 当前所在页面，用于高亮或隐藏对应导航项 */
  activePage?: ActivePage;
  /** 是否显示退出按钮，默认 false */
  showLogout?: boolean;
}

const NAV_LINKS: { href: string; label: string; page: ActivePage }[] = [
  { href: "/app", label: "回复生成器", page: "app" },
  { href: "/history", label: "历史记录", page: "history" },
  { href: "/favorites", label: "收藏", page: "favorites" },
];

export function AppNav({ activePage, showLogout = false }: AppNavProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            HighEQ
          </Link>
          {/* <Badge variant="secondary" className="ml-2">Beta</Badge> */}
        </div>

        {/* 导航链接 + 用户信息 */}
        <div className="flex items-center gap-4">
          {NAV_LINKS.filter((link) => link.page !== activePage).map((link) => (
            <Link
              key={link.page}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            {showLogout && (
              <Button variant="outline" size="sm" onClick={logout}>
                退出
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
