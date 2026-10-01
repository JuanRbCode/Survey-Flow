import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonaService } from '../../service/persona-service';

@Component({
  selector: 'app-personacomponent',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './personacomponent.html',
  styleUrl: './personacomponent.css',
})
export class Personacomponent {
  personaForm: FormGroup;
  isModalOpen = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService,
    private cdr: ChangeDetectorRef // 👈 Inyectamos el detector de cambios
  ) {
    this.personaForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      dni: ['', Validators.required]
    });
  }

  abrirModal() {
    this.isModalOpen = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.personaForm.reset();
  }

  onSubmit() {
    if (this.personaForm.invalid) return;

    this.errorMessage = null;
    this.successMessage = null;

    this.personaService.crearPersona(this.personaForm.value).subscribe({
      next: (response) => {
        console.log('✅ Persona registrada con éxito:', response);
        this.successMessage = '¡Persona registrada correctamente en la base de datos!';
        this.cdr.detectChanges(); // 👈 Forzamos la actualización visual inmediata

        setTimeout(() => {
          this.cerrarModal();
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Error detallado en la API:', err);

        // Capturamos el mensaje que manda FastAPI (detail)
        const detalle = err.error?.detail || 'El correo o el DNI ya se encuentran registrados o hubo un conflicto.';
        this.errorMessage = detalle;

        this.cdr.detectChanges(); // 👈 Forzamos a que aparezca la alerta roja en pantalla
      }
    });
  }
}
