import { Component, EventEmitter, Output, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalHelper } from '../../helper/modal-helper';
import { SignalRService } from '../../services/signalr.service';

declare const bootstrap: any; // used to programmatically hide modal (Bootstrap bundle must be loaded)

@Component({
  selector: 'app-create-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="createBookModal" tabindex="-1" aria-labelledby="createBookModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" (submit)="onSave($event)" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="createBookModalLabel">Create a new book</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">

            <div *ngIf="successMessage" class="alert alert-success py-2">
              {{ successMessage }}
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger py-2">
              {{ errorMessage }}
            </div>

            <div class="mb-3">
              <label for="bookTitle" class="form-label">Title</label>
              <input id="bookTitle" class="form-control" [(ngModel)]="title" name="title" required />
            </div>

            <div class="mb-3">
              <label for="bookAuthor" class="form-label">Author</label>
              <input id="bookAuthor" class="form-control" [(ngModel)]="author" name="author" required />
            </div>

            <div class="mb-3">
              <label for="bookDescription" class="form-label">Description</label>
              <textarea id="bookDescription" class="form-control" rows="3" [(ngModel)]="description" name="description"></textarea>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" [disabled]="saving">Close <i class="fa-solid fa-xmark"></i></button>

            <!-- We do NOT use data-bs-dismiss here so we can only close after success programmatically -->
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
export class CreateBookModalComponent implements AfterViewInit {
  title = '';
  author = '';
  description = '';

  saving = false;
  errorMessage = '';
  successMessage = '';

  @Output() created = new EventEmitter<{ id?: number; title: string; author: string; description?: string }>();

  constructor(private api: ApiService,  private signalR: SignalRService, private el: ElementRef) { }

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
    ModalHelper.showModal('createBookModal');
  }

  closeModal() {
    ModalHelper.hideModal('createBookModal');
  }

  onSave(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    // simple validation
    if (!this.title.trim() || !this.author.trim()) {
      this.errorMessage = 'Title and author are required.';
      return;
    }

    this.saving = true;

    const payload = {
      title: this.title.trim(),
      author: this.author.trim(),
      description: this.description?.trim() || null
    };

    // call backend from inside the modal
    this.api.createBook(payload).subscribe({
      next: (res) => {
        // success: emit to parent, show quick message, then close modal
        this.created.emit(res);

        this.successMessage = 'Book created successfully.';
        this.signalR.refreshBooks();
        this.saving = false;

        // clear inputs for next time
        this.title = '';
        this.author = '';
        this.description = '';

        // programmatically hide the modal after a short delay so user sees the success message
        setTimeout(() => {
          this.closeModal();
        }, 600);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;

        if (err.error?.errors) {
          // Get first validation error from the errors object
          const firstFieldErrors = Object.values(err.error.errors)[0];
          this.errorMessage = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Failed to create book.';
        }
      }
    });
  }
}
