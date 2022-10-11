import { IonInput, IonItem, IonLabel, IonNote, IonToggle } from '@ionic/react';
import { FieldError, FieldValues, Path, UseFormRegisterReturn } from "react-hook-form";

export function input<F extends FieldValues>(
    label: string,
    register: UseFormRegisterReturn<Path<F>>,
    error?: FieldError,
) {
    return (
        <IonItem className={error && 'ion-invalid'}>
            <IonLabel>{label}</IonLabel>
            <IonInput type="text" {...register} />
            {error && <IonNote slot="error">{error.message || 'Required'}</IonNote>}
        </IonItem>
    )
}

export function toggle<F extends FieldValues>(
    label: string,
    register: UseFormRegisterReturn<Path<F>>,
    error?: FieldError,
) {
    return (
        <IonItem className={error && 'ion-invalid'}>
            <IonLabel>{label}</IonLabel>
            <IonToggle slot="end" {...register}  />
            {/* {error && <IonNote slot="error">{error.message || 'Required'}</IonNote>} */}
        </IonItem>
    )
}