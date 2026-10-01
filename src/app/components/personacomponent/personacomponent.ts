import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  constructor(private fb: FormBuilder, private personaService: PersonaService) {
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
        setTimeout(() => {
          this.cerrarModal();
        }, 1500); // Cierra el modal tras 1.5 segundos de éxito
      },
      error: (err) => {
        // 1. Tira el error completo a la consola para que lo veas técnico
        console.error('❌ Error detallado en la API:', err);

        // 2. Captura el mensaje amigable que manda el backend (o uno por defecto)
        const detalle = err.error?.detail || 'El correo o el DNI ya se encuentran registrados o hubo un conflicto.';

        // 3. Lo asigna a la variable para mostrarlo visualmente en el modal
        this.errorMessage = detalle;
      }
    });
  }
}
