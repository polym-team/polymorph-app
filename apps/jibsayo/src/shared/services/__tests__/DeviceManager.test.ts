import { generateDeviceId, isValidDeviceId } from '@/shared/lib/device';

describe('Device Management - 디바이스 관리 핵심 기능', () => {
  describe('디바이스 ID 생성', () => {
    it('타임스탬프와 랜덤 문자열을 포함한 유효한 ID를 생성해야 한다', () => {
      const deviceId = generateDeviceId();

      expect(deviceId).toMatch(/^device_\d+_[a-z0-9]+$/);
      expect(deviceId.length).toBeGreaterThan(20);
      expect(isValidDeviceId(deviceId)).toBe(true);
    });

    it('매번 다른 고유한 ID를 생성해야 한다', () => {
      const ids = Array.from({ length: 10 }, () => generateDeviceId());
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10); // 모든 ID가 고유함

      ids.forEach(id => {
        expect(id).toMatch(/^device_\d+_[a-z0-9]+$/);
        expect(isValidDeviceId(id)).toBe(true);
      });
    });

    it('생성된 ID는 비즈니스 요구사항을 만족해야 한다', () => {
      const deviceId = generateDeviceId();

      // 비즈니스 요구사항 검증
      expect(deviceId.startsWith('device_')).toBe(true);
      expect(deviceId.length).toBeLessThanOrEqual(100); // 최대 길이 제한
      expect(deviceId).not.toContain(' '); // 공백 없음
      expect(deviceId).not.toContain('..'); // 연속 특수문자 없음
    });
  });

  describe('디바이스 ID 유효성 검사', () => {
    it('유효한 ID는 true를 반환해야 한다', () => {
      const validIds = [
        'device_12345_abc123',
        'valid-device-id',
        'device123',
        'a',
        'simple-id-with-dashes',
      ];

      validIds.forEach(id => {
        expect(isValidDeviceId(id)).toBe(true);
      });
    });

    it('무효한 ID는 false를 반환해야 한다', () => {
      const invalidIds = [
        '', // 빈 문자열
        'a'.repeat(101), // 100자 초과
        null as any,
        undefined as any,
      ];

      invalidIds.forEach(id => {
        expect(isValidDeviceId(id)).toBe(false);
      });
    });

    it('생성된 모든 ID는 유효성 검사를 통과해야 한다', () => {
      // 많은 ID를 생성하여 모두 유효한지 확인
      for (let i = 0; i < 100; i++) {
        const deviceId = generateDeviceId();
        expect(isValidDeviceId(deviceId)).toBe(true);
      }
    });
  });

  describe('비즈니스 시나리오', () => {
    it('신규 사용자를 위한 디바이스 ID 생성 시나리오', () => {
      // 신규 사용자가 앱을 처음 실행할 때
      const deviceId = generateDeviceId();

      // 생성된 ID는 유효해야 함
      expect(isValidDeviceId(deviceId)).toBe(true);

      // ID 형식이 예상한 패턴과 일치해야 함
      expect(deviceId).toMatch(/^device_\d+_[a-z0-9]+$/);

      // 타임스탬프 부분이 현재 시간과 유사해야 함 (5초 이내)
      const timestampMatch = deviceId.match(/device_(\d+)_/);
      expect(timestampMatch).toBeTruthy();

      const timestamp = parseInt(timestampMatch![1]);
      const now = Date.now();
      expect(Math.abs(now - timestamp)).toBeLessThan(5000);
    });

    it('대량 사용자 처리 시나리오', () => {
      // 동시에 많은 사용자가 접속할 때 ID 충돌이 없어야 함
      const numUsers = 1000;
      const deviceIds = Array.from({ length: numUsers }, () =>
        generateDeviceId()
      );

      // 모든 ID가 고유해야 함
      const uniqueIds = new Set(deviceIds);
      expect(uniqueIds.size).toBe(numUsers);

      // 모든 ID가 유효해야 함
      deviceIds.forEach(id => {
        expect(isValidDeviceId(id)).toBe(true);
      });
    });

    it('ID 생성 성능 테스트', () => {
      const startTime = Date.now();

      // 많은 ID를 빠르게 생성
      for (let i = 0; i < 10000; i++) {
        const deviceId = generateDeviceId();
        expect(deviceId.length).toBeGreaterThan(0);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 10,000개 ID 생성이 5초 이내에 완료되어야 함
      expect(duration).toBeLessThan(5000);
    });
  });
});
