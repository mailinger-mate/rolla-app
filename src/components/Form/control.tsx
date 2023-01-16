import { IonInput, IonItem, IonLabel, IonNote, IonToggle } from '@ionic/react';
import { Control, Controller, FieldError, FieldName, FieldValues, Path, UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";

interface Attributes<Form extends FieldValues> {
    control: Control<Form>;
    name: Path<Form>;
    onChange: (value: string) => void,
}

interface InputAttr {
    debounce?: number;
    label: string;
    type?: 'text' | 'number'
    step?: string;
    min?: number;
    max?: number;
}

export function input2<Form extends FieldValues>({
    control,
    label,
    name,
    type = 'text',
    onChange,
    ...attributes
}: Attributes<Form> & InputAttr) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                return (
                    <IonItem className={fieldState.error && 'ion-invalid'}>
                        <IonLabel color="medium">{label}</IonLabel>
                        <IonInput
                            {...attributes}
                            type={type}
                            value={field.value}
                            onIonChange={event => event.detail.value && onChange(event.detail.value)}
                        />
                    </IonItem>
                )
            }}
        />
    );
}

export function input<F extends FieldValues>(
    attributes: InputAttr,
    register: UseFormRegisterReturn<Path<F>>,
    error?: FieldError,
) {

    const {
        type = 'text',
        label,
        ...rest
    } = attributes;
    return (
        <IonItem className={error && 'ion-invalid'}>
            <IonLabel>{label}</IonLabel>
            <IonInput type={type || 'text'} {...rest} {...register} />
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
            <IonToggle slot="end" {...register} />
            {/* {error && <IonNote slot="error">{error.message || 'Required'}</IonNote>} */}
        </IonItem>
    )
}