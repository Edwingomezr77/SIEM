import { supabase } from '../lib/supabase';
import { AuthUser } from '../types/auth';

export class AuthService {
  // Iniciar sesión
  static async signIn(email: string, password: string): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!
      };
    }
    
    return null;
  }

  // Registrar usuario
  static async signUp(email: string, password: string, fullName: string): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!
      };
    }
    
    return null;
  }

  // Cerrar sesión
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}