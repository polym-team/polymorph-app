# 집사요 DB 스키마

## ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    regions ||--o{ apartments : "has"
    regions ||--o{ transactions : "has"
    apartments ||--o{ transactions : "has"

    regions {
        varchar region_code PK "지역 코드"
        varchar region_name "구/시 이름 (강동구, 하남시)"
        varchar sido_name "시/도 이름 (서울시, 경기도)"
        timestamp created_at
        timestamp updated_at
    }

    apartments {
        serial id PK "고유 ID"
        varchar region_code FK "지역 코드"
        varchar apart_code "아파트 코드"
        varchar apart_name "아파트 이름"
        varchar apart_type "단지 분류 (APT, MIX, ROW, URA, URM, URR, MLT)"
        varchar sale_type "분양 형태 (SALE, RENT, MIXED, COMP)"
        varchar building_structure "건물 형태 (STAIR, CORR, MIXED, ETC)"
        varchar heating_type "난방 방식 (IND, DIST, CENT, IND_ETC, ETC)"
        varchar jibun_addr "지번 주소"
        varchar doro_addr "도로명 주소"
        varchar constructor_company "시공사"
        varchar developer_company "시행사"
        integer completion_year "준공 연도"
        integer building_count "동 수"
        integer total_household_count "총 세대수"
        integer sale_household_count "분양 세대수"
        integer rent_household_count "임대 세대수"
        integer parking_count "주차 대수"
        integer ground_parking_count "지상 주차 대수"
        integer underground_parking_count "지하 주차 대수"
        integer ev_parking_count "전기차 충전 주차 대수"
        integer max_floor "최고 층수"
        text_array amenities "편의시설 목록"
        timestamp created_at
        timestamp updated_at
    }

    transactions {
        serial id PK "고유 ID"
        varchar region_code FK "지역 코드"
        integer apart_id FK "아파트 ID"
        date transaction_date "거래 날짜"
        integer transaction_amount "거래 금액 (만원)"
        decimal exclusive_area "전용 면적 (㎡)"
        integer floor "층"
        varchar building_dong "동"
        varchar estate_agent_region "중개사 소재지"
        date registration_date "등기 일자"
        varchar cancellation_type "해제 유형 (NONE, CANCELED)"
        date cancellation_date "해제 날짜"
        varchar deal_type "거래 유형 (DIRECT, AGENCY)"
        varchar seller_type "매도자 유형 (IND, CORP, PUBLIC, ETC)"
        varchar buyer_type "매수자 유형 (IND, CORP, PUBLIC, ETC)"
        boolean is_land_lease "토지임대부 여부"
        timestamp created_at
    }
```

## 코드 정의

### apart_type (단지 분류)
| 코드 | 설명 |
|------|------|
| APT | 아파트 |
| MIX | 주상복합 |
| ROW | 연립주택 |
| URA | 도시형 생활주택(아파트) |
| URM | 도시형 생활주택(주상복합) |
| URR | 도시형 생활주택(연립주택) |
| MLT | 다세대 |

### sale_type (분양 형태)
| 코드 | 설명 |
|------|------|
| SALE | 분양 |
| RENT | 임대 |
| MIXED | 혼합 |
| COMP | 사택 및 관사 |

### building_structure (건물 형태)
| 코드 | 설명 |
|------|------|
| STAIR | 계단식 |
| CORR | 복도식 |
| MIXED | 혼합식 |
| ETC | 기타 |

### heating_type (난방 방식)
| 코드 | 설명 |
|------|------|
| IND | 개별난방 |
| DIST | 지역난방 |
| CENT | 중앙난방 |
| IND_ETC | 개별난방+기타 |
| ETC | 기타 |

### deal_type (거래 유형)
| 코드 | 설명 |
|------|------|
| DIRECT | 직거래 |
| AGENCY | 중개거래 |

### seller_type / buyer_type (거래 주체)
| 코드 | 설명 |
|------|------|
| IND | 개인 |
| CORP | 법인 |
| PUBLIC | 공공기관 |
| ETC | 기타 |

### cancellation_type (해제 유형)
| 코드 | 설명 |
|------|------|
| NONE | 해당없음 |
| CANCELED | 해제 |

## 인덱스

```sql
-- apartments
CREATE INDEX idx_apartments_region ON apartments(region_code);
CREATE INDEX idx_apartments_name ON apartments(apart_name);

-- transactions
CREATE INDEX idx_transactions_region_date ON transactions(region_code, transaction_date DESC);
CREATE INDEX idx_transactions_apart_date ON transactions(apart_id, transaction_date DESC);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
```

## 제약조건

```sql
-- apartments: 지역 내 아파트 코드 유니크
UNIQUE(region_code, apart_code)

-- transactions: 동일 거래 중복 방지
UNIQUE(apart_id, transaction_date, exclusive_area, floor, building_dong, transaction_amount)
```
