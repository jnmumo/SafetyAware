import { supabase } from '../lib/supabase';

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string | null;
  status: string | null;
  created_at: string | null;
}

class WaitlistService {
  async addToWaitlist(email: string, source: string = 'landing_page'): Promise<{ 
    success: boolean; 
    error?: string; 
    data?: WaitlistEntry 
  }> {
    try {
      console.log('📧 Adding email to waitlist:', email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Insert into waitlist_entries table
      const { data, error } = await supabase
        .from('waitlist_entries')
        .insert({
          email: email.toLowerCase().trim(),
          source,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding to waitlist:', error);
        
        // Handle duplicate email error
        if (error.code === '23505' || error.message.includes('duplicate')) {
          return { success: false, error: 'This email is already on our waitlist!' };
        }
        
        return { success: false, error: 'Failed to join waitlist. Please try again.' };
      }

      console.log('✅ Successfully added to waitlist:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Unexpected error adding to waitlist:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  async checkEmailInWaitlist(email: string): Promise<{ 
    exists: boolean; 
    entry?: WaitlistEntry 
  }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_entries')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking waitlist:', error);
        return { exists: false };
      }

      return { exists: !!data, entry: data || undefined };
    } catch (error) {
      console.error('❌ Unexpected error checking waitlist:', error);
      return { exists: false };
    }
  }

  async getWaitlistStats(): Promise<{
    total: number;
    recent: number;
    error?: string;
  }> {
    try {
      // Get total count
      const { count: total, error: totalError } = await supabase
        .from('waitlist_entries')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('❌ Error getting waitlist stats:', totalError);
        return { total: 0, recent: 0, error: 'Failed to load stats' };
      }

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recent, error: recentError } = await supabase
        .from('waitlist_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        console.error('❌ Error getting recent waitlist stats:', recentError);
        return { total: total || 0, recent: 0 };
      }

      return { total: total || 0, recent: recent || 0 };
    } catch (error) {
      console.error('❌ Unexpected error getting waitlist stats:', error);
      return { total: 0, recent: 0, error: 'Failed to load stats' };
    }
  }
}

export const waitlistService = new WaitlistService();