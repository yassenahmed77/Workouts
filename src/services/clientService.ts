import { User, ClientSubscription } from '@/types';
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientNoteUpdateSchema,
  ClientCreateInput,
  ClientUpdateInput
} from '@/schemas/client.schema';

/**
 * Client / Trainee Service Layer (Clean Architecture).
 * Decouples client data access, validation, and domain calculations from UI views.
 * 
 * When switching to real REST/GraphQL or Supabase APIs, only this file is updated,
 * preserving complete UI and component stability.
 */
export const clientService = {
  /**
   * Filter athletes by coach or competitor status with null safety
   */
  getTrainees(users: User[], coachId?: string): User[] {
    if (!Array.isArray(users)) return [];
    return users.filter((u) => {
      if (!u || u.role !== 'trainee') return false;
      if (coachId && u.coachId && u.coachId !== coachId) return false;
      return true;
    });
  },

  getCompetitors(users: User[], coachId?: string): User[] {
    if (!Array.isArray(users)) return [];
    return users.filter((u) => {
      if (!u || u.role !== 'trainee' || !u.isCompetitor) return false;
      if (coachId && u.coachId && u.coachId !== coachId) return false;
      return true;
    });
  },

  getClientById(users: User[], id: string): User | undefined {
    if (!Array.isArray(users) || !id) return undefined;
    return users.find((u) => u && u.id === id);
  },

  /**
   * Status evaluation logic based on onboarding completeness & account health
   */
  getClientStatus(client: User): {
    status: 'active' | 'needs_plan' | 'needs_diet' | 'needs_setup' | 'on_hold';
    label: string;
  } {
    if (!client) {
      return { status: 'needs_setup', label: 'Needs Setup' };
    }
    if (client.status === 'on_hold' || client.status === 'inactive') {
      return { status: 'on_hold', label: 'On Hold' };
    }
    if (client.status === 'pending') {
      return { status: 'needs_setup', label: 'Needs Setup' };
    }
    if (!client.assignedPlanId) {
      return { status: 'needs_plan', label: 'Needs Plan' };
    }
    if (!client.assignedDietPlanId) {
      return { status: 'needs_diet', label: 'Needs Diet' };
    }
    return { status: 'active', label: 'All Set' };
  },

  /**
   * Dynamically calculates subscription status (Active, Expiring Soon <= 7d, Expired)
   * based on current date, eliminating stale or hardcoded string statuses.
   */
  calculateSubscriptionStatus(
    subscription?: ClientSubscription
  ): 'active' | 'expiring_soon' | 'expired' {
    if (!subscription || !subscription.endDate) {
      return 'active';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(subscription.endDate);
    if (isNaN(end.getTime())) {
      return 'active';
    }
    end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'expired';
    }
    if (diffDays <= 7) {
      return 'expiring_soon';
    }
    return 'active';
  },

  /**
   * Generates safe 2-letter uppercase initials for avatar display
   */
  getInitials(name?: string): string {
    if (!name || typeof name !== 'string') return 'AT';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Validates new client creation payload using Zod runtime contract
   */
  validateCreate(payload: unknown): { success: true; data: ClientCreateInput } | { success: false; errors: string[] } {
    const result = ClientCreateSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  },

  /**
   * Validates client update payload using Zod runtime contract
   */
  validateUpdate(payload: unknown): { success: true; data: ClientUpdateInput } | { success: false; errors: string[] } {
    const result = ClientUpdateSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  },

  /**
   * Validates and sanitizes coach private notes
   */
  validateNoteUpdate(payload: unknown): { success: true; data: { clientId: string; privateCoachNotes: string } } | { success: false; errors: string[] } {
    const result = ClientNoteUpdateSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: true, data: result.data };
  }
};
