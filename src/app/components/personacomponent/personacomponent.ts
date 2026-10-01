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
  isModalOpen: boolean = false;
  personaForm: FormGroup;

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
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.personaForm.reset();
  }

  onSubmit() {
    if (this.personaForm.valid) {
      this.personaService.crearPersona(this.personaForm.value).subscribe({
        next: (response) => {
          // Alerta nativa elegante y al aceptarla se cierra y limpia
          window.alert('¡Persona registrada con éxito en la base de datos!');
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          window.alert('Hubo un error al guardar los datos en la base de datos.');
        }
      });
    }
  }
}