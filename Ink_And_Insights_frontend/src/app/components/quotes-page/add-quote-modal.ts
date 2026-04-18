import { Component, EventEmitter, Output, Input, AfterViewInit, ElementRef }from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SignalRService } from '../../services/signalr.service';
import { ModalHelper } from '../../helper/modal-helper';


declare const bootstrap: any; // bootstrap bundle must be loaded in index.html

@Component({
  selector: 'app-create-quote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="createQuoteModal" tabindex="-1" aria-labelledby="createQuoteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" (submit)="onSave($event)" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="createQuoteModalLabel">Create a new quote</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" [disabled]="saving"></button>
          </div>

          <div class="modal-body">
            <div *ngIf="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

            <div class="mb-3">
              <label for="quoteText" class="form-label">Quote</label>
              <textarea id="quoteText" class="form-control" rows="3" [(ngModel)]="text" name="text" required></textarea>
            </div>

            <div class="mb-3">
              <label for="quoteAuthor" class="form-label">Author (optional)</label>
              <input id="quoteAuthor" class="form-control" [(ngModel)]="author" name="author" />
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
export class CreateQuoteModalComponent implements AfterViewInit {
  text = '';
  author = '';

  saving = false;
  errorMessage = '';
  successMessage = '';

  @Output() created = new EventEmitter<any>();

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
    ModalHelper.showModal('createQuoteModal');
  }

  closeModal() {
    ModalHelper.hideModal('createQuoteModal');
  }

  onSave(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.text.trim()) {
      this.errorMessage = 'Quote text is required.';
      return;
    }

    this.saving = true;

    const payload = {
      text: this.text.trim(),
      author: this.author?.trim() || null
    };

    this.api.createQuote(payload).subscribe({
      next: res => {
        this.created.emit(res);
        this.successMessage = 'Quote created successfully.';
        this.saving = false;
        this.text = '';
        this.author = '';
        this.signalR.refreshQuotes();
        // hide modal after short delay so user sees the success message
        setTimeout(() => {
          this.closeModal();
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;

        if (err.error?.errors) {
          // Take the first validation error
          const firstFieldErrors = Object.values(err.error.errors)[0];
          this.errorMessage = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Failed to create quote.';
        }
      }

    });
  }
}
