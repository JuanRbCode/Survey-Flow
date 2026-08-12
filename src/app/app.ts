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

  progressPercentage = 0;

  private surveyService = inject(SurveyService);
  private cdr = inject(ChangeDetectorRef);

  selectedFiles: File[] = [];
  loading: boolean = false;
  responseResult: any = null;

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) return;

    this.loading = true;
    this.progressPercentage = 5;
    this.responseResult = null;

    // Calculamos la velocidad basada en cuántos archivos son 
    // (Más archivos = avanza más lento para dar tiempo a los bots)
    const totalFiles = this.selectedFiles.length;
    const incrementTime = Math.max(600, totalFiles * 300); 

    const interval = setInterval(() => {
      // Se detiene inteligentemente en el 85% para esperar la respuesta real de la API
      if (this.progressPercentage < 85) {
        this.progressPercentage += 5;
        this.cdr.detectChanges();
      }
    }, incrementTime);

    this.surveyService.uploadAndProcessQRs(this.selectedFiles).subscribe({
      next: (res) => {
        clearInterval(interval);
        this.progressPercentage = 100; // Salta al 100% exacto cuando la API responde
        console.log('Respuesta recibida:', res);
        
        setTimeout(() => {
          this.responseResult = res;
          this.loading = false;
          this.cdr.detectChanges();
        }, 400);
      },
      error: (err) => {
        clearInterval(interval);
        console.error('Error al procesar las encuestas:', err);
        this.progressPercentage = 0;
        this.responseResult = { error: 'Ocurrió un error al conectar con la API.' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
