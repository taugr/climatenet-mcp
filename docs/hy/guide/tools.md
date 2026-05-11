# Գործիքների հղում

Բոլոր գործիքները read-only են և վերադարձնում են JSON՝ որպես text content։

Սկզբում օգտագործեք `list_devices`՝ ClimateNet `generated_id` արժեքները գտնելու համար։ Մյուս գործիքներն այդ արժեքներն ընդունում են որպես `device_id` կամ `device_ids`։

## `list_devices`

Ցուցակել ClimateNet բնապահպանական մոնիթորինգի սարքերը։

Պարամետրեր՝

- `region` optional string: մարզի կամ տարածաշրջանի անուն, օրինակ՝ `Yerevan` կամ `Shirak`
- `status` optional enum: `online` կամ `offline`
- `has_issues` optional boolean: զտել խնդիրներ ունեցող կամ չունեցող սարքերը
- `sensor` optional enum: `LTR390`, `BME280`, `PMS5003`, `Wind` կամ `Rainfall`
- `sensor_status` optional enum: `valid`, `invalid` կամ `nodata`

Վերադարձնում է սարքերի մետատվյալների array՝ ներառյալ generated ID, անուններ, մարզերի անուններ, կոորդինատներ, սենսորների կարգավիճակներ, online կարգավիճակ, թարմացման timestamp-ներ և խնդիրներ։

## `get_device`

Ստանալ մեկ ClimateNet սարքի մետատվյալները։

Պարամետրեր՝

- `device_id` number: ClimateNet `generated_id` `list_devices`-ից

Վերադարձնում է մեկ սարքի object՝ կոորդինատներով, սենսորների վիճակով, ընթացիկ կարգավիճակով, timestamp-ներով և հաղորդված խնդիրներով։

## `get_latest_reading`

Ստանալ մեկ սարքի վերջին հասանելի չափումը։

Պարամետրեր՝

- `device_id` number: ClimateNet `generated_id` `list_devices`-ից

Վերադարձնում է ամենավերջին չափումը կամ `null`։ Չափումները կարող են ներառել UV, լույս, ջերմաստիճան, ճնշում, խոնավություն, մասնիկային նյութ, քամու արագություն, անձրև և քամու ուղղություն։

## `get_device_readings`

Ստանալ չափումներ փաստաթղթավորված public ClimateNet API-ից։

Պարամետրեր՝

- `device_id` number: ClimateNet `generated_id` `list_devices`-ից
- `start_date` optional string: `YYYY-MM-DD`; պետք է տրվի `end_date`-ի հետ միասին
- `end_date` optional string: `YYYY-MM-DD`; պետք է տրվի `start_date`-ի հետ միասին

Վերադարձնում է normalize արված reading object-ներ։ Առանց ամսաթվերի API-ն վերադարձնում է մոտավորապես վերջին 24 ժամը։

## `get_device_graph`

Ստանալ գրաֆիկի համար պատրաստ 15 րոպեանոց ժամանակային շարք մեկ սարքի և ամսաթվերի միջակայքի համար։

Պարամետրեր՝

- `device_id` number: ClimateNet `generated_id` `list_devices`-ից
- `start_date` string: `YYYY-MM-DD`
- `end_date` string: `YYYY-MM-DD`
- `metric` optional enum: `uv`, `lux`, `temperature`, `pressure`, `humidity`, `pm1`, `pm2_5`, `pm10`, `speed` կամ `rain`

Առանց `metric`-ի վերադարձնում է ամբողջական graph readings։ `metric`-ով վերադարձնում է compact `{ time, value }` կետեր։

## `compare_devices`

Համեմատել մեկ metric մի քանի սարքերի միջև նույն ամսաթվերի միջակայքում։

Պարամետրեր՝

- `device_ids` number array: մեկից տաս ClimateNet `generated_id` արժեք
- `start_date` string: `YYYY-MM-DD`
- `end_date` string: `YYYY-MM-DD`
- `metric` enum: `uv`, `lux`, `temperature`, `pressure`, `humidity`, `pm1`, `pm2_5`, `pm10`, `speed` կամ `rain`

Վերադարձնում է մեկ series յուրաքանչյուր սարքի համար՝ սարքի ID-ով, սարքի անունով, metric-ով և հավասարեցված graph points-ներով։

## Աջակցվող metric-ներ

| Metric        | Նշանակություն          |
| ------------- | ---------------------- |
| `uv`          | UV չափում              |
| `lux`         | Լույսի մակարդակ        |
| `temperature` | Ջերմաստիճան            |
| `pressure`    | Մթնոլորտային ճնշում    |
| `humidity`    | Խոնավություն           |
| `pm1`         | Մասնիկային նյութ PM1   |
| `pm2_5`       | Մասնիկային նյութ PM2.5 |
| `pm10`        | Մասնիկային նյութ PM10  |
| `speed`       | Քամու արագություն      |
| `rain`        | Անձրևի չափում          |
