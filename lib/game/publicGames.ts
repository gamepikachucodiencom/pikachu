/**
 * Public Games Management
 * Handles finding and joining public games
 */

import { supabase } from '@/lib/supabase/client';
import type { OnlineGame } from './onlineGame';

/**
 * Find a public game waiting for players
 */
export async function findPublicGame(): Promise<{
  data: OnlineGame | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) throw error;
    return { data: data as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to find public game'),
    };
  }
}

/**
 * Join a public game
 */
export async function joinPublicGame(
  gameId: string,
  playerId: string
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    // Get the game
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError) throw fetchError;
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not waiting for players');
    }

    if (game.player2_id) {
      throw new Error('Game is full');
    }

    // Join as player 2
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player2_id: playerId,
        status: 'playing',
        turn_started_at: new Date().toISOString(), // Start timer for first player
      })
      .eq('id', gameId)
      .select()
      .single();

    if (updateError) throw updateError;
    return { data: updatedGame as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to join public game'),
    };
  }
}

