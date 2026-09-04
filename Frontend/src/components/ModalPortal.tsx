import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Renders dialogs outside animated/scrolling page panels so they cannot be clipped. */
export const ModalPortal = ({ children }: { children: ReactNode }) =>
  createPortal(children, document.body);
