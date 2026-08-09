
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class SurveyService {

    private apiUrl = 'http://127.0.0.1:8000/api/automation/process-all';
    private http = inject(HttpClient);

    uploadAndProcessQRs(files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file, file.name);
        });

        return this.http.post<any>(this.apiUrl, formData);
    }
}
