import { Component } from '@angular/core';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [],
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.css'
})
export class InsuranceComponent {
  title = 'Convenios con Isapres';
  insurances = [
    {
      name: 'Consalud',
      description: 'Accede a cobertura completa en consultas y exámenes. Atención preferente con médicos especialistas.'
    },
    {
      name: 'Banmédica',
      description: 'Beneficios exclusivos para afiliados. Reembolsos ágiles y amplia red de atención.'
    },
    {
      name: 'Colmena',
      description: 'Descuentos especiales en atención médica, exámenes y programas de salud preventiva.'
    },
    {
      name: 'Cruz Blanca',
      description: 'Consultas con especialistas sin pago inmediato. Convenios para programas preventivos.'
    }
  ];
}