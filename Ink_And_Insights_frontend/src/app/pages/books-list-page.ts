import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateBookModalComponent } from '../components/books-page/add-book-modal';
import { EditBookModalComponent } from '../components/books-page/edit-book-modal';
import { SignalRService } from '../services/signalr.service';
import { Observable } from 'rxjs';

interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
}

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [CommonModule, CreateBookModalComponent, EditBookModalComponent],
  template: `
    <div class="w-100 px-3 px-md-5 mt-4">
      <div class="d-flex flex-row justify-content-between align-items-center mb-3">
        <h1 class="mb-0">Books</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createBookModal">
          Add a new book <i class="fa-solid fa-plus"></i>
        </button>
      </div>

      <!-- Table for larger screens -->
      <div class="table-responsive d-none d-xl-block">
        <table class="table table-striped table-hover border mt-3">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Description</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let book of books$ | async">
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.description || '-' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-primary me-2" (click)="editBook(book)">
                  Edit <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" (click)="deleteBook(book.id)">
                  Remove <i class="fa-solid fa-xmark"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards for smaller screens -->
      <div class="d-block d-xl-none">
        <div class="card mb-3" *ngFor="let book of books$ | async">
          <div class="card-body">
            <h5 class="card-title">Title: {{ book.title }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Author: {{ book.author }}</h6>
            <p class="card-text">Description: {{ book.description || '-' }}</p>
            <button class="btn btn-sm btn-primary me-2" (click)="editBook(book)">
              Edit <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-danger" (click)="deleteBook(book.id)">
              Remove <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <app-create-book-modal></app-create-book-modal>
    <app-edit-book-modal #editModal [book]="selectedBook"></app-edit-book-modal>
  `
})
export class BooksListPage implements OnInit, AfterViewInit {
  books$!: Observable<Book[]>;
  selectedBook: Book = { title: '', author: '', description: '' };

  @ViewChild('editModal') editModal!: EditBookModalComponent;

  constructor(private signalR: SignalRService) { }

  ngOnInit() {
    // Bind table to SignalR observable for real-time updates
    this.books$ = this.signalR.books$;
  }

  ngAfterViewInit() {
    const modalIds = ['createBookModal', 'editBookModal'];
    modalIds.forEach(id => {
      const modalEl = document.getElementById(id);
      modalEl?.addEventListener('hidden.bs.modal', () => {
        const active = document.activeElement as HTMLElement | null;
        if (active && modalEl.contains(active)) {
          active.blur();          // remove focus from any focused element inside modal
        }
      });
    });
  }

  editBook(book: Book) {
    this.selectedBook = { ...book }; // clone to avoid two-way binding issues
    this.editModal.showModal();       // open edit modal
  }

  deleteBook(bookId?: number) {
    if (!bookId) return;
    if (confirm('Are you sure you want to delete this book?')) {
      this.signalR.api.deleteBook(bookId).subscribe({
        next: (res) =>{
          this.signalR.refreshBooks();
          alert(res.message);
        },
        error: (err) => alert(err)
      });
    }
  }

}
