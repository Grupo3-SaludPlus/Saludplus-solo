import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  // Almacenamiento en memoria para acceso rápido
  private dataStore: { [key: string]: any[] } = {};
  // Observables para componentes que necesiten suscribirse a cambios
  private dataSubjects: { [key: string]: BehaviorSubject<any[]> } = {};
  
  constructor() {
    // Inicializar datastores comunes al arrancar
    this.initDataStore('appointments');
    this.initDataStore('patients');
    this.initDataStore('doctors');
    this.initDataStore('medicalRecords');
  }
  
  // Inicializa un datastore específico
  private initDataStore(storeName: string): void {
    // Intentar cargar desde localStorage
    const storedData = localStorage.getItem(`saludplus_${storeName}`);
    this.dataStore[storeName] = storedData ? JSON.parse(storedData) : [];
    // Crear un BehaviorSubject para que los componentes puedan suscribirse
    this.dataSubjects[storeName] = new BehaviorSubject<any[]>(this.dataStore[storeName]);
  }
  
  // Obtiene todos los elementos de un store
  getAll(storeName: string): Observable<any[]> {
    if (!this.dataSubjects[storeName]) {
      this.initDataStore(storeName);
    }
    return this.dataSubjects[storeName].asObservable();
  }
  
  // Añade un elemento al store
  add(storeName: string, item: any): void {
    // Generar ID único si no existe
    if (!item.id) {
      item.id = this.generateId();
    }
    
    this.dataStore[storeName].push(item);
    this.updateStore(storeName);
  }
  
  // Actualiza un elemento
  update(storeName: string, item: any): void {
    const index = this.dataStore[storeName].findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.dataStore[storeName][index] = { ...this.dataStore[storeName][index], ...item };
      this.updateStore(storeName);
    }
  }
  
  // Elimina un elemento
  remove(storeName: string, id: string | number): void {
    this.dataStore[storeName] = this.dataStore[storeName].filter(i => i.id !== id);
    this.updateStore(storeName);
  }
  
  // Guardar en localStorage y notificar a suscriptores
  private updateStore(storeName: string): void {
    localStorage.setItem(`saludplus_${storeName}`, JSON.stringify(this.dataStore[storeName]));
    this.dataSubjects[storeName].next([...this.dataStore[storeName]]);
  }
  
  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Exportar a CSV
  exportToCSV(storeName: string): string {
    const data = this.dataStore[storeName];
    if (!data || !data.length) return '';
    
    // Obtener todas las claves únicas de todos los registros
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    const headers = Array.from(allKeys);
    
    // Crear fila de encabezados
    let csv = headers.join(',') + '\n';
    
    // Agregar filas de datos
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] !== undefined ? row[header] : '';
        // Escapar comillas y valores con comas
        return typeof value === 'string' ? 
          `"${value.replace(/"/g, '""')}"` : value.toString();
      });
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }
  
  // Descargar como CSV
  downloadCSV(storeName: string, filename: string): void {
    const csv = this.exportToCSV(storeName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Importar desde CSV
  importFromCSV(storeName: string, csvContent: string): void {
    const lines = csvContent.split('\n');
    if (lines.length <= 1) return;  // CSV vacío o solo encabezados
    
    const headers = this.parseCSVLine(lines[0]);
    
    const data = [];
    for(let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue; // Fila con formato incorrecto
      
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index].trim();
      });
      
      data.push(obj);
    }
    
    this.dataStore[storeName] = data;
    this.updateStore(storeName);
  }
  
  // Parsear línea CSV respetando comillas
  private parseCSVLine(line: string): string[] {
    const result = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Si ya estamos dentro de comillas y encontramos otra comilla
        if (insideQuotes && i < line.length - 1 && line[i+1] === '"') {
          // Comilla escapada (doble comilla)
          currentValue += '"';
          i++; // Saltar la siguiente comilla
        } else {
          // Alternar el estado de estar dentro/fuera de comillas
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // Encontramos un separador fuera de comillas
        result.push(currentValue);
        currentValue = '';
      } else {
        // Cualquier otro caracter, agregarlo al valor actual
        currentValue += char;
      }
    }
    
    // Agregar el último valor
    result.push(currentValue);
    return result;
  }
}