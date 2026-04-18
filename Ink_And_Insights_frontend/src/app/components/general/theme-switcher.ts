import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-sticky-button',
  standalone: true,
  template: `
    <button
      class="btn btn-primary position-fixed bottom-0 end-0 m-3"
      (click)="toggleTheme()"
    >
      {{ isDark() ? 'Light Mode' : 'Dark Mode' }} <i class="fa-solid fa-shuffle"></i>
    </button>
  `,
})
export class ThemeSwitcher {
  protected readonly isDark = signal(false);

  toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-bs-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', next);
    this.isDark.set(next === 'dark');
  }
}
