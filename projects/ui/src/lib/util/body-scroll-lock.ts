let lockCount = 0;

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }
  lockCount += 1;
  document.body.classList.add('overflow-hidden');
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.classList.remove('overflow-hidden');
  }
}
