-- Migración para integrar Clerk con Supabase (tablas existentes)

-- 1. Agregar columna clerk_id a la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;

-- 2. Crear índice para clerk_id en usuarios
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON usuarios(clerk_id);

-- 3. Agregar columna clerk_id a la tabla eventos
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);

-- 4. Crear índice para clerk_id en eventos
CREATE INDEX IF NOT EXISTS idx_eventos_clerk_id ON eventos(clerk_id);

-- 5. Crear índices para fecha y hora en eventos
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_hora ON eventos(hora);

-- 6. Función para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para usuarios
DROP TRIGGER IF EXISTS trigger_update_usuarios_actualizado_en ON usuarios;
CREATE TRIGGER trigger_update_usuarios_actualizado_en
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_actualizado_en();

-- 8. Crear trigger para eventos
DROP TRIGGER IF EXISTS trigger_update_eventos_actualizado_en ON eventos;
CREATE TRIGGER trigger_update_eventos_actualizado_en
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_actualizado_en();

