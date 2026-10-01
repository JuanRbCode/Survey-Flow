import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  private apionline = 'https://survey-flow-api-production.up.railway.app/api';
  private apiUrl = 'https://survey-flow-api-production.up.railway.app/api/automation/process-all';
  private http = inject(HttpClient);

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apionline}/health`);
  }

  uploadAndProcessQRs(items: { type: 'file' | 'text'; data: File | string }[]): Observable<any> {
    const formData = new FormData();

    const texts: string[] = [];

    items.forEach((item, index) => {
      if (item.type === 'file') {
        formData.append('files', item.data as File, (item.data as File).name);
      } else {
        texts.push(item.data as string);
      }
    });

    // Adjuntamos también los textos escaneados por la cámara directamente como campos del form
    formData.append('scanned_texts', JSON.stringify(texts));

    return this.http.post<any>(this.apiUrl, formData);
  }
}
