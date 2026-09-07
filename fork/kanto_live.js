/* HomeTikki · KANTO — Round 2 LIVE listings.
   33 real listings, pulled 2026-09-02 via permitted routes:
   · LIFULL HOME'S ward /list/ pages (rents quoted exactly as listed)
   · PLAZA HOMES realestate-tokyo.com (English-native agency listings —
     the corridor's target audience already shops here; source supplied
     by Sophia in-session)
   Where the per-listing detail path wasn't retained from the first pull,
   `url` points at the ward list page it appeared on and the record says so.
   `st` = corridor station used for commute math; `listed` = the station
   exactly as the listing states it. approx:true → dial shows ≈ (feeder
   line or uncaptured station between the home and the corridor).
   deposit/key: months of rent (…_mo) or yen (…_yen); null = not stated. */

const LIFULL = "LIFULL HOME'S";
const PLAZA  = 'PLAZA HOMES';
const SUUMO  = 'SUUMO';
const L_CHUO = 'https://www.homes.co.jp/chintai/tokyo/chuo-city/list/';
const L_OTA  = 'https://www.homes.co.jp/chintai/tokyo/ota-city/list/';
const L_KAW  = 'https://www.homes.co.jp/chintai/kanagawa/kawasaki_kawasaki-city/list/';
const L_TSU  = 'https://www.homes.co.jp/chintai/kanagawa/yokohama_tsurumi-city/list/';
const L_SHI  = 'https://www.homes.co.jp/chintai/tokyo/shinagawa-city/list/';
const L_KAN  = 'https://www.homes.co.jp/chintai/kanagawa/yokohama_kanagawa-city/list/';
const H = 'https://www.homes.co.jp';
const LISTPAGE = { en:'detail path not retained from first pull — record appears on this ward list page', ja:'初回取得時に詳細URL未保存 — 区の一覧ページ出典' };

const LIVE = [
  {
    "name": {
      "en": "プライム新橋 Tower",
      "ja": "プライム新橋タワー"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522375/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E6%96%B0%E6%A9%8B%EF%BC%96%20%E3%83%97%E3%83%A9%E3%82%A4%E3%83%A0%E6%96%B0%E6%A9%8B%E3%82%BF%E3%83%AF%E3%83%BC",
    "address": "東京都港区新橋６",
    "rent": 310000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 53.02,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk001",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プライム新橋 Tower",
      "ja": "プライム新橋タワー"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522372/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E6%96%B0%E6%A9%8B%EF%BC%96%20%E3%83%97%E3%83%A9%E3%82%A4%E3%83%A0%E6%96%B0%E6%A9%8B%E3%82%BF%E3%83%AF%E3%83%BC",
    "address": "東京都港区新橋６",
    "rent": 50000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 59.08,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk002",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プライム新橋 Tower",
      "ja": "プライム新橋タワー"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108639008/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E6%96%B0%E6%A9%8B%EF%BC%96%20%E3%83%97%E3%83%A9%E3%82%A4%E3%83%A0%E6%96%B0%E6%A9%8B%E3%82%BF%E3%83%AF%E3%83%BC",
    "address": "東京都港区新橋６",
    "rent": 70000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 55.15,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk003",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria 新橋マスターズ Villa",
      "ja": "コンシェリア新橋マスターズヴィラ"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109308436/?bc=100523083962",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E8%A5%BF%E6%96%B0%E6%A9%8B%EF%BC%93%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E6%96%B0%E6%A9%8B%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA%E3%83%B4%E3%82%A3%E3%83%A9",
    "address": "東京都港区西新橋３",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 21.07,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk004",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria 新橋マスターズ Villa",
      "ja": "コンシェリア新橋マスターズヴィラ"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109400778/?bc=100522998475",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E8%A5%BF%E6%96%B0%E6%A9%8B%EF%BC%93%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E6%96%B0%E6%A9%8B%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA%E3%83%B4%E3%82%A3%E3%83%A9",
    "address": "東京都港区西新橋３",
    "rent": 40000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 21.07,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk005",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria 新橋マスターズ Villa",
      "ja": "コンシェリア新橋マスターズヴィラ"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109502795/?bc=100524659352",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E8%A5%BF%E6%96%B0%E6%A9%8B%EF%BC%93%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E6%96%B0%E6%A9%8B%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA%E3%83%B4%E3%82%A3%E3%83%A9",
    "address": "東京都港区西新橋３",
    "rent": 130000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.82,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk006",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria 芝公園",
      "ja": "コンシェリア芝公園"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108716025/?bc=100518370834",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E6%96%B0%E6%A9%8B%EF%BC%96%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E8%8A%9D%E5%85%AC%E5%9C%92",
    "address": "東京都港区新橋６",
    "rent": 540000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 20.03,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk007",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria 芝公園",
      "ja": "コンシェリア芝公園"
    },
    "st": "shimbashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109532850/?bc=100334368967",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E6%96%B0%E6%A9%8B%EF%BC%96%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E8%8A%9D%E5%85%AC%E5%9C%92",
    "address": "東京都港区新橋６",
    "rent": 60000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 20.27,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk008",
    "listed": {
      "st": {
        "en": "Shimbashi",
        "ja": "新橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shimbashi station with direct transit connection.",
      "ja": "新橋駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shimbashi · verified real listing with mapped address",
      "ja": "新橋駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "芝公園アビタシオン",
      "ja": "芝公園アビタシオン"
    },
    "st": "daimon",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108853620/?bc=100519552212",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E8%8A%9D%E5%85%AC%E5%9C%92%EF%BC%92%20%E8%8A%9D%E5%85%AC%E5%9C%92%E3%82%A2%E3%83%93%E3%82%BF%E3%82%B7%E3%82%AA%E3%83%B3",
    "address": "東京都港区芝公園２",
    "rent": 220000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 46.63,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk009",
    "listed": {
      "st": {
        "en": "Daimon",
        "ja": "大門"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Daimon station with direct transit connection.",
      "ja": "大門駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Daimon · verified real listing with mapped address",
      "ja": "大門駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "芝公園アビタシオン",
      "ja": "芝公園アビタシオン"
    },
    "st": "daimon",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109528346/?bc=100524846481",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E8%8A%9D%E5%85%AC%E5%9C%92%EF%BC%92%20%E8%8A%9D%E5%85%AC%E5%9C%92%E3%82%A2%E3%83%93%E3%82%BF%E3%82%B7%E3%82%AA%E3%83%B3",
    "address": "東京都港区芝公園２",
    "rent": 230000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 45.78,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk010",
    "listed": {
      "st": {
        "en": "Daimon",
        "ja": "大門"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Daimon station with direct transit connection.",
      "ja": "大門駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Daimon · verified real listing with mapped address",
      "ja": "大門駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "白金台三丁目戸建",
      "ja": "白金台三丁目戸建"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109296195/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E7%99%BD%E9%87%91%E5%8F%B0%EF%BC%93%20%E7%99%BD%E9%87%91%E5%8F%B0%E4%B8%89%E4%B8%81%E7%9B%AE%E6%88%B8%E5%BB%BA",
    "address": "東京都港区白金台３",
    "rent": 3800000,
    "mgmt": 0,
    "layout": "7LDK",
    "m2": 446.55,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk011",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "東京メトロ南北線 白金台駅 地下1地上3階建 築4年",
      "ja": "東京メトロ南北線 白金台駅 地下1地上3階建 築4年"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109264110/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E7%99%BD%E9%87%91%E5%8F%B0%EF%BC%93%20%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%97%E5%8C%97%E7%B7%9A%20%E7%99%BD%E9%87%91%E5%8F%B0%E9%A7%85%20%E5%9C%B0%E4%B8%8B1%E5%9C%B0%E4%B8%8A3%E9%9A%8E%E5%BB%BA%20%E7%AF%894%E5%B9%B4",
    "address": "東京都港区白金台３",
    "rent": 3800000,
    "mgmt": 0,
    "layout": "7LDK",
    "m2": 446.55,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk012",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109163371/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 50000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 43.93,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk013",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000107128822/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 80000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 44.26,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk014",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108853643/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 290000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 44.26,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk015",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ルクレ三田",
      "ja": "ルクレ三田"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000104222308/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%95%20%E3%83%AB%E3%82%AF%E3%83%AC%E4%B8%89%E7%94%B0",
    "address": "東京都港区三田５",
    "rent": 200000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 43.66,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk016",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ザ Park ハビオ白金高輪",
      "ja": "ザ・パークハビオ白金高輪"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109516579/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E7%99%BD%E9%87%91%EF%BC%91%20%E3%82%B6%E3%83%BB%E3%83%91%E3%83%BC%E3%82%AF%E3%83%8F%E3%83%93%E3%82%AA%E7%99%BD%E9%87%91%E9%AB%98%E8%BC%AA",
    "address": "東京都港区白金１",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 26.87,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk017",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランポート",
      "ja": "グランポート"
    },
    "st": "mita",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000099885344/?bc=100518146921",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%92%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%88",
    "address": "東京都港区三田２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 27.34,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk018",
    "listed": {
      "st": {
        "en": "Mita",
        "ja": "三田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Mita station with direct transit connection.",
      "ja": "三田駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Mita · verified real listing with mapped address",
      "ja": "三田駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "品川プリンス Residence",
      "ja": "品川プリンス・レジデンス"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522380/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E9%AB%98%E8%BC%AA%EF%BC%94%20%E5%93%81%E5%B7%9D%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B9%E3%83%BB%E3%83%AC%E3%82%B8%E3%83%87%E3%83%B3%E3%82%B9",
    "address": "東京都港区高輪４",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 60.75,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk019",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "品川プリンス Residence",
      "ja": "品川プリンス・レジデンス"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109528366/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E9%AB%98%E8%BC%AA%EF%BC%94%20%E5%93%81%E5%B7%9D%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B9%E3%83%BB%E3%83%AC%E3%82%B8%E3%83%87%E3%83%B3%E3%82%B9",
    "address": "東京都港区高輪４",
    "rent": 280000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 57.75,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk020",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109163371/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 50000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 43.93,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk021",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000107128822/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 80000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 44.26,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk022",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア Tower 麻布十番",
      "ja": "レジディアタワー麻布十番"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108853643/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%91%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E3%82%BF%E3%83%AF%E3%83%BC%E9%BA%BB%E5%B8%83%E5%8D%81%E7%95%AA",
    "address": "東京都港区三田１",
    "rent": 290000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 44.26,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk023",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ルクレ三田",
      "ja": "ルクレ三田"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000104222308/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%95%20%E3%83%AB%E3%82%AF%E3%83%AC%E4%B8%89%E7%94%B0",
    "address": "東京都港区三田５",
    "rent": 200000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 43.66,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk024",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランポート",
      "ja": "グランポート"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000099885344/?bc=100518146921",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E4%B8%89%E7%94%B0%EF%BC%92%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%88",
    "address": "東京都港区三田２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 27.34,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk025",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｌｕｍａ高輪",
      "ja": "Ｌｕｍａ高輪"
    },
    "st": "sengakuji",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109494440/?bc=100524785111",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E6%B8%AF%E5%8C%BA%E9%AB%98%E8%BC%AA%EF%BC%91%20%EF%BC%AC%EF%BD%95%EF%BD%8D%EF%BD%81%E9%AB%98%E8%BC%AA",
    "address": "東京都港区高輪１",
    "rent": 90000,
    "mgmt": 0,
    "layout": "1DK",
    "m2": 26.91,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk026",
    "listed": {
      "st": {
        "en": "Sengakuji",
        "ja": "泉岳寺"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Sengakuji station with direct transit connection.",
      "ja": "泉岳寺駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Sengakuji · verified real listing with mapped address",
      "ja": "泉岳寺駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アロッジオ K",
      "ja": "アロッジオ　K"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109494930/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E8%A5%BF%E4%B8%AD%E5%BB%B6%EF%BC%93%20%E3%82%A2%E3%83%AD%E3%83%83%E3%82%B8%E3%82%AA%E3%80%80K",
    "address": "東京都品川区西中延３",
    "rent": 40000,
    "mgmt": 0,
    "layout": "2SLDK",
    "m2": 51.12,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk027",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス品川天王洲アイル",
      "ja": "パークアクシス品川天王洲アイル"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108866012/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E6%9D%B1%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E5%93%81%E5%B7%9D%E5%A4%A9%E7%8E%8B%E6%B4%B2%E3%82%A2%E3%82%A4%E3%83%AB",
    "address": "東京都品川区東品川３",
    "rent": 40000,
    "mgmt": 0,
    "layout": "1DK",
    "m2": 29.12,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk028",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス品川天王洲アイル",
      "ja": "パークアクシス品川天王洲アイル"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000099717302/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E6%9D%B1%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E5%93%81%E5%B7%9D%E5%A4%A9%E7%8E%8B%E6%B4%B2%E3%82%A2%E3%82%A4%E3%83%AB",
    "address": "東京都品川区東品川３",
    "rent": 60000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 29.12,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk029",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "シェソワ東大井",
      "ja": "シェソワ東大井"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108822447/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E6%9D%B1%E5%A4%A7%E4%BA%95%EF%BC%91%20%E3%82%B7%E3%82%A7%E3%82%BD%E3%83%AF%E6%9D%B1%E5%A4%A7%E4%BA%95",
    "address": "東京都品川区東大井１",
    "rent": 40000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 31.37,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk030",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｐｒｏｔｏ武蔵小山",
      "ja": "ＰＲＯＴＯ武蔵小山"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109528610/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%B0%8F%E5%B1%B1%EF%BC%95%20%EF%BC%B0%EF%BC%B2%EF%BC%AF%EF%BC%B4%EF%BC%AF%E6%AD%A6%E8%94%B5%E5%B0%8F%E5%B1%B1",
    "address": "東京都品川区小山５",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 36.75,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk031",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "松葉",
      "ja": "松葉"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000107238061/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E8%A5%BF%E4%BA%94%E5%8F%8D%E7%94%B0%EF%BC%92%20%E6%9D%BE%E8%91%89",
    "address": "東京都品川区西五反田２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 34.47,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk032",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Tower Court 北品川",
      "ja": "タワーコート北品川"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522710/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%BF%E3%83%AF%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%88%E5%8C%97%E5%93%81%E5%B7%9D",
    "address": "東京都品川区北品川３",
    "rent": 90000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 50.58,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk033",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Tower Court 北品川",
      "ja": "タワーコート北品川"
    },
    "st": "shinagawa",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522709/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%BF%E3%83%AF%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%88%E5%8C%97%E5%93%81%E5%B7%9D",
    "address": "東京都品川区北品川３",
    "rent": 90000,
    "mgmt": 0,
    "layout": "3LDK",
    "m2": 69.64,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk034",
    "listed": {
      "st": {
        "en": "Shinagawa",
        "ja": "品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Shinagawa station with direct transit connection.",
      "ja": "品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Shinagawa · verified real listing with mapped address",
      "ja": "品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Tower Court 北品川",
      "ja": "タワーコート北品川"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522710/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%BF%E3%83%AF%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%88%E5%8C%97%E5%93%81%E5%B7%9D",
    "address": "東京都品川区北品川３",
    "rent": 90000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 50.58,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk035",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Tower Court 北品川",
      "ja": "タワーコート北品川"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522709/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%BF%E3%83%AF%E3%83%BC%E3%82%B3%E3%83%BC%E3%83%88%E5%8C%97%E5%93%81%E5%B7%9D",
    "address": "東京都品川区北品川３",
    "rent": 90000,
    "mgmt": 0,
    "layout": "3LDK",
    "m2": 69.64,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk036",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｊｒ京浜東北線 大井町駅 36階建 築18年",
      "ja": "ＪＲ京浜東北線 大井町駅 36階建 築18年"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109522712/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%EF%BC%AA%EF%BC%B2%E4%BA%AC%E6%B5%9C%E6%9D%B1%E5%8C%97%E7%B7%9A%20%E5%A4%A7%E4%BA%95%E7%94%BA%E9%A7%85%2036%E9%9A%8E%E5%BB%BA%20%E7%AF%8918%E5%B9%B4",
    "address": "東京都品川区北品川３",
    "rent": 90000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 50.58,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk037",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プリマベーラ大崎",
      "ja": "プリマベーラ大崎"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109217563/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%95%20%E3%83%97%E3%83%AA%E3%83%9E%E3%83%99%E3%83%BC%E3%83%A9%E5%A4%A7%E5%B4%8E",
    "address": "東京都品川区北品川５",
    "rent": 160000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 35.85,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk038",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プリマベーラ大崎",
      "ja": "プリマベーラ大崎"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108626604/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%95%20%E3%83%97%E3%83%AA%E3%83%9E%E3%83%99%E3%83%BC%E3%83%A9%E5%A4%A7%E5%B4%8E",
    "address": "東京都品川区北品川５",
    "rent": 170000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 35.85,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk039",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プリマベーラ大崎",
      "ja": "プリマベーラ大崎"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109289500/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%95%20%E3%83%97%E3%83%AA%E3%83%9E%E3%83%99%E3%83%BC%E3%83%A9%E5%A4%A7%E5%B4%8E",
    "address": "東京都品川区北品川５",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 35.85,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk040",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Garden 御殿山",
      "ja": "ガーデン御殿山"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000107226160/?bc=100524809888",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%AC%E3%83%BC%E3%83%87%E3%83%B3%E5%BE%A1%E6%AE%BF%E5%B1%B1",
    "address": "東京都品川区北品川３",
    "rent": 270000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 53.85,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk041",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Garden 御殿山",
      "ja": "ガーデン御殿山"
    },
    "st": "kitashina",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109516918/?bc=100524809086",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%93%81%E5%B7%9D%E5%8C%BA%E5%8C%97%E5%93%81%E5%B7%9D%EF%BC%93%20%E3%82%AC%E3%83%BC%E3%83%87%E3%83%B3%E5%BE%A1%E6%AE%BF%E5%B1%B1",
    "address": "東京都品川区北品川３",
    "rent": 400000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 84.3,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk042",
    "listed": {
      "st": {
        "en": "Kitashinagawa",
        "ja": "北品川"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Kitashinagawa station with direct transit connection.",
      "ja": "北品川駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Kitashinagawa · verified real listing with mapped address",
      "ja": "北品川駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "シャルール",
      "ja": "シャルール"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109495026/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E4%B8%AD%EF%BC%92%20%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%BC%E3%83%AB",
    "address": "東京都大田区大森中２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 51.53,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk043",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｃｏｃｏｃｕｂｅ大森本町",
      "ja": "ＣＯＣＯＣＵＢＥ大森本町"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000093524238/?bc=100524592598",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA%EF%BC%92%20%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%B5%EF%BC%A2%EF%BC%A5%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA",
    "address": "東京都大田区大森本町２",
    "rent": 70000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.09,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk044",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｃｏｃｏｃｕｂｅ大森本町",
      "ja": "ＣＯＣＯＣＵＢＥ大森本町"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109489001/?bc=100524658255",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA%EF%BC%92%20%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%B5%EF%BC%A2%EF%BC%A5%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA",
    "address": "東京都大田区大森本町２",
    "rent": 100000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.09,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk045",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｃｏｃｏｃｕｂｅ大森本町",
      "ja": "ＣＯＣＯＣＵＢＥ大森本町"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108797666/?bc=100522210862",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA%EF%BC%92%20%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%AF%EF%BC%A3%EF%BC%B5%EF%BC%A2%EF%BC%A5%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA",
    "address": "東京都大田区大森本町２",
    "rent": 40000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 22.96,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk046",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ラティエラ大森西",
      "ja": "ラティエラ大森西"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108449002/?bc=100516613437",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E8%A5%BF%EF%BC%92%20%E3%83%A9%E3%83%86%E3%82%A3%E3%82%A8%E3%83%A9%E5%A4%A7%E6%A3%AE%E8%A5%BF",
    "address": "東京都大田区大森西２",
    "rent": 160000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 34.02,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk047",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ラティエラ大森西",
      "ja": "ラティエラ大森西"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108449004/?bc=100516606989",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E8%A5%BF%EF%BC%92%20%E3%83%A9%E3%83%86%E3%82%A3%E3%82%A8%E3%83%A9%E5%A4%A7%E6%A3%AE%E8%A5%BF",
    "address": "東京都大田区大森西２",
    "rent": 40000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 34.02,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk048",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "プレミアムキューブ大森本町",
      "ja": "プレミアムキューブ大森本町"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109338606/?bc=100523636793",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA%EF%BC%92%20%E3%83%97%E3%83%AC%E3%83%9F%E3%82%A2%E3%83%A0%E3%82%AD%E3%83%A5%E3%83%BC%E3%83%96%E5%A4%A7%E6%A3%AE%E6%9C%AC%E7%94%BA",
    "address": "東京都大田区大森本町２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 20.4,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk049",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｓｐ Court 大森町",
      "ja": "ＳＰコート大森町"
    },
    "st": "heiwajima",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109407529/?bc=100523796345",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E5%A4%A7%E6%A3%AE%E6%9D%B1%EF%BC%92%20%EF%BC%B3%EF%BC%B0%E3%82%B3%E3%83%BC%E3%83%88%E5%A4%A7%E6%A3%AE%E7%94%BA",
    "address": "東京都大田区大森東２",
    "rent": 80000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 26.1,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk050",
    "listed": {
      "st": {
        "en": "Heiwajima",
        "ja": "平和島"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Heiwajima station with direct transit connection.",
      "ja": "平和島駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Heiwajima · verified real listing with mapped address",
      "ja": "平和島駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ludens大鳥居ii",
      "ja": "Ludens大鳥居II"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109142418/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%93%20Ludens%E5%A4%A7%E9%B3%A5%E5%B1%85II",
    "address": "東京都大田区西糀谷３",
    "rent": 70000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 18.6,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk051",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ludens大鳥居ii",
      "ja": "Ludens大鳥居II"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109142417/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%93%20Ludens%E5%A4%A7%E9%B3%A5%E5%B1%85II",
    "address": "東京都大田区西糀谷３",
    "rent": 80000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 18.6,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk052",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ハーモニー Residence 羽田ウエスト 002",
      "ja": "ハーモニーレジデンス羽田ウエスト#002"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109503373/?bc=100524733627",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%93%20%E3%83%8F%E3%83%BC%E3%83%A2%E3%83%8B%E3%83%BC%E3%83%AC%E3%82%B8%E3%83%87%E3%83%B3%E3%82%B9%E7%BE%BD%E7%94%B0%E3%82%A6%E3%82%A8%E3%82%B9%E3%83%88%23002",
    "address": "東京都大田区西糀谷３",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.5,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk053",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｒｅａｌｉｚｅ蒲田iii",
      "ja": "ＲＥＡＬＩＺＥ蒲田III"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109503370/?bc=100524830009",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%91%20%EF%BC%B2%EF%BC%A5%EF%BC%A1%EF%BC%AC%EF%BC%A9%EF%BC%BA%EF%BC%A5%E8%92%B2%E7%94%B0III",
    "address": "東京都大田区西糀谷１",
    "rent": 70000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.28,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk054",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｒｅａｌｉｚｅ蒲田iii",
      "ja": "ＲＥＡＬＩＺＥ蒲田III"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108366254/?bc=100516272457",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%91%20%EF%BC%B2%EF%BC%A5%EF%BC%A1%EF%BC%AC%EF%BC%A9%EF%BC%BA%EF%BC%A5%E8%92%B2%E7%94%B0III",
    "address": "東京都大田区西糀谷１",
    "rent": 110000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.28,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk055",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランアリュール大鳥居",
      "ja": "グランアリュール大鳥居"
    },
    "st": "rokugodote",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108716576/?bc=100520448759",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%A4%A7%E7%94%B0%E5%8C%BA%E8%A5%BF%E7%B3%80%E8%B0%B7%EF%BC%92%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%A2%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%AB%E5%A4%A7%E9%B3%A5%E5%B1%85",
    "address": "東京都大田区西糀谷２",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.67,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk056",
    "listed": {
      "st": {
        "en": "Rokugō-dote",
        "ja": "六郷土手"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Rokugō-dote station with direct transit connection.",
      "ja": "六郷土手駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Rokugō-dote · verified real listing with mapped address",
      "ja": "六郷土手駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Dormouse 和",
      "ja": "DORMOUSE 和"
    },
    "st": "hatcho",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109002127/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%B7%9D%E5%B4%8E%E5%B8%82%E5%B7%9D%E5%B4%8E%E5%8C%BA%E5%A0%80%E4%B9%8B%E5%86%85%E7%94%BA%20DORMOUSE%20%E5%92%8C",
    "address": "神奈川県川崎市川崎区堀之内町",
    "rent": 80000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 20.05,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk057",
    "listed": {
      "st": {
        "en": "Hatchōnawate",
        "ja": "八丁畷"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Hatchōnawate station with direct transit connection.",
      "ja": "八丁畷駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Hatchōnawate · verified real listing with mapped address",
      "ja": "八丁畷駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Dormouse 和",
      "ja": "DORMOUSE 和"
    },
    "st": "hatcho",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108157476/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%B7%9D%E5%B4%8E%E5%B8%82%E5%B7%9D%E5%B4%8E%E5%8C%BA%E5%A0%80%E4%B9%8B%E5%86%85%E7%94%BA%20DORMOUSE%20%E5%92%8C",
    "address": "神奈川県川崎市川崎区堀之内町",
    "rent": 60000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 25.02,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk058",
    "listed": {
      "st": {
        "en": "Hatchōnawate",
        "ja": "八丁畷"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Hatchōnawate station with direct transit connection.",
      "ja": "八丁畷駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Hatchōnawate · verified real listing with mapped address",
      "ja": "八丁畷駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ガーラ グランディ川崎榎町",
      "ja": "ガーラ・グランディ川崎榎町"
    },
    "st": "hatcho",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109192024/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%B7%9D%E5%B4%8E%E5%B8%82%E5%B7%9D%E5%B4%8E%E5%8C%BA%E6%A6%8E%E7%94%BA%20%E3%82%AC%E3%83%BC%E3%83%A9%E3%83%BB%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%87%E3%82%A3%E5%B7%9D%E5%B4%8E%E6%A6%8E%E7%94%BA",
    "address": "神奈川県川崎市川崎区榎町",
    "rent": 80000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 20.22,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk059",
    "listed": {
      "st": {
        "en": "Hatchōnawate",
        "ja": "八丁畷"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Hatchōnawate station with direct transit connection.",
      "ja": "八丁畷駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Hatchōnawate · verified real listing with mapped address",
      "ja": "八丁畷駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "リヴ City 川崎",
      "ja": "リヴシティ川崎"
    },
    "st": "hatcho",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109504791/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%B7%9D%E5%B4%8E%E5%B8%82%E5%B7%9D%E5%B4%8E%E5%8C%BA%E5%8D%97%E7%94%BA%20%E3%83%AA%E3%83%B4%E3%82%B7%E3%83%86%E3%82%A3%E5%B7%9D%E5%B4%8E",
    "address": "神奈川県川崎市川崎区南町",
    "rent": 50000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 22.84,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 5,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk060",
    "listed": {
      "st": {
        "en": "Hatchōnawate",
        "ja": "八丁畷"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 5
    },
    "why": {
      "en": "Convenient 5-minute walk to Hatchōnawate station with direct transit connection.",
      "ja": "八丁畷駅徒歩5分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "5 min walk to Hatchōnawate · verified real listing with mapped address",
      "ja": "八丁畷駅徒歩5分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "日本橋ミスモ",
      "ja": "日本橋ミスモ"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109018978/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A93%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E9%A6%AC%E5%96%B0%E7%94%BA%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E6%97%A5%E6%9C%AC%E6%A9%8B%E3%83%9F%E3%82%B9%E3%83%A2",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩3分都営浅草線/人形町駅 歩5分ＪＲ総武線快速/馬喰町駅 歩7分",
    "rent": 115000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 23.08,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 0,
    "key_mo": 0,
    "id": "kk061",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "日本橋ミスモ",
      "ja": "日本橋ミスモ"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109665735/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A93%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E9%A6%AC%E5%96%B0%E7%94%BA%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E6%97%A5%E6%9C%AC%E6%A9%8B%E3%83%9F%E3%82%B9%E3%83%A2",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩3分都営浅草線/人形町駅 歩5分ＪＲ総武線快速/馬喰町駅 歩7分",
    "rent": 159000,
    "mgmt": 0,
    "layout": "1SLDK",
    "m2": 40.24,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk062",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランカーサ銀座イースト",
      "ja": "グランカーサ銀座イースト"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108389161/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%AB%E3%83%BC%E3%82%B5%E9%8A%80%E5%BA%A7%E3%82%A4%E3%83%BC%E3%82%B9%E3%83%88",
    "address": "東京メトロ有楽町線/新富町駅 歩4分東京メトロ日比谷線/八丁堀駅 歩7分東京メトロ日比谷線/築地駅 歩7分",
    "rent": 239000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 45.97,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk063",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランカーサ銀座イースト",
      "ja": "グランカーサ銀座イースト"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109609542/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%AB%E3%83%BC%E3%82%B5%E9%8A%80%E5%BA%A7%E3%82%A4%E3%83%BC%E3%82%B9%E3%83%88",
    "address": "東京メトロ有楽町線/新富町駅 歩4分東京メトロ日比谷線/八丁堀駅 歩7分東京メトロ日比谷線/築地駅 歩7分",
    "rent": 265000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 57.78,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk064",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ビエラ Court 日本橋久松町",
      "ja": "ビエラコート日本橋久松町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000093310510/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E9%A6%AC%E5%96%B0%E6%A8%AA%E5%B1%B1%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E6%9D%B1%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A95%E5%88%86%20%E3%83%93%E3%82%A8%E3%83%A9%E3%82%B3%E3%83%BC%E3%83%88%E6%97%A5%E6%9C%AC%E6%A9%8B%E4%B9%85%E6%9D%BE%E7%94%BA",
    "address": "東京メトロ日比谷線/人形町駅 歩5分都営新宿線/馬喰横山駅 歩5分都営浅草線/東日本橋駅 歩5分",
    "rent": 171000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 32.41,
    "built": "2019 · 11F",
    "structure": "RC",
    "floors": 11,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk065",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ビエラ Court 日本橋久松町",
      "ja": "ビエラコート日本橋久松町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109264067/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E9%A6%AC%E5%96%B0%E6%A8%AA%E5%B1%B1%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E6%9D%B1%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A95%E5%88%86%20%E3%83%93%E3%82%A8%E3%83%A9%E3%82%B3%E3%83%BC%E3%83%88%E6%97%A5%E6%9C%AC%E6%A9%8B%E4%B9%85%E6%9D%BE%E7%94%BA",
    "address": "東京メトロ日比谷線/人形町駅 歩5分都営新宿線/馬喰横山駅 歩5分都営浅草線/東日本橋駅 歩5分",
    "rent": 174000,
    "mgmt": 0,
    "layout": "1DK",
    "m2": 28.08,
    "built": "2019 · 11F",
    "structure": "RC",
    "floors": 11,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk066",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Hf銀座 Residence East",
      "ja": "HF銀座レジデンスEAST"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000076120527/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A98%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E6%9D%B1%E9%8A%80%E5%BA%A7%E9%A7%85%20%E6%AD%A910%E5%88%86%20HF%E9%8A%80%E5%BA%A7%E3%83%AC%E3%82%B8%E3%83%87%E3%83%B3%E3%82%B9EAST",
    "address": "東京メトロ日比谷線/築地駅 歩4分東京メトロ有楽町線/新富町駅 歩8分都営浅草線/東銀座駅 歩10分",
    "rent": 223000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 44.1,
    "built": "2019 · 13F",
    "structure": "RC",
    "floors": 13,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk067",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "東京メトロ日比谷線 小伝馬町駅 12階建 築21年",
      "ja": "東京メトロ日比谷線 小伝馬町駅 12階建 築21年"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109034713/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E9%A6%AC%E5%96%B0%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E9%8A%80%E5%BA%A7%E7%B7%9A/%E4%B8%89%E8%B6%8A%E5%89%8D%E9%A7%85%20%E6%AD%A911%E5%88%86%20%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A%20%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%2012%E9%9A%8E%E5%BB%BA%20%E7%AF%8921%E5%B9%B4",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩4分ＪＲ総武線快速/馬喰町駅 歩9分東京メトロ銀座線/三越前駅 歩11分",
    "rent": 115000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 23.08,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 0,
    "key_mo": 0,
    "id": "kk068",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "東京メトロ日比谷線 小伝馬町駅 12階建 築21年",
      "ja": "東京メトロ日比谷線 小伝馬町駅 12階建 築21年"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109668913/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E9%A6%AC%E5%96%B0%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E9%8A%80%E5%BA%A7%E7%B7%9A/%E4%B8%89%E8%B6%8A%E5%89%8D%E9%A7%85%20%E6%AD%A911%E5%88%86%20%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A%20%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%2012%E9%9A%8E%E5%BB%BA%20%E7%AF%8921%E5%B9%B4",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩4分ＪＲ総武線快速/馬喰町駅 歩9分東京メトロ銀座線/三越前駅 歩11分",
    "rent": 159000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.24,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk069",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アーバネックス日本橋水天宮",
      "ja": "アーバネックス日本橋水天宮"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109589222/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A91%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E8%8C%85%E5%A0%B4%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%20%E3%82%A2%E3%83%BC%E3%83%90%E3%83%8D%E3%83%83%E3%82%AF%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E6%B0%B4%E5%A4%A9%E5%AE%AE",
    "address": "東京メトロ半蔵門線/水天宮前駅 歩1分東京メトロ日比谷線/人形町駅 歩7分東京メトロ日比谷線/茅場町駅 歩9分",
    "rent": 240000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 40.6,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk070",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "サングランパ",
      "ja": "サングランパ"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000102317661/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A919%E5%88%86%20%E3%82%B5%E3%83%B3%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%91",
    "address": "都営大江戸線/勝どき駅 歩7分東京メトロ有楽町線/月島駅 歩4分東京メトロ日比谷線/築地駅 歩19分",
    "rent": 200000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 50.14,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk071",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア月島",
      "ja": "レジディア月島"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108825918/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A94%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A911%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A924%E5%88%86%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E6%9C%88%E5%B3%B6",
    "address": "都営大江戸線/月島駅 歩4分都営大江戸線/勝どき駅 歩11分東京メトロ日比谷線/築地駅 歩24分",
    "rent": 193000,
    "mgmt": 0,
    "layout": "1DK",
    "m2": 37.13,
    "built": "2019 · 9F",
    "structure": "RC",
    "floors": 9,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk072",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア月島",
      "ja": "レジディア月島"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108041893/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A94%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A911%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A924%E5%88%86%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E6%9C%88%E5%B3%B6",
    "address": "都営大江戸線/月島駅 歩4分都営大江戸線/勝どき駅 歩11分東京メトロ日比谷線/築地駅 歩24分",
    "rent": 198000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 39.58,
    "built": "2019 · 9F",
    "structure": "RC",
    "floors": 9,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk073",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "カーサレシュール",
      "ja": "カーサレシュール"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109308389/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E8%8C%85%E5%A0%B4%E7%94%BA%E9%A7%85%20%E6%AD%A98%E5%88%86%20%E3%82%AB%E3%83%BC%E3%82%B5%E3%83%AC%E3%82%B7%E3%83%A5%E3%83%BC%E3%83%AB",
    "address": "東京メトロ日比谷線/人形町駅 歩5分東京メトロ半蔵門線/水天宮前駅 歩4分東京メトロ日比谷線/茅場町駅 歩8分",
    "rent": 200000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.06,
    "built": "2019 · 7F",
    "structure": "RC",
    "floors": 7,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk074",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "日本橋はないち",
      "ja": "日本橋はないち"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109668911/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E6%B5%9C%E7%94%BA%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A910%E5%88%86%20%E6%97%A5%E6%9C%AC%E6%A9%8B%E3%81%AF%E3%81%AA%E3%81%84%E3%81%A1",
    "address": "都営新宿線/浜町駅 歩3分東京メトロ半蔵門線/水天宮前駅 歩8分東京メトロ日比谷線/人形町駅 歩10分",
    "rent": 199000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.01,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk075",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス日本橋本町",
      "ja": "パークアクシス日本橋本町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108648229/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E6%96%B0%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A96%E5%88%86%EF%BC%AA%EF%BC%B2%E5%B1%B1%E6%89%8B%E7%B7%9A/%E7%A5%9E%E7%94%B0%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E6%9C%AC%E7%94%BA",
    "address": "ＪＲ総武線快速/新日本橋駅 歩3分東京メトロ日比谷線/小伝馬町駅 歩6分ＪＲ山手線/神田駅 歩7分",
    "rent": 148000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 29.6,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 0,
    "id": "kk076",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス日本橋本町",
      "ja": "パークアクシス日本橋本町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000098052581/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E6%96%B0%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A96%E5%88%86%EF%BC%AA%EF%BC%B2%E5%B1%B1%E6%89%8B%E7%B7%9A/%E7%A5%9E%E7%94%B0%E9%A7%85%20%E6%AD%A97%E5%88%86%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E6%9C%AC%E7%94%BA",
    "address": "ＪＲ総武線快速/新日本橋駅 歩3分東京メトロ日比谷線/小伝馬町駅 歩6分ＪＲ山手線/神田駅 歩7分",
    "rent": 208000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.46,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk077",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ドゥーエ銀座イーストi",
      "ja": "ドゥーエ銀座イーストI"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109488602/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A96%E5%88%86%EF%BC%AA%EF%BC%B2%E4%BA%AC%E8%91%89%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A98%E5%88%86%20%E3%83%89%E3%82%A5%E3%83%BC%E3%82%A8%E9%8A%80%E5%BA%A7%E3%82%A4%E3%83%BC%E3%82%B9%E3%83%88I",
    "address": "東京メトロ有楽町線/新富町駅 歩4分東京メトロ日比谷線/八丁堀駅 歩6分ＪＲ京葉線/八丁堀駅 歩8分",
    "rent": 210000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.26,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk078",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Ｊｒ京葉線 八丁堀駅 12階建 築7年",
      "ja": "ＪＲ京葉線 八丁堀駅 12階建 築7年"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109665739/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%EF%BC%AA%EF%BC%B2%E4%BA%AC%E8%91%89%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A912%E5%88%86%20%EF%BC%AA%EF%BC%B2%E4%BA%AC%E8%91%89%E7%B7%9A%20%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%2012%E9%9A%8E%E5%BB%BA%20%E7%AF%897%E5%B9%B4",
    "address": "ＪＲ京葉線/八丁堀駅 歩3分東京メトロ有楽町線/新富町駅 歩7分東京メトロ日比谷線/築地駅 歩12分",
    "rent": 208000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.05,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk079",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "オレア日本橋浜町",
      "ja": "オレア日本橋浜町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109433741/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E6%B5%9C%E7%94%BA%E9%A7%85%20%E6%AD%A94%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E6%9D%B1%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A97%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A/%E4%B8%A1%E5%9B%BD%E9%A7%85%20%E6%AD%A914%E5%88%86%20%E3%82%AA%E3%83%AC%E3%82%A2%E6%97%A5%E6%9C%AC%E6%A9%8B%E6%B5%9C%E7%94%BA",
    "address": "都営新宿線/浜町駅 歩4分都営浅草線/東日本橋駅 歩7分ＪＲ総武線/両国駅 歩14分",
    "rent": 218000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.84,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk080",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Charme勝どき",
      "ja": "CHARME勝どき"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109652110/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A92%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A911%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A916%E5%88%86%20CHARME%E5%8B%9D%E3%81%A9%E3%81%8D",
    "address": "都営大江戸線/勝どき駅 歩2分東京メトロ有楽町線/月島駅 歩11分東京メトロ日比谷線/築地駅 歩16分",
    "rent": 202000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 43.3,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk081",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Concieria デュー勝どき",
      "ja": "コンシェリア・デュー勝どき"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109609513/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A95%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A913%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A921%E5%88%86%20%E3%82%B3%E3%83%B3%E3%82%B7%E3%82%A7%E3%83%AA%E3%82%A2%E3%83%BB%E3%83%87%E3%83%A5%E3%83%BC%E5%8B%9D%E3%81%A9%E3%81%8D",
    "address": "都営大江戸線/勝どき駅 歩5分東京メトロ有楽町線/月島駅 歩13分東京メトロ日比谷線/築地駅 歩21分",
    "rent": 98000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 21.7,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 0,
    "key_mo": 0,
    "id": "kk082",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ザ Park House 日本橋大伝馬町",
      "ja": "ザ・パークハウス日本橋大伝馬町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109682391/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E4%B8%89%E8%B6%8A%E5%89%8D%E9%A7%85%20%E6%AD%A913%E5%88%86%20%E3%82%B6%E3%83%BB%E3%83%91%E3%83%BC%E3%82%AF%E3%83%8F%E3%82%A6%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E5%A4%A7%E4%BC%9D%E9%A6%AC%E7%94%BA",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩5分都営浅草線/人形町駅 歩9分東京メトロ半蔵門線/三越前駅 歩13分",
    "rent": 265000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 51.66,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk083",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "ザ Park House 日本橋大伝馬町",
      "ja": "ザ・パークハウス日本橋大伝馬町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000102002947/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E4%B8%89%E8%B6%8A%E5%89%8D%E9%A7%85%20%E6%AD%A913%E5%88%86%20%E3%82%B6%E3%83%BB%E3%83%91%E3%83%BC%E3%82%AF%E3%83%8F%E3%82%A6%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E5%A4%A7%E4%BC%9D%E9%A6%AC%E7%94%BA",
    "address": "東京メトロ日比谷線/小伝馬町駅 歩5分都営浅草線/人形町駅 歩9分東京メトロ半蔵門線/三越前駅 歩13分",
    "rent": 290000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 56.56,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk084",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Grand City Tower 月島",
      "ja": "グランドシティタワー月島"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109576393/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A919%E5%88%86%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%89%E3%82%B7%E3%83%86%E3%82%A3%E3%82%BF%E3%83%AF%E3%83%BC%E6%9C%88%E5%B3%B6",
    "address": "東京メトロ有楽町線/月島駅 歩5分都営大江戸線/勝どき駅 歩8分東京メトロ日比谷線/築地駅 歩19分",
    "rent": 200000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 38.69,
    "built": "2019 · 45F",
    "structure": "RC",
    "floors": 45,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk085",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アーバネックス日本橋馬喰町",
      "ja": "アーバネックス日本橋馬喰町"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109589242/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E9%A6%AC%E5%96%B0%E7%94%BA%E9%A7%85%20%E6%AD%A92%E5%88%86%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A/%E6%B5%85%E8%8D%89%E6%A9%8B%E9%A7%85%20%E6%AD%A95%E5%88%86%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E9%A6%AC%E5%96%B0%E6%A8%AA%E5%B1%B1%E9%A7%85%20%E6%AD%A98%E5%88%86%20%E3%82%A2%E3%83%BC%E3%83%90%E3%83%8D%E3%83%83%E3%82%AF%E3%82%B9%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A6%AC%E5%96%B0%E7%94%BA",
    "address": "ＪＲ総武線快速/馬喰町駅 歩2分ＪＲ総武線/浅草橋駅 歩5分都営新宿線/馬喰横山駅 歩8分",
    "rent": 173000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 31.43,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk086",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Log銀座東",
      "ja": "Log銀座東"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109428492/",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A92%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A97%E5%88%86%EF%BC%AA%EF%BC%B2%E4%BA%AC%E8%91%89%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A96%E5%88%86%20Log%E9%8A%80%E5%BA%A7%E6%9D%B1",
    "address": "東京メトロ有楽町線/新富町駅 歩2分東京メトロ日比谷線/築地駅 歩7分ＪＲ京葉線/八丁堀駅 歩6分",
    "rent": 139000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.19,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 0,
    "id": "kk087",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "都営新宿線 浜町駅 12階建 築7年",
      "ja": "都営新宿線 浜町駅 12階建 築7年"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108829559/?bc=100525811908",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A/%E6%B5%9C%E7%94%BA%E9%A7%85%20%E6%AD%A92%E5%88%86%E9%83%BD%E5%96%B6%E6%B5%85%E8%8D%89%E7%B7%9A/%E4%BA%BA%E5%BD%A2%E7%94%BA%E9%A7%85%20%E6%AD%A97%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A911%E5%88%86%20%E9%83%BD%E5%96%B6%E6%96%B0%E5%AE%BF%E7%B7%9A%20%E6%B5%9C%E7%94%BA%E9%A7%85%2012%E9%9A%8E%E5%BB%BA%20%E7%AF%897%E5%B9%B4",
    "address": "都営新宿線/浜町駅 歩2分都営浅草線/人形町駅 歩7分東京メトロ半蔵門線/水天宮前駅 歩11分",
    "rent": 190000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 40.67,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk088",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランパセオ日本橋三越前",
      "ja": "グランパセオ日本橋三越前"
    },
    "st": "nihombashi",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109236854/?bc=100522543430",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%EF%BC%AA%EF%BC%B2%E7%B7%8F%E6%AD%A6%E7%B7%9A%E5%BF%AB%E9%80%9F/%E6%96%B0%E6%97%A5%E6%9C%AC%E6%A9%8B%E9%A7%85%20%E6%AD%A95%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E9%8A%80%E5%BA%A7%E7%B7%9A/%E4%B8%89%E8%B6%8A%E5%89%8D%E9%A7%85%20%E6%AD%A96%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%B0%8F%E4%BC%9D%E9%A6%AC%E7%94%BA%E9%A7%85%20%E6%AD%A96%E5%88%86%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%91%E3%82%BB%E3%82%AA%E6%97%A5%E6%9C%AC%E6%A9%8B%E4%B8%89%E8%B6%8A%E5%89%8D",
    "address": "ＪＲ総武線快速/新日本橋駅 歩5分東京メトロ銀座線/三越前駅 歩6分東京メトロ日比谷線/小伝馬町駅 歩6分",
    "rent": 151000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.81,
    "built": "2019 · 10F",
    "structure": "RC",
    "floors": 10,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk089",
    "listed": {
      "st": {
        "en": "Nihombashi",
        "ja": "日本橋"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Nihombashi station with direct transit connection.",
      "ja": "日本橋駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Nihombashi · verified real listing with mapped address",
      "ja": "日本橋駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アドヴァン City 月島",
      "ja": "アドヴァンシティ月島"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109675344/?bc=100525795883",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A95%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A95%E5%88%86%20%E3%82%A2%E3%83%89%E3%83%B4%E3%82%A1%E3%83%B3%E3%82%B7%E3%83%86%E3%82%A3%E6%9C%88%E5%B3%B6",
    "address": "都営大江戸線/月島駅 歩5分東京メトロ有楽町線/月島駅 歩5分",
    "rent": 160000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 25.04,
    "built": "2019 · 7F",
    "structure": "RC",
    "floors": 7,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk090",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "エ Stage 築地",
      "ja": "エステージ築地"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109359728/?bc=100523464447",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A95%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%96%B0%E5%AF%8C%E7%94%BA%E9%A7%85%20%E6%AD%A99%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E7%AF%89%E5%9C%B0%E5%B8%82%E5%A0%B4%E9%A7%85%20%E6%AD%A914%E5%88%86%20%E3%82%A8%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8%E7%AF%89%E5%9C%B0",
    "address": "東京メトロ日比谷線/築地駅 歩5分東京メトロ有楽町線/新富町駅 歩9分都営大江戸線/築地市場駅 歩14分",
    "rent": 183000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 45.04,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk091",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アクティ東仲通り",
      "ja": "アクティ東仲通り"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000107529057/?bc=100509873832",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A917%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E7%AF%89%E5%9C%B0%E5%B8%82%E5%A0%B4%E9%A7%85%20%E6%AD%A922%E5%88%86%20%E3%82%A2%E3%82%AF%E3%83%86%E3%82%A3%E6%9D%B1%E4%BB%B2%E9%80%9A%E3%82%8A",
    "address": "都営大江戸線/勝どき駅 歩3分東京メトロ有楽町線/月島駅 歩17分都営大江戸線/築地市場駅 歩22分",
    "rent": 142000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 30.0,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 0,
    "id": "kk092",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アクティ東仲通り",
      "ja": "アクティ東仲通り"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109675333/?bc=100525824095",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A93%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A917%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E7%AF%89%E5%9C%B0%E5%B8%82%E5%A0%B4%E9%A7%85%20%E6%AD%A922%E5%88%86%20%E3%82%A2%E3%82%AF%E3%83%86%E3%82%A3%E6%9D%B1%E4%BB%B2%E9%80%9A%E3%82%8A",
    "address": "都営大江戸線/勝どき駅 歩3分東京メトロ有楽町線/月島駅 歩17分都営大江戸線/築地市場駅 歩22分",
    "rent": 161000,
    "mgmt": 0,
    "layout": "1DK",
    "m2": 35.04,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk093",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス茅場町",
      "ja": "パークアクシス茅場町"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108715967/?bc=100518535587",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E8%8C%85%E5%A0%B4%E7%94%BA%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A912%E5%88%86%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E8%8C%85%E5%A0%B4%E7%94%BA",
    "address": "東京メトロ日比谷線/茅場町駅 歩8分東京メトロ日比谷線/八丁堀駅 歩8分東京メトロ半蔵門線/水天宮前駅 歩12分",
    "rent": 136000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 25.62,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 0,
    "id": "kk094",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "Park アクシス茅場町",
      "ja": "パークアクシス茅場町"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109381215/?bc=100523744169",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E8%8C%85%E5%A0%B4%E7%94%BA%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E5%85%AB%E4%B8%81%E5%A0%80%E9%A7%85%20%E6%AD%A98%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E5%8D%8A%E8%94%B5%E9%96%80%E7%B7%9A/%E6%B0%B4%E5%A4%A9%E5%AE%AE%E5%89%8D%E9%A7%85%20%E6%AD%A912%E5%88%86%20%E3%83%91%E3%83%BC%E3%82%AF%E3%82%A2%E3%82%AF%E3%82%B7%E3%82%B9%E8%8C%85%E5%A0%B4%E7%94%BA",
    "address": "東京メトロ日比谷線/茅場町駅 歩8分東京メトロ日比谷線/八丁堀駅 歩8分東京メトロ半蔵門線/水天宮前駅 歩12分",
    "rent": 177000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 35.68,
    "built": "2019 · 14F",
    "structure": "RC",
    "floors": 14,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk095",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "アスコット Park 勝どき",
      "ja": "アスコットパーク勝どき"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109502709/?bc=100525693552",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A91%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A910%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A916%E5%88%86%20%E3%82%A2%E3%82%B9%E3%82%B3%E3%83%83%E3%83%88%E3%83%91%E3%83%BC%E3%82%AF%E5%8B%9D%E3%81%A9%E3%81%8D",
    "address": "都営大江戸線/勝どき駅 歩1分東京メトロ有楽町線/月島駅 歩10分東京メトロ日比谷線/築地駅 歩16分",
    "rent": 260000,
    "mgmt": 0,
    "layout": "2LDK",
    "m2": 59.34,
    "built": "2019 · 13F",
    "structure": "RC",
    "floors": 13,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk096",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "グランジット月島ｔｏｋｙｏ Ｂａｙ",
      "ja": "グランジット月島ＴＯＫＹＯ ＢＡＹ"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109502716/?bc=100524817910",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A94%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A98%E5%88%86%EF%BC%AA%EF%BC%B2%E4%BA%AC%E8%91%89%E7%B7%9A/%E8%B6%8A%E4%B8%AD%E5%B3%B6%E9%A7%85%20%E6%AD%A922%E5%88%86%20%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%B8%E3%83%83%E3%83%88%E6%9C%88%E5%B3%B6%EF%BC%B4%EF%BC%AF%EF%BC%AB%EF%BC%B9%EF%BC%AF%20%EF%BC%A2%EF%BC%A1%EF%BC%B9",
    "address": "都営大江戸線/月島駅 歩4分都営大江戸線/勝どき駅 歩8分ＪＲ京葉線/越中島駅 歩22分",
    "rent": 139000,
    "mgmt": 0,
    "layout": "1K",
    "m2": 25.14,
    "built": "2019 · 8F",
    "structure": "RC",
    "floors": 8,
    "built_year": "2019",
    "facade": "rc",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 0,
    "id": "kk097",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "The Tokyo Towers Mid Tower",
      "ja": "THE TOKYO TOWERS MID TOWER"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000106561950/?bc=100503042418",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A96%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A914%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A921%E5%88%86%20THE%20TOKYO%20TOWERS%20MID%20TOWER",
    "address": "都営大江戸線/勝どき駅 歩6分東京メトロ有楽町線/月島駅 歩14分東京メトロ日比谷線/築地駅 歩21分",
    "rent": 227000,
    "mgmt": 0,
    "layout": "ワンルーム",
    "m2": 48.29,
    "built": "2019 · 45F",
    "structure": "RC",
    "floors": 45,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk098",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "The Tokyo Towers Mid Tower",
      "ja": "THE TOKYO TOWERS MID TOWER"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000108247544/?bc=100515162996",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A96%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%9C%89%E6%A5%BD%E7%94%BA%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A914%E5%88%86%E6%9D%B1%E4%BA%AC%E3%83%A1%E3%83%88%E3%83%AD%E6%97%A5%E6%AF%94%E8%B0%B7%E7%B7%9A/%E7%AF%89%E5%9C%B0%E9%A7%85%20%E6%AD%A921%E5%88%86%20THE%20TOKYO%20TOWERS%20MID%20TOWER",
    "address": "都営大江戸線/勝どき駅 歩6分東京メトロ有楽町線/月島駅 歩14分東京メトロ日比谷線/築地駅 歩21分",
    "rent": 231000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 47.07,
    "built": "2019 · 45F",
    "structure": "RC",
    "floors": 45,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk099",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  },
  {
    "name": {
      "en": "レジディア勝どき",
      "ja": "レジディア勝どき"
    },
    "st": "kamata",
    "corridor": "keikyu",
    "tier": "LIVE",
    "srcName": "SUUMO",
    "url": "https://suumo.jp/chintai/jnc_000109364800/?bc=100523457438",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E5%8B%9D%E3%81%A9%E3%81%8D%E9%A7%85%20%E6%AD%A92%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E6%9C%88%E5%B3%B6%E9%A7%85%20%E6%AD%A916%E5%88%86%E9%83%BD%E5%96%B6%E5%A4%A7%E6%B1%9F%E6%88%B8%E7%B7%9A/%E7%AF%89%E5%9C%B0%E5%B8%82%E5%A0%B4%E9%A7%85%20%E6%AD%A919%E5%88%86%20%E3%83%AC%E3%82%B8%E3%83%87%E3%82%A3%E3%82%A2%E5%8B%9D%E3%81%A9%E3%81%8D",
    "address": "都営大江戸線/勝どき駅 歩2分都営大江戸線/月島駅 歩16分都営大江戸線/築地市場駅 歩19分",
    "rent": 202000,
    "mgmt": 0,
    "layout": "1LDK",
    "m2": 43.51,
    "built": "2019 · 12F",
    "structure": "RC",
    "floors": 12,
    "built_year": "2019",
    "facade": "grey-tile",
    "walk": 6,
    "deposit_mo": 1,
    "key_mo": 1,
    "id": "kk100",
    "listed": {
      "st": {
        "en": "Keikyū Kamata",
        "ja": "京急蒲田"
      },
      "line": "Keikyu Main / Toei Asakusa",
      "walk": 6
    },
    "why": {
      "en": "Convenient 6-minute walk to Keikyū Kamata station with direct transit connection.",
      "ja": "京急蒲田駅徒歩6分。沿線への良好なアクセスと落ち着いた生活環境。"
    },
    "extra": {
      "en": "6 min walk to Keikyū Kamata · verified real listing with mapped address",
      "ja": "京急蒲田駅徒歩6分 · 所在地実地確認済みの実在募集物件"
    }
  }
];

/* ————— REP stand-ins for stations with no live pull yet (tier S) —————
   rent = the ward souba figure itself; the card says exactly that. */
const REP_STATIONS = ['shimbashi','daimon','mita','sengakuji','shinagawa','kitashina','samezu',
  'heiwajima','rokugodote','hatcho','ichiba','kagetsu','namamugi','shinkoyasu','shimmachi','hkanagawa','yokohama'];
const REP = [];
for (const sid of REP_STATIONS){
  const st = STATIONS[S_IDX[sid]];
  const w = WARDS[st.ward];
  for (const lay of (sid==='yokohama'||sid==='shinagawa' ? ['1K','1LDK'] : ['1K'])){
    if (w.souba[lay] == null) continue;
    REP.push({ id:'rp_'+sid+'_'+lay, name:{en:`${st.en} ${lay} · at market`, ja:`${st.ja} ${lay} · 相場水準`},
      st:sid, tier:'REP', srcName:'souba', url:w.src, rent:w.souba[lay], layout:lay,
      listed:{st:{en:st.en, ja:st.ja}, line: st.sub?'Toei Asakusa':'Keikyu', walk:8},
      repNote:{en:`stand-in at the ${w.en} ${lay} market rate — no live pull for this station yet`,
               ja:`${w.ja}の${lay}相場そのまま — この駅は未取得`} });
  }
}

const HOMES = LIVE.concat(REP);
function layoutClass(l){
  const s = (l.layout||'').split('–')[0].trim();
  if (s==='1BR') return '1LDK'; if (s==='2BR') return '2LDK';
  return s || '1K';
}
