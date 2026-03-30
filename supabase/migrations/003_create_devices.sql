-- 003_create_devices.sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('android', 'ios', 'embedded', 'iot', 'web', 'desktop', 'custom')),
    serial_number TEXT,
    firmware_version TEXT,
    os_version TEXT,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'testing', 'error', 'maintenance')),
    connection_type TEXT CHECK (connection_type IN ('usb', 'adb', 'uart', 'ssh', 'wifi', 'api', 'agent')),
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devices_org ON devices(organization_id);
CREATE INDEX idx_devices_status ON devices(status);
