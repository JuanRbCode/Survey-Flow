import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyService } from './service/survey-service';
import { CommonModule } from '@angular/common'; // Quitar JsonPipe de aquí

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
 private surveyService = inject(SurveyService);
  private cdr = inject(ChangeDetectorRef);

  selectedFiles: File[] = [];
  loading: boolean = false;
  responseResult: any = null;

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) return;

    this.loading = true;
    this.responseResult = null;

    this.surveyService.uploadAndProcessQRs(this.selectedFiles).subscribe({
      next: (res) => {
        console.log('Respuesta recibida:', res);
        this.responseResult = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al procesar las encuestas:', err);
        this.responseResult = { error: 'Ocurrió un error al conectar con la API.' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
