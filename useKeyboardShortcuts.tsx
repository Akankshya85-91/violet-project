import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, shiftKey, action }) => {
        const ctrlMatch = ctrlKey === undefined || e.ctrlKey === ctrlKey;
        const shiftMatch = shiftKey === undefined || e.shiftKey === shiftKey;
        
        if (e.key.toLowerCase() === key.toLowerCase() && ctrlMatch && shiftMatch) {
          if (ctrlKey || shiftKey) {
            e.preventDefault();
          }
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useGlobalShortcuts = () => {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: 't',
      ctrlKey: true,
      action: () => navigate('/translate'),
      description: 'Go to Text Translation'
    },
    {
      key: 'i',
      ctrlKey: true,
      action: () => navigate('/image-translate'),
      description: 'Go to Image Translation'
    },
    {
      key: 'v',
      ctrlKey: true,
      action: () => navigate('/video-translate'),
      description: 'Go to Video Translation'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/history'),
      description: 'Go to History'
    },
  ]);
};
