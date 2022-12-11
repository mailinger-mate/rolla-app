import React from 'react';
import { IonSpinner } from '@ionic/react';

interface Props {
    small?: boolean;
}
const Spinner = React.memo<Props>(({
    small,
    ...rest
}) => {
    return (
        <IonSpinner
            {...rest}
            name={small ? 'lines-sharp-small' : 'lines-sharp'}
        />
    );
});

Spinner.displayName = 'Spinner';

export { Spinner };