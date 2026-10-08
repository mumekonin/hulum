import { dbQuery } from "../db/rls-session.js";

export type ResetTokenRow = {
  user_id: string;
  expires_at: Date;
  used_at: Date | null;
};

export type PasswordResetStore = {
  /** Invalidates the user's outstanding links so only the newest email works. */
  replaceToken(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findToken(tokenHash: string): Promise<ResetTokenRow | undefined>;
  /** Marks the token used and sets the new hash in one statement; false if the token was already used or expired. */
  consumeTokenAndSetPassword(input: {
    tokenHash: string;
    passwordHash: string;
    now: Date;
  }): Promise<boolean>;
};

export function createPgPasswordResetStore(): PasswordResetStore {
  return {
    async replaceToken(input): Promise<void> {
      await dbQuery(
        `with invalidated as (
           update password_reset_tokens set used_at = now()
           where user_id = $1 and used_at is null
         )
         insert into password_reset_tokens (user_id, token_hash, expires_at)
         values ($1, $2, $3)`,
        [input.userId, input.tokenHash, input.expiresAt],
      );
    },

    async findToken(tokenHash): Promise<ResetTokenRow | undefined> {
      const result = await dbQuery<ResetTokenRow>(
        `select user_id, expires_at, used_at from password_reset_tokens where token_hash = $1`,
        [tokenHash],
      );
      return result.rows[0];
    },

    async consumeTokenAndSetPassword(input): Promise<boolean> {
      const result = await dbQuery<{ id: string }>(
        `with consumed as (
           update password_reset_tokens set used_at = $3
           where token_hash = $1 and used_at is null and expires_at > $3
           returning user_id
         ),
         siblings as (
           update password_reset_tokens set used_at = $3
           where user_id = (select user_id from consumed) and used_at is null and token_hash <> $1
         )
         update users set password_hash = $2
         where id = (select user_id from consumed)
         returning id`,
        [input.tokenHash, input.passwordHash, input.now],
      );
      return result.rows.length === 1;
    },
  };
}
