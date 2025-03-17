import { 
    ChangeDetectionStrategy, 
    Component, 
    OnInit, 
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-tracking-codes',
    templateUrl: './tracking-codes.component.html',
    styles: [`
        :host {
            display: block;
        }
        .w-full {
            width: 100%;
        }
    `],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        MatPaginatorModule,
        MatTooltipModule
    ]
})
export class TrackingCodesComponent implements OnInit {
    // Usar BehaviorSubject para manejar la lista de dispositivos
    private _devicesSubject = new BehaviorSubject<any[]>([
        {
            deviceId: '528651571NT',
            deviceName: 'Morgan Page',
            edit: true,
            delete: true
        },
        {
            deviceId: '421436904YT',
            deviceName: 'Nita Hebert',
            edit: true,
            delete: true
        },
        {
            deviceId: '685377421YT',
            deviceName: 'Marsha Cham',
            edit: true,
            delete: true
        },
        {
            deviceId: '884960091RT',
            deviceName: 'Charmaine',
            edit: true,
            delete: true
        },
        {
            deviceId: '361402213NT',
            deviceName: 'Moura Carey',
            edit: true,
            delete: true
        }
    ]);

    // Observable para acceder a los dispositivos
    devices$: Observable<any[]> = this._devicesSubject.asObservable();

    // Observable para dispositivos paginados
    paginatedDevices$: Observable<any[]>;

    // Columnas a mostrar
    displayedColumns: string[] = ['deviceName', 'deviceId', 'actions'];
    pageSize = 10;
    pageIndex = 0;

    // Añadir la propiedad originalDeviceId
    originalDeviceId: string = '';

    // Código de persona
    personCode: string = 'CODPERNUNA325345';

    constructor(
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        // Configurar paginación reactiva
        this.paginatedDevices$ = this.devices$.pipe(
            map(devices => {
                const startIndex = this.pageIndex * this.pageSize;
                return devices.slice(startIndex, startIndex + this.pageSize);
            })
        );
    }

    ngOnInit(): void {}

    // Método para cambiar página
    onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        
        // Trigger change detection
        this.updateDevicesList();
    }

    // Método para agregar dispositivo
    addDevice(device: any): void {
        const currentDevices = this._devicesSubject.value;
        const newDevice = {
            ...device,
            deviceId: device.deviceId,
            edit: true,
            delete: true
        };

        const updatedDevices = [newDevice, ...currentDevices];
        this.updateDevicesList(updatedDevices);
    }

    // Método para actualizar dispositivo
    updateDevice(updatedDevice: any): void {
        const currentDevices = this._devicesSubject.value;
        const updatedDevices = currentDevices.map(device => 
            device.deviceId === this.originalDeviceId
                ? { 
                    ...device, 
                    deviceName: updatedDevice.deviceName,
                    deviceId: updatedDevice.deviceId
                } 
                : device
        );
        
        this.updateDevicesList(updatedDevices);
    }

    // Método para eliminar dispositivo
    deleteDevice(deviceId: string): void {
        const currentDevices = this._devicesSubject.value;
        const updatedDevices = currentDevices.filter(device => device.deviceId !== deviceId);
        
        this.updateDevicesList(updatedDevices);
    }

    // Método para actualizar la lista de dispositivos
    private updateDevicesList(devices?: any[]): void {
        if (devices) {
            this._devicesSubject.next(devices);
        } else {
            this._devicesSubject.next(this._devicesSubject.value);
        }
        this.cdr.detectChanges();
    }

    // Métodos de interacción
    openAddDeviceModal(): void {
        const dialogRef = this.dialog.open(AddDeviceModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: { mode: 'add' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addDevice(result);
            }
        });
    }

    editDevice(device: any): void {
        const dialogRef = this.dialog.open(AddDeviceModalComponent, {
            width: '600px',
            height: 'auto',
            disableClose: false,
            data: { 
                mode: 'edit',
                device: {...device} 
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.originalDeviceId = device.deviceId;
                this.updateDevice(result);
            }
        });
    }

    // Método para trackBy
    trackByDeviceId(index: number, device: any): string {
        return device.deviceId;
    }

    // Método para generar un nuevo código de persona
    generateNewPersonCode(): void {
        // Generar un nuevo código con el mismo formato
        const prefix = 'CODPERNUNA';
        const randomNumber = this.generateRandomNumber();
        this.personCode = `${prefix}${randomNumber}`;
    }

    // Método para generar número aleatorio
    private generateRandomNumber(): string {
        // Generar un número aleatorio de 6 dígitos
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

@Component({
    selector: 'add-device-modal',
    template: `
    <div class="p-6">
        <h2 mat-dialog-title class="text-center text-2xl font-bold uppercase mb-4">
            {{ isEditing ? 'ACTUALIZAR DISPOSITIVO' : 'AGREGAR DISPOSITIVO' }}
        </h2>
        
        <mat-dialog-content>
            <p class="text-center mb-6 text-sm text-secondary">
                Vincula tu dispositivo para poder utilizar todas las funciones de seguridad de Maypi. 
                Asegúrate de ingresar correctamente el nombre y código del dispositivo.
            </p>

            <form #deviceForm="ngForm">
                <div class="grid grid-cols-1 gap-4">
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Nombre Dispositivo</mat-label>
                        <input 
                            matInput 
                            [(ngModel)]="device.deviceName" 
                            name="deviceName" 
                            placeholder="Ingrese nombre del dispositivo"
                            required
                            #deviceNameInput="ngModel"
                        >
                        <mat-error *ngIf="deviceNameInput.invalid && (deviceNameInput.dirty || deviceNameInput.touched)">
                            El nombre del dispositivo es requerido
                        </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Código Dispositivo</mat-label>
                        <input 
                            matInput 
                            [(ngModel)]="device.deviceId" 
                            name="deviceId" 
                            placeholder="Ingrese código del dispositivo"
                            required
                            #deviceIdInput="ngModel"
                        >
                        <mat-error *ngIf="deviceIdInput.invalid && (deviceIdInput.dirty || deviceIdInput.touched)">
                            El código del dispositivo es requerido
                        </mat-error>
                    </mat-form-field>
                </div>
            </form>
        </mat-dialog-content>

        <mat-dialog-actions class="flex justify-center">
            <button 
                mat-flat-button 
                color="primary" 
                (click)="onSave()"
                class="w-full rounded-none"
                [disabled]="!deviceForm.form.valid">
                {{ isEditing ? 'Actualizar Dispositivo' : 'Vincular Dispositivo' }}
            </button>
        </mat-dialog-actions>
    </div>
    `,
    styles: [`
        .mat-mdc-dialog-content {
            padding: 0 24px !important;
        }
        .mat-mdc-dialog-actions {
            padding: 24px !important;
            padding-top: 0 !important;
        }
    `],
    standalone: true,
    imports: [
        MatDialogModule, 
        MatInputModule, 
        FormsModule,
        MatFormFieldModule,
        CommonModule,
        MatButtonModule
    ]
})
export class AddDeviceModalComponent {
    device: any = {
        deviceName: '',
        deviceId: ''
    };
    isEditing: boolean = false;
    originalDeviceId: string = '';

    constructor(
        public dialogRef: MatDialogRef<AddDeviceModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // Configurar el modo (agregar o editar)
        if (data && data.mode === 'edit' && data.device) {
            this.device = {...data.device};
            this.originalDeviceId = data.device.deviceId;
            this.isEditing = true;
        }
    }

    onSave(): void {
        // Validación adicional
        if (this.device.deviceName && this.device.deviceId) {
            // Permitir la actualización del código del dispositivo
            const deviceToSave = {
                deviceName: this.device.deviceName,
                deviceId: this.device.deviceId
            };

            this.dialogRef.close(deviceToSave);
        }
    }
} 