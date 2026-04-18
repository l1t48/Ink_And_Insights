// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // public baseUrl = import.meta.env.VITE_apiBaseUrlLocal;
    // public baseUrlLocalWitoutAPI = import.meta.env.VITE_BaseUrlLocalWitoutAPI;
    public baseUrl = environment.apiBaseUrl;
    public baseUrlLocalWitoutAPI = environment.baseUrlWithoutAPI;

    constructor(private http: HttpClient) { }

    // ====================
    // AUTH
    // ====================

    register(data: any): Observable<any> {
        // Remove withCredentials for registration to avoid parsing errors, and it is not needed anyway here because no cred is needed the user need to login
        return this.http.post(`${this.baseUrl}/auth/register`, data);
    }

    login(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/auth/login`, data, { withCredentials: true });
    }

    getAuthMe(): Observable<any> {
        return this.http.get(`${this.baseUrl}/auth/user-data`, { withCredentials: true });
    }

    logout(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/auth/logout`, data);
    }

    // ====================
    // BOOKS
    // ====================

    getBooks(): Observable<any> {
        return this.http.get(`${this.baseUrl}/books`, { withCredentials: true });
    }

    getBookById(id: string | number): Observable<any> {
        return this.http.get(`${this.baseUrl}/books/${id}`, { withCredentials: true });
    }

    createBook(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/books`, data, { withCredentials: true });
    }

    updateBook(id: string | number, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/books/${id}`, data, { withCredentials: true });
    }

    deleteBook(id: string | number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/books/${id}`, { withCredentials: true });
    }

    // ====================
    // QUOTES
    // ====================

    getQuotes(): Observable<any> {
        return this.http.get(`${this.baseUrl}/quotes`, { withCredentials: true });
    }

    getQuoteById(id: string | number): Observable<any> {
        return this.http.get(`${this.baseUrl}/quotes/${id}`, { withCredentials: true });
    }

    createQuote(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/quotes`, data, { withCredentials: true });
    }

    updateQuote(id: string | number, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/quotes/${id}`, data, { withCredentials: true });
    }

    deleteQuote(id: string | number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/quotes/${id}`, { withCredentials: true });
    }

    // --------------------
    // TEST
    // --------------------
    getTest(): Observable<any> {
        return this.http.get(`${this.baseUrl}/test`);
    }

    postTest(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/test`, data, { withCredentials: true });
    }
}
