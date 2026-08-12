import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyService } from './service/survey-service';
import { CommonModule } from '@angular/common'; // Quitar JsonPipe de aquí
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NgxScannerQrcodeComponent],
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

  // Control para mostrar/ocultar la cámara
  isCameraActive: boolean = false;

  @ViewChild('action') scanner!: NgxScannerQrcodeComponent;

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles.push(...files);
    }
  }

  // --- MÉTODOS PARA LA CÁMARA ---
  toggleCamera() {
    this.isCameraActive = !this.isCameraActive;
    if (this.isCameraActive) {
      setTimeout(() => {
        this.scanner.start();
      }, 200);
    } else {
      this.scanner.stop();
    }
  }

  // Cuando la cámara detecta un QR exitosamente
  onQRCodeScanned(e: any) {
    if (e && e.length > 0 && e[0].value) {
      const qrValue = e[0].value; // Esta es la URL o texto del QR
      console.log('QR Escaneado por cámara:', qrValue);

      // Como tu backend procesa archivos de imagen (QR en foto), 
      // podemos simular un archivo o mandar la URL directamente si adaptas tu API.
      // Una forma genial para no romper tu backend actual: crear un archivo de texto virtual o 
      // modificar tu backend para que acepte URLs directas. 
      // O convertir el texto del QR en un Blob/File simulado:

      const fakeFile = new File([qrValue], `qr-camara-${Date.now()}.txt`, { type: 'text/plain' });

      // Evitar duplicados seguidos
      if (!this.selectedFiles.some(f => f.name === fakeFile.name)) {
        this.selectedFiles.push(fakeFile);

        // Opcional: Detener la cámara tras escanear uno con éxito, o dejarla abierta para escanear varios seguidos
        // this.toggleCamera(); 
        this.cdr.detectChanges();
      }
    }
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) return;
    if (this.isCameraActive) this.toggleCamera(); // Apagar cámara si está abierta

    this.loading = true;
    this.progressPercentage = 5;
    this.responseResult = null;

    const totalFiles = this.selectedFiles.length;
    const incrementTime = Math.max(600, totalFiles * 300);

    const interval = setInterval(() => {
      if (this.progressPercentage < 85) {
        this.progressPercentage += 5;
        this.cdr.detectChanges();
      }
    }, incrementTime);

    this.surveyService.uploadAndProcessQRs(this.selectedFiles).subscribe({
      next: (res) => {
        clearInterval(interval);
        this.progressPercentage = 100;
        setTimeout(() => {
          this.responseResult = res;
          this.loading = false;
          this.cdr.detectChanges();
        }, 400);
      },
      error: (err) => {
        clearInterval(interval);
        this.progressPercentage = 0;
        this.responseResult = { error: 'Ocurrió un error al conectar con la API.' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


  // Método para eliminar un archivo específico de la cola
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.cdr.detectChanges();
  }


}
