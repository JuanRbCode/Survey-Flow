import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyService } from './service/survey-service';
import { CommonModule } from '@angular/common';
import { NgxScannerQrcodeComponent, LOAD_WASM } from 'ngx-scanner-qrcode';
import { Personacomponent } from './components/personacomponent/personacomponent';

interface QueueItem {
  type: 'file' | 'text';
  file?: File;
  text?: string;
  name: string;
  size?: number;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    NgxScannerQrcodeComponent,
    Personacomponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  isServerConnected: boolean = false;
  private pingInterval: any;

  progressPercentage = 0;
  private surveyService = inject(SurveyService);
  private cdr = inject(ChangeDetectorRef);

  selectedItems: QueueItem[] = [];
  loading: boolean = false;
  responseResult: any = null;

  isCameraActive: boolean = false;

  @ViewChild('action') scanner!: NgxScannerQrcodeComponent;

  ngOnInit() {
    this.verificarConexion(); // Verificar al cargar la página

    // Configurar temporizador cada 5 minutos (300,000 ms) para verificar y mantener despierto el servidor
    this.pingInterval = setInterval(() => {
      this.verificarConexion();
    }, 300000);
  }

  ngOnDestroy() {
    // Limpiar el temporizador cuando se destruya el componente para evitar fugas de memoria
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  verificarConexion() {
    // Asumiendo que injectas HttpClient o usas tu surveyService.
    // Puedes hacer un get directo a tu endpoint de health:
    this.surveyService.checkHealth().subscribe({
      next: () => {
        this.isServerConnected = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isServerConnected = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      files.forEach(file => {
        this.selectedItems.push({
          type: 'file',
          file: file,
          name: file.name,
          size: file.size
        });
      });
    }
  }

  toggleCamera() {
    this.isCameraActive = !this.isCameraActive;
    if (this.isCameraActive) {
      setTimeout(() => {
        if (this.scanner) {
          this.scanner.start();
        }
      }, 200);
    } else {
      if (this.scanner) {
        this.scanner.stop();
      }
    }
  }

  onQRCodeScanned(e: any) {
    if (!e || e.length === 0 || !e[0].value) return;

    const qrValue = e[0].value;

    // 1. 🛑 DETENER EL ESCÁNER INMEDIATAMENTE PARA PARAR EL BUCLE Y EL SONIDO
    if (this.scanner) {
      this.scanner.stop();
    }

    // 2. ⚠️ VERIFICAR SI EL QR YA ESTÁ REGISTRADO EN LA COLA
    const yaExisteEnCola = this.selectedItems.some(item => item.text === qrValue);

    if (yaExisteEnCola) {
      window.alert('⚠️️ QR ya registrado en la lista');
      this.reiniciarEscannerSeguro();
      return;
    }

    // 3. ✅ SI ES NUEVO: Reproducir sonido de éxito una sola vez
    console.log('QR Escaneado correctamente:', qrValue);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(err => console.log('Audio play blocked', err));

    const itemName = `Escaneado Cámara - ${Date.now()}`;

    this.selectedItems.push({
      type: 'text',
      text: qrValue,
      name: itemName
    });
    this.cdr.detectChanges();

    // Alerta de éxito opcional (o puedes omitirla si prefieres flujo continuo rápido)
    window.alert('✅ QR escaneado con éxito');

    // 4. Reactivar el escáner para el siguiente código
    this.reiniciarEscannerSeguro();
  }

  private reiniciarEscannerSeguro() {
    // Solo reinicia si la cámara sigue activa por el usuario
    if (this.isCameraActive) {
      setTimeout(() => {
        if (this.scanner) {
          this.scanner.start();
        }
      }, 800);
    }
  }

  onSubmit(): void {
    if (this.selectedItems.length === 0) return;
    if (this.isCameraActive) this.toggleCamera();

    this.loading = true;
    this.progressPercentage = 5;
    this.responseResult = null;

    const totalItems = this.selectedItems.length;
    const incrementTime = Math.max(600, totalItems * 300);

    const interval = setInterval(() => {
      if (this.progressPercentage < 85) {
        this.progressPercentage += 5;
        this.cdr.detectChanges();
      }
    }, incrementTime);

    const payloadItems = this.selectedItems.map(item => ({
      type: item.type,
      data: item.type === 'file' ? item.file! : item.text!
    }));

    this.surveyService.uploadAndProcessQRs(payloadItems).subscribe({
      next: (res) => {
        clearInterval(interval);
        this.progressPercentage = 100;
        setTimeout(() => {
          this.responseResult = res;
          this.loading = false;
          this.cdr.detectChanges();
        }, 400);
      },
      error: () => {
        clearInterval(interval);
        this.progressPercentage = 0;
        this.responseResult = { error: 'Ocurrió un error al conectar con la API local.' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeItem(index: number): void {
    this.selectedItems.splice(index, 1);
    this.cdr.detectChanges();
  }
}
