import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        
        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMsg = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          errorMsg = `Código: ${error.status}, Mensaje: ${error.message}`;
        }
        
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}