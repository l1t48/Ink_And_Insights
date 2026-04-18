import { Component, EventEmitter, Output, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SignalRService } from '../../services/signalr.service';
import { ModalHelper } from '../../helper/modal-helper';

declare const bootstrap: any;

@Component({
  selector: 'app-edit-quote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="editQuoteModal" tabindex="-1" aria-labelledby="editQuoteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" (submit)="onSave($event)" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="editQuoteModalLabel">Edit Quote</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" [disabled]="saving"></button>
          </div>

          <div class="modal-body">
            <div *ngIf="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

            <div class="mb-3">
              <label for="editQuoteText" class="form-label">Quote</label>
              <textarea id="editQuoteText" class="form-control" rows="3" [(ngModel)]="quote.text" name="text" required></textarea>
            </div>

            <div class="mb-3">
              <label for="editQuoteAuthor" class="form-label">Author (optional)</label>
              <input id="editQuoteAuthor" class="form-control" [(ngModel)]="quote.author" name="author" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" [disabled]="saving">Close <i class="fa-solid fa-xmark"></i></button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <span *ngIf="!saving">Save <i class="fa-regular fa-floppy-disk"></i></span>
              <span *ngIf="saving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditQuoteModalComponent implements AfterViewInit {
  @Input() quote: any = { text: '', author: '', id: null };
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private api: ApiService, private signalR: SignalRService, private el: ElementRef) { }
  
  ngAfterViewInit() {
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Get the modal DOM element reference
        const modalElement = this.el.nativeElement.querySelector('.modal');
        if (modalElement) {
            // Attach listener for the Bootstrap 'hide' event
            modalElement.addEventListener('hide.bs.modal', () => {
                // Call the helper function to blur focus
                ModalHelper.blurActiveElement(modalElement);
            });
        }
    }

  showModal() {
    ModalHelper.showModal('editQuoteModal');
  }

  closeModal() {
    ModalHelper.hideModal('editQuoteModal');
  }

  onSave(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.quote.text?.trim()) {
      this.errorMessage = 'Quote text is required.';
      return;
    }

    this.saving = true;

    this.api.updateQuote(this.quote.id, {
      text: this.quote.text.trim(),
      author: this.quote.author?.trim() || null
    }).subscribe({
      next: res => {
        this.successMessage = 'Quote updated successfully.';
        this.signalR.refreshQuotes();
        this.saving = false;
        setTimeout(() => {
          this.closeModal();
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;

        if (err.error?.errors) {
          const firstFieldErrors = Object.values(err.error.errors)[0];
          this.errorMessage = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Failed to update quote.';
        }
      }

    });
  }
}
