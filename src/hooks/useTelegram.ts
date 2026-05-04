import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  enableClosingConfirmation?: () => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
  MainButton?: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    setParams: (params: { color?: string; text_color?: string }) => void;
  };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  initDataUnsafe?: {
    user?: { first_name?: string; username?: string };
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function useTelegram() {
  const [tg] = useState<TelegramWebApp | undefined>(() => window.Telegram?.WebApp);
  const [userName, setUserName] = useState<string>('Игрок');

  useEffect(() => {
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      const u = tg.initDataUnsafe?.user;
      if (u?.first_name) setUserName(u.first_name);
    }
  }, [tg]);

  const haptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    tg?.HapticFeedback?.impactOccurred(style);
  };

  const hapticSuccess = () => {
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const hapticError = () => {
    tg?.HapticFeedback?.notificationOccurred('error');
  };

  const setMainButton = (text: string, onClick: () => void, visible = true) => {
    if (!tg?.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    if (visible) tg.MainButton.show();
    else tg.MainButton.hide();
  };

  const hideMainButton = () => {
    tg?.MainButton?.hide?.();
  };

  const setBackButton = (onClick: () => void, visible = true) => {
    if (!tg?.BackButton) return;
    tg.BackButton.onClick(onClick);
    if (visible) tg.BackButton.show();
    else tg.BackButton.hide();
  };

  const hideBackButton = () => {
    tg?.BackButton?.hide?.();
  };

  return {
    isTelegram: !!tg,
    userName,
    haptic,
    hapticSuccess,
    hapticError,
    setMainButton,
    hideMainButton,
    setBackButton,
    hideBackButton,
  };
}
