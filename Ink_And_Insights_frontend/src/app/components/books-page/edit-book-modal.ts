import { Component, EventEmitter, Output, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SignalRService } from '../../services/signalr.service';
import { ModalHelper } from '../../helper/modal-helper';

declare const bootstrap: any;

interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
}

@Component({
  selector: 'app-edit-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="modal fade" id="editBookModal" tabindex="-1" aria-labelledby="editBookModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <form class="modal-content" (submit)="onSave($event)" novalidate>
        <div class="modal-header">
          <h5 class="modal-title" id="editBookModalLabel">Edit Book</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div *ngIf="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

          <div class="mb-3">
            <label for="bookTitleEdit" class="form-label">Title</label>
            <input id="bookTitleEdit" class="form-control" [(ngModel)]="book.title" name="title" required />
          </div>

          <div class="mb-3">
            <label for="bookAuthorEdit" class="form-label">Author</label>
            <input id="bookAuthorEdit" class="form-control" [(ngModel)]="book.author" name="author" required />
          </div>

          <div class="mb-3">
            <label for="bookDescriptionEdit" class="form-label">Description</label>
            <textarea id="bookDescriptionEdit" class="form-control" rows="3" [(ngModel)]="book.description" name="description"></textarea>
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
export class EditBookModalComponent implements AfterViewInit {
  @Input() book: Book = { title: '', author: '', description: '' };

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
    ModalHelper.showModal('editBookModal');
  }

  closeModal() {
    ModalHelper.hideModal('editBookModal');
  }

  onSave(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.book.title.trim() || !this.book.author.trim()) {
      this.errorMessage = 'Title and author are required.';
      return;
    }

    this.saving = true;

    this.api.updateBook(this.book.id!, {
      title: this.book.title.trim(),
      author: this.book.author.trim(),
      description: this.book.description?.trim() || null
    }).subscribe({
      next: (res) => {
        this.successMessage = 'Book updated successfully.';
        this.signalR.refreshBooks();
        this.saving = false;

        setTimeout(() => {
          this.closeModal();
        }, 600);
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
          this.errorMessage = 'Failed to update book.';
        }
      }

    });
  }
}
