import React from 'react';
import { IonItem, IonLabel, IonInput, IonText } from '@ionic/react';
import { Controller, Control, UseControllerProps, useController } from 'react-hook-form';

// interface Props {
//     name: string;
//     control?: Control;
//     label?: string;
//     // component?: JSX.Element;
//     // errors?: NestDataObject<Record<string, any>, FieldError>;
// }

const Input: React.FC<UseControllerProps> = (props) => {
    const { field, fieldState } = useController(props);
    const { name } = field;
    return (
        <>
            <IonItem>
                {/* {label && <IonLabel position="floating">{label}</IonLabel>} */}
                <Controller
                    render={(field) => (
                            <IonInput
                                aria-invalid={field.fieldState.error ? "true" : "false"}
                                aria-describedby={`${name}Error`}
                            />
                        )
                    }
                    name={name}
                    // control={control}
                    // onChangeName="onIonChange"
                />
            </IonItem>
            {fieldState.error && (
                <IonText color="danger" className="ion-padding-start">
                    <small>
                        <span role="alert" id={`${name}Error`}>
                            {fieldState.error.message}
                        </span>
                    </small>
                </IonText>
            )}
        </>
    );
};

export default Input;