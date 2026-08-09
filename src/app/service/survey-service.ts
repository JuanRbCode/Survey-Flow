
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class SurveyService {

    // La base de Render + el endpoint que tenías en tu API
    private apiUrl = 'https://survey-flow-api.onrender.com/api/automation/process-all';
    private http = inject(HttpClient);

    uploadAndProcessQRs(files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file, file.name);
        });

        return this.http.post<any>(this.apiUrl, formData);
    }
}
