import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContactSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 浮动按钮 */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* 侧边栏 */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="fixed right-0 top-0 h-full w-80 z-50 rounded-none shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">联系作者</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                扫描二维码添加作者微信
              </p>
              <div className="w-64 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg">
                <img
                  src="/images/wechat-qr.jpg"
                  alt="微信二维码"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3E请放置二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                有问题或建议？欢迎交流
              </p>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
