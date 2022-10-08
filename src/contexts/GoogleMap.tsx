import React from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export type GoogleMaps = typeof google.maps;

interface Context {
    googleMaps: Promise<GoogleMaps>;
}

const googleMaps = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY!,
    version: "weekly",
}).load().then(google => google.maps);

const GoogleMapContext = React.createContext<Context>({
    googleMaps,
});

export const useGoogleMapContext = () => React.useContext(GoogleMapContext);

const GoogleMapProvider: React.FC = (props) => {
    return (
        <GoogleMapContext.Provider value={{ googleMaps }}>
            {props.children}
        </GoogleMapContext.Provider>
    );

};

export default GoogleMapProvider;
