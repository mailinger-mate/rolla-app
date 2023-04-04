import React from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY!,
    libraries: ['geometry'],
    version: "weekly",
}).load().then(google => google.maps);

type Context = Promise<typeof google.maps>;

const GoogleMapContext = React.createContext<Context>(loader);

export const useGoogleMapContext = () => React.useContext(GoogleMapContext);

const GoogleMapProvider = React.memo(({ children }) => {
    // const [context, setContext] = React.useState<typeof google.maps | undefined>();

    // React.useEffect(() => {
    //     loader.then(googleMaps => {
    //         console.log('gMaps', googleMaps.version);
    //         setContext(googleMaps)
    //     });
    // }, []);

    return (
        <GoogleMapContext.Provider value={loader}>
            {children}
        </GoogleMapContext.Provider>
    );

});

export default GoogleMapProvider;
