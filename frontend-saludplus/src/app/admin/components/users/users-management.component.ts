import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-management">
      <h2>Gestión de Usuarios</h2>
      
      <div class="filters">
        <select [(ngModel)]="roleFilter" (change)="applyFilters()">
          <option value="">Todos los roles</option>
          <option value="patient">Pacientes</option>
          <option value="doctor">Médicos</option>
          <option value="admin">Administradores</option>
        </select>
        
        <input type="text" [(ngModel)]="searchTerm" 
               placeholder="Buscar usuario..." 
               (input)="applyFilters()">
      </div>
      
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of filteredUsers">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" [class.patient]="user.role === 'patient'"
                    [class.doctor]="user.role === 'doctor'"
                    [class.admin]="user.role === 'admin'">
                {{ getUserRoleText(user.role) }}
              </span>
            </td>
            <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <button class="btn-edit" (click)="editUser(user)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" (click)="deleteUser(user.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="no-results" *ngIf="filteredUsers.length === 0">
        No se encontraron usuarios con los criterios seleccionados
      </div>
    </div>
  `,
  styles: [`
    .users-management {
      padding: 20px;
    }
    
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .filters select, .filters input {
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .users-table th, .users-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    .users-table th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .badge.patient {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    
    .badge.doctor {
      background-color: #dcfce7;
      color: #166534;
    }
    
    .badge.admin {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .btn-edit, .btn-delete {
      padding: 6px;
      margin-right: 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-edit {
      background-color: #eff6ff;
      color: #2563eb;
    }
    
    .btn-delete {
      background-color: #fee2e2;
      color: #dc2626;
    }
    
    .no-results {
      text-align: center;
      padding: 20px;
      color: #6b7280;
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  roleFilter: string = '';
  searchTerm: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Añadir un método en AuthService para obtener todos los usuarios
    this.allUsers = this.authService.getAllUsersForAdmin();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allUsers];
    
    // Filtrar por rol
    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name ? user.name.toLowerCase().includes(term) : false || 
        user.email.toLowerCase().includes(term) ||
        String(user.id).toLowerCase().includes(term)
      );
    }
    
    this.filteredUsers = filtered;
  }

  getUserRoleText(role: string): string {
    switch (role) {
      case 'patient': return 'Paciente';
      case 'doctor': return 'Médico';
      case 'admin': return 'Administrador';
      default: return role;
    }
  }

  editUser(user: User): void {
    // Implementación de edición de usuario
    console.log('Editar usuario:', user);
    // Aquí podrías abrir un modal o navegar a una página de edición
  }

  deleteUser(userId: string | number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      // Convertir a string si es necesario antes de pasar al servicio
      const idToDelete = userId.toString();
      this.authService.deleteUser(idToDelete);
      this.loadUsers();
    }
  }

  // Para la conversión de id a string
  convertIdToString(user: User): string {
    return user.id ? user.id.toString() : '';
  }

  // Para el filtrado de búsqueda
  filterUsers(searchText: string) {
    if (!searchText) {
      this.filteredUsers = this.allUsers;
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user => {
      const nameLower = user.name ? user.name.toLowerCase() : '';
      const emailLower = user.email ? user.email.toLowerCase() : '';
      return nameLower.includes(searchLower) || emailLower.includes(searchLower);
    });
  }
}