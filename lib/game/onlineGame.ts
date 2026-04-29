/**
 * Online Game Management Utilities
 * Handles game creation, joining, and real-time updates
 */

import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/stores/types';

export interface OnlineGame {
  id: string;
  room_code: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_ready?: boolean;
  player2_ready?: boolean;
  game_type: 'human-vs-human' | 'human-vs-ai' | 'hidden-chess';
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  current_player: 'red' | 'black' | null;
  board_fen: string;
  move_history: string[];
  winner_id: string | null;
  is_public?: boolean;
  turn_started_at?: string;
  time_per_move?: number;
  created_at: string;
  updated_at: string;
  player1?: UserProfile;
  player2?: UserProfile;
}

export interface GameMove {
  id: string;
  game_id: string;
  move_number: number;
  from_position: string;
  to_position: string;
  piece_type: string | null;
  captured_piece: string | null;
  player_color: 'red' | 'black';
  move_notation: string;
  created_at: string;
}

/** Spectator row for UI (from game_spectators + profiles). */
export interface GameSpectatorProfile {
  userId: string;
  username: string;
  avatar: string | null;
}

type ProfileMini = { username: string; avatar: string | null };

function profileFromRow(
  embedded: ProfileMini | ProfileMini[] | null | undefined
): ProfileMini | null {
  if (embedded == null) return null;
  return Array.isArray(embedded) ? embedded[0] ?? null : embedded;
}

/**
 * Load spectators for a game with profile display fields.
 */
export async function fetchGameSpectatorsWithProfiles(
  gameId: string
): Promise<{ data: GameSpectatorProfile[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('game_spectators')
      .select('spectator_id, profiles(username, avatar)')
      .eq('game_id', gameId);

    if (error) throw error;

    const rows = (data ?? []) as Array<{
      spectator_id: string;
      profiles: ProfileMini | ProfileMini[] | null;
    }>;

    const list: GameSpectatorProfile[] = rows.map((row) => {
      const prof = profileFromRow(row.profiles);
      return {
        userId: row.spectator_id,
        username: prof?.username?.trim() || 'Người chơi',
        avatar: prof?.avatar ?? null,
      };
    });

    return { data: list, error: null };
  } catch (e) {
    return {
      data: [],
      error:
        e instanceof Error ? e : new Error('Failed to load spectators'),
    };
  }
}

/**
 * Create a new online game
 */
export async function createOnlineGame(
  playerId: string,
  gameType: 'human-vs-human' | 'hidden-chess' = 'human-vs-human',
  isPublic: boolean = false,
  timePerMoveSeconds: number = 60
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    // Generate room code (client-side, ensure uniqueness)
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Check if room code exists and generate a new one if needed
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('games')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!existing) {
        break; // Room code is unique
      }

      roomCode = generateRoomCode();
      attempts++;
    }

    const initialFen =
      'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w';

    const { data, error } = await supabase
      .from('games')
      .insert({
        room_code: roomCode,
        player1_id: playerId,
        game_type: gameType,
        status: 'waiting',
        current_player: 'red',
        board_fen: initialFen,
        move_history: [],
        is_public: isPublic,
        time_per_move: timePerMoveSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Failed to create game'),
    };
  }
}

/**
 * Find a waiting public game of the given type and join, or create a new public game.
 */
export async function quickMatch(
  playerId: string,
  gameType: 'human-vs-human' | 'hidden-chess',
  timePerMoveSeconds: number = 60
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    const { data: existing, error: findError } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'waiting')
      .eq('is_public', true)
      .eq('time_per_move', timePerMoveSeconds)
      .is('player2_id', null)
      .eq('game_type', gameType)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('games')
        .update({ player2_id: playerId })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updated as OnlineGame, error: null };
    }

    return createOnlineGame(playerId, gameType, true, timePerMoveSeconds);
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Quick match failed'),
    };
  }
}

/**
 * Join an existing game by room code
 */
export async function joinGame(
  roomCode: string,
  playerId: string
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    // Check if game exists and has space
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (fetchError) throw fetchError;
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not waiting for players');
    }

    if (game.player1_id === playerId) {
      // Player is already in the game
      return { data: game as OnlineGame, error: null };
    }

    if (game.player2_id) {
      throw new Error('Game is full');
    }

    // Join as player 2
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player2_id: playerId,
        status: 'waiting',
      })
      .eq('id', game.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return { data: updatedGame as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to join game'),
    };
  }
}

export async function setPlayerReady(
  gameId: string,
  playerId: string
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError) throw fetchError;
    if (!game) throw new Error('Game not found');

    const isPlayer1 = game.player1_id === playerId;
    const isPlayer2 = game.player2_id === playerId;
    if (!isPlayer1 && !isPlayer2) {
      throw new Error('Not a player in this game');
    }

    const patch: Record<string, any> = {};
    if (isPlayer1) patch.player1_ready = true;
    if (isPlayer2) patch.player2_ready = true;

    // Update ready flag first
    const { data: updated, error: updateError } = await supabase
      .from('games')
      .update(patch)
      .eq('id', gameId)
      .select()
      .single();

    if (updateError) throw updateError;

    const bothReady =
      (updated?.player1_ready ?? false) && (updated?.player2_ready ?? false);

    if (bothReady && updated.status === 'waiting') {
      const { data: started, error: startError } = await supabase
        .from('games')
        .update({
          status: 'playing',
          current_player: updated.current_player ?? 'red',
          // Delay turn start a bit so cinematic overlay doesn't consume clock
          turn_started_at: new Date(Date.now() + 2000).toISOString(),
        })
        .eq('id', gameId)
        .select()
        .single();

      if (startError) throw startError;
      return { data: started as OnlineGame, error: null };
    }

    return { data: updated as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Failed to set ready status'),
    };
  }
}

/**
 * Join as spectator
 */
export async function joinAsSpectator(
  gameId: string,
  spectatorId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('game_spectators').insert({
      game_id: gameId,
      spectator_id: spectatorId,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error('Failed to join as spectator'),
    };
  }
}

/**
 * Leave as spectator
 */
export async function leaveAsSpectator(
  gameId: string,
  spectatorId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('game_spectators')
      .delete()
      .eq('game_id', gameId)
      .eq('spectator_id', spectatorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error('Failed to leave as spectator'),
    };
  }
}

/**
 * Make a move in an online game
 */
export async function makeOnlineMove(
  gameId: string,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  newFen: string,
  moveNotation: string,
  playerColor: 'red' | 'black'
): Promise<{ error: Error | null }> {
  try {
    // Get current game state
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('move_history, current_player')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;
    if (!game) throw new Error('Game not found');

    // Verify it's the player's turn
    if (game.current_player !== playerColor) {
      throw new Error('Not your turn');
    }

    const moveHistory = (game.move_history as string[]) || [];
    const moveNumber = moveHistory.length + 1;

    // Create move record
    const { error: moveError } = await supabase.from('game_moves').insert({
      game_id: gameId,
      move_number: moveNumber,
      from_position: `${fromRow},${fromCol}`,
      to_position: `${toRow},${toCol}`,
      player_color: playerColor,
      move_notation: moveNotation,
    });

    if (moveError) throw moveError;

    // Update game state
    const nextPlayer = playerColor === 'red' ? 'black' : 'red';
    const { error: updateError } = await supabase
      .from('games')
      .update({
        board_fen: newFen,
        current_player: nextPlayer,
        move_history: [...moveHistory, moveNotation],
        turn_started_at: new Date().toISOString(), // Start timer for next player
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateError) throw updateError;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Failed to make move'),
    };
  }
}

/**
 * Get game by ID
 */
export async function getGame(
  gameId: string
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return { data: data as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get game'),
    };
  }
}

/**
 * Resign from an online game. Sets game to finished and opponent as winner.
 */
export async function resignGame(
  gameId: string,
  resigningPlayerId: string
): Promise<{ error: Error | null }> {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, status, player1_id, player2_id')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;
    if (!game) throw new Error('Game not found');
    if (game.status !== 'playing') {
      throw new Error('Game is not in progress');
    }

    const isPlayer1 = game.player1_id === resigningPlayerId;
    const isPlayer2 = game.player2_id === resigningPlayerId;
    if (!isPlayer1 && !isPlayer2) {
      throw new Error('You are not a player in this game');
    }

    const winnerId = isPlayer1 ? game.player2_id : game.player1_id;

    const { error: updateError } = await supabase
      .from('games')
      .update({
        status: 'finished',
        winner_id: winnerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateError) throw updateError;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Failed to resign'),
    };
  }
}

/**
 * Get game by room code
 */
export async function getGameByRoomCode(
  roomCode: string
): Promise<{ data: OnlineGame | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (error) throw error;
    return { data: data as OnlineGame, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get game'),
    };
  }
}

/**
 * Generate room code client-side (fallback)
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
