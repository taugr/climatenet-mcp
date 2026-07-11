# ClimateNet Tool Reference

## list_devices

List ClimateNet monitoring devices, optionally filtered.

**Parameters:**

| Name     | Type              | Description                                         |
| -------- | ----------------- | --------------------------------------------------- |
| `status` | string (optional) | Filter by device status (e.g. `active`, `inactive`) |
| `region` | string (optional) | Filter by region name (e.g. `Yerevan`)              |
| `issue`  | string (optional) | Filter by reported issue type                       |
| `sensor` | string (optional) | Filter to devices that have a specific sensor type  |

**Returns:** Array of device summaries (ID, name, region, status, coordinates).

---

## get_device

Fetch full metadata for one device.

**Parameters:**

| Name        | Type               | Description   |
| ----------- | ------------------ | ------------- |
| `device_id` | integer (required) | The device ID |

**Returns:** Device metadata including name, region, coordinates, sensors, status.

---

## get_latest_reading

Fetch the most recent environmental reading from a device.

**Parameters:**

| Name        | Type               | Description   |
| ----------- | ------------------ | ------------- |
| `device_id` | integer (required) | The device ID |

**Returns:** Latest sensor values with timestamps and units.

---

## get_device_readings

Fetch historical readings from ClimateNet's documented API, normalized from the `keys` + row array format into objects.

**Parameters:**

| Name        | Type               | Description             |
| ----------- | ------------------ | ----------------------- |
| `device_id` | integer (required) | The device ID           |
| `start`     | string (optional)  | ISO 8601 start datetime |
| `end`       | string (optional)  | ISO 8601 end datetime   |

**Returns:** Array of reading objects, each keyed by sensor name.

---

## get_device_graph

Fetch 15-minute interval graph data for a device, optionally for a single metric.

**Parameters:**

| Name        | Type               | Description                                           |
| ----------- | ------------------ | ----------------------------------------------------- |
| `device_id` | integer (required) | The device ID                                         |
| `metric`    | string (optional)  | Sensor metric to include (e.g. `pm25`, `temperature`) |

**Returns:** Array of timestamped data points at 15-minute resolution.

---

## compare_devices

Fetch aligned timeseries for multiple devices on a single metric.

**Parameters:**

| Name         | Type                         | Description                          |
| ------------ | ---------------------------- | ------------------------------------ |
| `device_ids` | array of integers (required) | Device IDs to compare                |
| `metric`     | string (required)            | The metric to compare across devices |

**Returns:** Object mapping device ID to its timeseries for the given metric.
