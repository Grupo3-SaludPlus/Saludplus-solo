import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/api.service';
@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component..html',
  styleUrls: ['./users-management.component..css']
})
export class UsersManagementComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  roleFilter: string = '';
  searchTerm: string = '';

  // ✅ NUEVO: Objeto para almacenar los datos del nuevo usuario
  newUserData: Partial<User> = {
    name: '',
    email: '',
    role: 'patient',
    phone: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    // Por ahora, crear usuarios de ejemplo hasta que tengamos la API funcionando
    this.allUsers = [
      {
        id: 1,
        name: 'Usuario Demo',
        email: 'demo@demo.com',
        role: 'patient' as 'patient',
        createdAt: new Date().toISOString()
      }
    ];
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

  deleteUser(userId: number | string) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      // Convertir a número si es string
      const idToDelete = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      // Filtrar el usuario de la lista local
      this.allUsers = this.allUsers.filter(user => {
        const currentId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        return currentId !== idToDelete;
      });
      
      this.applyFilters();
      console.log('Usuario eliminado:', idToDelete);
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

  // CORREGIR LÍNEA 174:
  createUser() {
    const newUser: User = {
      id: Date.now(),
      name: this.newUserData.name ?? '',
      email: this.newUserData.email ?? '',
      role: this.newUserData.role ?? 'patient',
      phone: this.newUserData.phone,
      createdAt: new Date().toISOString(), // ✅ AHORA SÍ EXISTE
      // ...otras propiedades...
    };
    
    // ...resto del código...
  }

  // ...resto del código...
}