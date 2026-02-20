import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'golden-days-install-dismissed';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 설치되었거나 닫은 적 있으면 표시 안 함
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // iOS 감지
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOSDevice) {
      setIsIOS(true);
      // 3초 후 표시 (첫 로딩 안정화 후)
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: beforeinstallprompt 이벤트 캐치
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-40 bg-white rounded-2xl shadow-lg p-4 border border-primary/20"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-text/40 p-1"
            aria-label="닫기"
          >
            <X size={18} />
          </button>

          {isIOS ? (
            // iOS Safari 안내
            <div className="pr-6">
              <p className="text-text font-bold text-lg">홈 화면에 추가하세요</p>
              <p className="text-text/60 text-base mt-1 leading-relaxed">
                하단의 <span className="inline-block mx-1 text-blue-500">공유 버튼(↑)</span>을 누른 후
                <br />
                <span className="font-medium text-text/80">"홈 화면에 추가"</span>를 선택하세요
              </p>
            </div>
          ) : (
            // Android/Chrome 설치 버튼
            <div className="flex items-center gap-3 pr-6">
              <div className="flex-1">
                <p className="text-text font-bold text-lg">홈 화면에 추가하세요</p>
                <p className="text-text/60 text-base mt-0.5">앱처럼 편하게 사용할 수 있어요</p>
              </div>
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl font-medium text-base flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
                >
                  <Download size={18} />
                  추가
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
