import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  private booksSubject = new BehaviorSubject<any[]>([]);
  books$ = this.booksSubject.asObservable();

  private quotesSubject = new BehaviorSubject<any[]>([]);
  quotes$ = this.quotesSubject.asObservable();

  constructor(public api: ApiService) { }

  startConnection(baseUrl: string) {
    if (this.hubConnection) {
      this.stopConnection();
      this.clearData();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        this.loadInitialBooks();
        this.loadInitialQuotes();
      })
      .catch(err => console.error('SignalR connection error:', err));

    // Real-time events
    this.hubConnection.on('BookCreated', (book) => {
      const current = this.booksSubject.value;
      this.booksSubject.next([book, ...current]);
    });

    this.hubConnection.on('BookUpdated', (book) => {
      const updated = this.booksSubject.value.map(b => b.id === book.id ? book : b);
      this.booksSubject.next(updated);
    });

    this.hubConnection.on('BookDeleted', (data) => {
      const id = data.id;
      const filtered = this.booksSubject.value.filter(b => b.id !== id);
      this.booksSubject.next(filtered);
    });

    this.hubConnection.on('QuoteCreated', (quote) => {
      const current = this.quotesSubject.value;
      const updated = [quote, ...current].slice(0, 5); // keep only latest 5
      this.quotesSubject.next(updated);
    });

    this.hubConnection.on('QuoteUpdated', (quote) => {
      const updated = this.quotesSubject.value.map(q => q.id === quote.id ? quote : q);
      this.quotesSubject.next(updated);
    });

    this.hubConnection.on('QuoteDeleted', (data) => {
      const id = data.id;
      const filtered = this.quotesSubject.value.filter(q => q.id !== id);
      this.quotesSubject.next(filtered);
    });
  }

  stopConnection() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  private loadInitialBooks() {
    this.api.getBooks().subscribe(books => {
      this.booksSubject.next(books);
    });
  }

  public loadInitialQuotes() {
    this.api.getQuotes().subscribe(quotes => {
      this.quotesSubject.next(quotes);
    });
  }

  public refreshBooks() {
    this.loadInitialBooks();
  }

  public refreshQuotes() {
    this.loadInitialQuotes();
  }

  public clearData() {
    this.booksSubject.next([]);
    this.quotesSubject.next([]);
  }
}
