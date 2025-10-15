/*
  # Crear usuarios de prueba

  1. Usuarios de prueba
    - Admin: admin@preembarques.com (admin123)
    - Usuario: usuario@preembarques.com (user123)
  
  2. Perfiles
    - Crear perfiles con roles correspondientes
    - Vincular con auth.users
  
  Nota: Los usuarios deben crearse manualmente en Supabase Auth
  Este script solo crea los perfiles una vez que los usuarios existan
*/

-- Insertar perfiles para usuarios de prueba (solo si no existen)
-- Nota: Los UUIDs deben coincidir con los usuarios creados en auth.users

-- Función para crear perfil si el usuario existe en auth.users
CREATE OR REPLACE FUNCTION create_test_profile(user_email text, user_role text, user_full_name text)
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Buscar el usuario en auth.users
  SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
  
  -- Si el usuario existe, crear o actualizar su perfil
  IF user_uuid IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, email, role, full_name)
    VALUES (user_uuid, user_email, user_role, user_full_name)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Intentar crear perfiles para usuarios de prueba
SELECT create_test_profile('admin@preembarques.com', 'admin', 'Administrador del Sistema');
SELECT create_test_profile('usuario@preembarques.com', 'user', 'Usuario Normal');

-- Limpiar función temporal
DROP FUNCTION create_test_profile(text, text, text);