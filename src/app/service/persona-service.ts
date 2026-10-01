import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  // Ajusta la URL base según corresponda a tu FastAPI
  private apiUrl = 'https://survey-flow-api-production.up.railway.app/api/automation/personas'; 

  constructor(private http: HttpClient) {}

  crearPersona(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }
}