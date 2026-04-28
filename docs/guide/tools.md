# Tool Reference

All tools are read-only and return JSON as text content.

Use `list_devices` first to discover ClimateNet `generated_id` values. The other tools accept those values as `device_id` or `device_ids`.

## `list_devices`

List ClimateNet environmental monitoring devices.

Parameters:

- `region` optional string: region or province name, such as `Yerevan` or `Shirak`
- `status` optional enum: `online` or `offline`
- `has_issues` optional boolean: filter devices with or without reported issues
- `sensor` optional enum: `LTR390`, `BME280`, `PMS5003`, `Wind`, or `Rainfall`
- `sensor_status` optional enum: `valid`, `invalid`, or `nodata`

Returns an array of device metadata, including generated ID, names, region names, coordinates, sensor statuses, online status, update timestamps, and issues.

## `get_device`

Get metadata for one ClimateNet device.

Parameters:

- `device_id` number: ClimateNet `generated_id` from `list_devices`

Returns one device object with coordinates, sensor health, current status, timestamps, and reported issues.

## `get_latest_reading`

Get the latest available reading for one device.

Parameters:

- `device_id` number: ClimateNet `generated_id` from `list_devices`

Returns the most recent reading or `null`. Readings can include UV, light, temperature, pressure, humidity, particulate matter, wind speed, rain, and wind direction.

## `get_device_readings`

Get readings from the documented public ClimateNet API.

Parameters:

- `device_id` number: ClimateNet `generated_id` from `list_devices`
- `start_date` optional string: `YYYY-MM-DD`; must be paired with `end_date`
- `end_date` optional string: `YYYY-MM-DD`; must be paired with `start_date`

Returns normalized reading objects. Without dates, the API returns roughly the latest 24 hours.

## `get_device_graph`

Get chart-ready 15-minute time-series data for one device and date range.

Parameters:

- `device_id` number: ClimateNet `generated_id` from `list_devices`
- `start_date` string: `YYYY-MM-DD`
- `end_date` string: `YYYY-MM-DD`
- `metric` optional enum: `uv`, `lux`, `temperature`, `pressure`, `humidity`, `pm1`, `pm2_5`, `pm10`, `speed`, or `rain`

Without `metric`, returns full graph readings. With `metric`, returns compact `{ time, value }` points.

## `compare_devices`

Compare one metric across multiple devices over the same date range.

Parameters:

- `device_ids` number array: one to ten ClimateNet `generated_id` values
- `start_date` string: `YYYY-MM-DD`
- `end_date` string: `YYYY-MM-DD`
- `metric` enum: `uv`, `lux`, `temperature`, `pressure`, `humidity`, `pm1`, `pm2_5`, `pm10`, `speed`, or `rain`

Returns one series per device with the device ID, device name, metric, and aligned graph points.

## Supported Metrics

| Metric        | Meaning                  |
| ------------- | ------------------------ |
| `uv`          | UV measurement           |
| `lux`         | Light level              |
| `temperature` | Temperature              |
| `pressure`    | Atmospheric pressure     |
| `humidity`    | Humidity                 |
| `pm1`         | Particulate matter PM1   |
| `pm2_5`       | Particulate matter PM2.5 |
| `pm10`        | Particulate matter PM10  |
| `speed`       | Wind speed               |
| `rain`        | Rain measurement         |
