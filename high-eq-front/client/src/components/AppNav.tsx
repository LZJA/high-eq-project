import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActivePage = "app" | "history" | "favorites" | "profiles";

interface AppNavProps {
  /** 当前所在页面，用于高亮或隐藏对应导航项 */
  activePage?: ActivePage;
  /** 是否显示退出按钮，默认 false */
  showLogout?: boolean;
}

const NAV_LINKS: { href: string; label: string; page: ActivePage }[] = [
  { href: "/app", label: "回复生成器", page: "app" },
  { href: "/profiles", label: "人物档案", page: "profiles" },
  { href: "/history", label: "历史记录", page: "history" },
  { href: "/favorites", label: "收藏", page: "favorites" },
];

export function AppNav({ activePage, showLogout = false }: AppNavProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          HighEQ
        </Link>

        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center gap-4">
          {NAV_LINKS.filter((link) => link.page !== activePage).map((link) => (
            <Link
              key={link.page}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <span className="text-sm text-muted-foreground">{user?.username}</span>
          {showLogout && (
            <Button variant="outline" size="sm" onClick={logout}>
              退出
            </Button>
          )}
        </div>

        {/* 移动端菜单 */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user?.username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {NAV_LINKS.filter((link) => link.page !== activePage).map((link) => (
                <DropdownMenuItem key={link.page} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              {showLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>退出</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
