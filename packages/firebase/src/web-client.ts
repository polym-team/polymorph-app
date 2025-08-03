import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase 설정 타입
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase 웹 클라이언트 클래스
export class FirebaseWebClient {
  private app: FirebaseApp;
  private analytics: Analytics | null;

  constructor(config: FirebaseWebConfig) {
    this.app = initializeApp(config);
    // 브라우저 환경에서만 Analytics 초기화
    this.analytics = (typeof globalThis !== 'undefined' && 'window' in globalThis)
      ? getAnalytics(this.app) 
      : null;
  }

  getApp(): FirebaseApp {
    return this.app;
  }

  getAnalytics(): Analytics | null {
    return this.analytics;
  }
} 