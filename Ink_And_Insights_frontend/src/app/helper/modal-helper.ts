// src/app/helper/modal-helper.ts

declare const bootstrap: any;

export class ModalHelper {

  /**
   * Finds the currently focused element inside the modal and removes its focus.
   * This is the critical step to prevent the aria-hidden warning.
   * @param modalEl The modal DOM element.
   */
  static blurActiveElement(modalEl: HTMLElement) {
    const active = document.activeElement as HTMLElement | null;
    // Check if there is an active element and if it is a descendant of the modal
    if (active && modalEl.contains(active)) {
      active.blur();
    }
  }

  /**
   * Safely hides a Bootstrap modal by ensuring no descendant retains focus.
   * This is used for programmatic closing (e.g., after a successful form submission).
   * @param modalId The id of the modal element to hide
   */
  static hideModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    // 1. Remove focus before starting the hide process.
    ModalHelper.blurActiveElement(el);

    // 2. Hide the modal using the Bootstrap instance.
    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
    modalInstance.hide();
  }

  /**
   * Shows a Bootstrap modal by id
   * @param modalId The id of the modal element to show
   */
  static showModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
    modalInstance.show();
  }
}