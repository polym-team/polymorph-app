'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  address: string;
  apartName: string;
}

export function KakaoMap({ address, apartName }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        `script[src^="//dapi.kakao.com/v2/maps/sdk.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);
    const geocoder = new window.kakao.maps.services.Geocoder();

    const searchAddress = `${address} ${apartName}`;

    geocoder.addressSearch(searchAddress, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        const marker = new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px 10px;font-size:12px;white-space:nowrap;">${apartName}</div>`,
        });

        infowindow.open(map, marker);
        map.setCenter(coords);
      } else {
        geocoder.addressSearch(address, (result2: any, status2: any) => {
          if (status2 === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result2[0].y,
              result2[0].x
            );

            const marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px 10px;font-size:12px;white-space:nowrap;">${apartName}</div>`,
            });

            infowindow.open(map, marker);
            map.setCenter(coords);
          }
        });
      }
    });
  }, [isLoaded, address, apartName]);

  return (
    <div className="overflow-hidden rounded border">
      <div
        ref={mapRef}
        className="h-[250px] w-full"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}
