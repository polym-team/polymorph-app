'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { useEffect, useRef, useState } from 'react';

import { ApartInfoType } from '../type';

declare global {
  interface Window {
    kakao: any;
  }
}

interface LocationInfoProps {
  data?: ApartInfoType;
}

export function LocationInfo({ data }: LocationInfoProps) {
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
    if (!isLoaded || !mapRef.current || !data?.dong || !data?.apartName) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);
    const places = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();

    const displayMarker = (coords: any) => {
      // 커스텀 마커 생성
      const marker = new window.kakao.maps.CustomOverlay({
        map: map,
        position: coords,
        content: `
          <div class="custom-marker" style="
            background: white;
            color: #333;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-width: 120px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="display: flex; align-items: center; justify-content: center;">
              <span>${data.apartName}</span>
            </div>
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid white;
            "></div>
          </div>
        `,
        yAnchor: 1,
      });

      // 커스텀 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="
            padding: 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid rgba(0, 0, 0, 0.08);
            min-width: 250px;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 8px solid white;
            "></div>
            
            <div style="margin-bottom: 12px;">
              <div style="
                font-weight: 700;
                font-size: 16px;
                color: #1a1a1a;
                margin-bottom: 4px;
                line-height: 1.3;
              ">
                ${data.apartName}
              </div>
              <div style="
                font-size: 13px;
                color: #666;
                line-height: 1.4;
                word-break: keep-all;
              ">
                ${data.dong}
              </div>
            </div>
            
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
              border-radius: 8px;
              border: 1px solid rgba(102, 126, 234, 0.1);
            ">
              <span style="font-size: 14px;">📍</span>
              <span style="
                font-size: 12px;
                color: #667eea;
                font-weight: 500;
              ">
                위치 정보
              </span>
            </div>
          </div>
        `,
        removable: true,
        zIndex: 1,
      });

      // 마커 클릭 이벤트 추가
      marker.addListener('click', () => {
        // 마커 위쪽에 인포윈도우 표시하기 위해 위치 조정
        const adjustedCoords = new window.kakao.maps.LatLng(
          coords.getLat() + 0.0005, // 위쪽으로 약간 이동
          coords.getLng()
        );
        infowindow.open(map, adjustedCoords);
        // 부드러운 이동 애니메이션
        map.panTo(coords);
      });

      map.setCenter(coords);
    };

    // 1차 시도: 키워드 검색 (가장 정확)
    const keywordSearch = `${data.dong} ${data.apartName}`;
    places.keywordSearch(keywordSearch, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        displayMarker(coords);
      } else {
        // 2차 시도: 주소 + 아파트명으로 주소 검색
        geocoder.addressSearch(keywordSearch, (result2: any, status2: any) => {
          if (status2 === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result2[0].y,
              result2[0].x
            );
            displayMarker(coords);
          } else {
            // 3차 시도: 주소만으로 검색
            geocoder.addressSearch(data.dong, (result3: any, status3: any) => {
              if (status3 === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(
                  result3[0].y,
                  result3[0].x
                );
                displayMarker(coords);
              }
            });
          }
        });
      }
    });
  }, [isLoaded, data]);

  if (!data) {
    return (
      <PageContainer className="p-0 lg:px-4 lg:pb-6 lg:pt-4" bgColor="white">
        <div className="overflow-hidden lg:rounded">
          <div className="aspect-[4/3] max-h-[450px] w-full animate-pulse bg-gray-200" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="p-0 lg:px-4 lg:pb-6 lg:pt-4" bgColor="white">
      <div className="overflow-hidden lg:rounded">
        <div ref={mapRef} className="aspect-[4/3] max-h-[450px] w-full" />
      </div>
    </PageContainer>
  );
}
