import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuoteModalComponent } from '../components/quotes-page/add-quote-modal';
import { EditQuoteModalComponent } from '../components/quotes-page/edit-quote-modal';
import { SignalRService } from '../services/signalr.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-quotes-list-page',
  standalone: true,
  imports: [CommonModule, CreateQuoteModalComponent, EditQuoteModalComponent],
  template: `
    <div class="w-100 px-3 px-md-5 mt-4">
      <div class="d-flex flex-row justify-content-between align-items-center mb-3">
        <h1 class="mb-0">Quotes</h1>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createQuoteModal">
          Add a new quote <i class="fa-solid fa-plus"></i>
        </button>
      </div>

      <div class="table-responsive d-none d-xl-block">
        <table class="table table-striped table-hover border mt-3">
          <thead>
            <tr>
              <th>Quote</th>
              <th>Author</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quote of quotes$ | async">
              <td>{{ quote.text }}</td>
              <td>{{ quote.author || '-' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-primary me-2" (click)="editQuote(quote)">Edit <i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-danger" (click)="deleteQuote(quote.id)">Remove <i class="fa-solid fa-xmark"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Small screens cards -->
      <div class="d-block d-xl-none">
        <div class="card mb-3" *ngFor="let quote of quotes$ | async">
          <div class="card-body">
            <p class="card-text">Quote: {{ quote.text }}</p>
            <h6 class="card-subtitle mb-2 text-muted">Author: {{ quote.author || '-' }}</h6>
            <button class="btn btn-sm btn-primary me-2 mt-2" (click)="editQuote(quote)">Edit <i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-sm btn-danger mt-2" (click)="deleteQuote(quote.id)">Remove <i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      </div>
    </div>

    <app-create-quote-modal></app-create-quote-modal>
    <app-edit-quote-modal #editModal [quote]="selectedQuote"></app-edit-quote-modal>
  `
})
export class QuotesListPage implements OnInit, AfterViewInit {
  quotes$!: Observable<any[]>;
  selectedQuote: any = { text: '', author: '', id: null };

  @ViewChild('editModal') editModal!: EditQuoteModalComponent;

  constructor(private signalR: SignalRService) { }

  ngOnInit() {
    this.quotes$ = this.signalR.quotes$; // signalR observable for quotes
  }

  ngAfterViewInit() {
    const modalIds = ['createQuoteModal', 'editQuoteModal'];
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

  editQuote(quote: any) {
    this.selectedQuote = { ...quote };
    this.editModal.showModal();
  }

  deleteQuote(quoteId?: number) {
    if (!quoteId) return;
    if (confirm('Are you sure you want to delete this quote?')) {
      this.signalR.api.deleteQuote(quoteId).subscribe({
        next: (res) => {
          this.signalR.refreshQuotes();
          alert(res.message);
        },
        error: (err) => alert(err)
      });
    }
  }
}
