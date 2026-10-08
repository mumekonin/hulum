import { dbQuery } from "../db/rls-session.js";
import { HttpError } from "../http/errors.js";

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

export type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
};

export type AuthStore = {
  createUser(input: {
    name: string;
    email: string;
    passwordHash: string | null;
    googleSub?: string;
  }): Promise<AuthUserRow>;
  findByEmail(email: string): Promise<AuthUserRow | undefined>;
  findById(id: string): Promise<AuthUserRow | undefined>;
  findByGoogleSub(googleSub: string): Promise<AuthUserRow | undefined>;
  linkGoogleSub(userId: string, googleSub: string): Promise<void>;
  createEmptyProfile(userId: string): Promise<void>;
};

const USER_COLUMNS = "id, name, email, password_hash, google_sub";

export function createPgAuthStore(): AuthStore {
  return {
    async createUser(input): Promise<AuthUserRow> {
      try {
        const result = await dbQuery<AuthUserRow>(
          `insert into users (name, email, password_hash, google_sub)
           values ($1, $2, $3, $4)
           returning ${USER_COLUMNS}`,
          [input.name, input.email, input.passwordHash, input.googleSub ?? null],
        );
        const row = result.rows[0];
        if (row === undefined) {
          throw new Error("Failed to persist user");
        }
        return row;
      } catch (error) {
        if (isPgError(error) && error.code === "23505") {
          throw new HttpError(409, "CONFLICT", "An account with this email already exists. Sign in instead.");
        }
        throw error;
      }
    },

    async findByEmail(email: string): Promise<AuthUserRow | undefined> {
      const result = await dbQuery<AuthUserRow>(
        `select ${USER_COLUMNS} from users where lower(email) = lower($1)`,
        [email],
      );
      return result.rows[0];
    },

    async findById(id: string): Promise<AuthUserRow | undefined> {
      const result = await dbQuery<AuthUserRow>(
        `select ${USER_COLUMNS} from users where id = $1`,
        [id],
      );
      return result.rows[0];
    },

    async findByGoogleSub(googleSub: string): Promise<AuthUserRow | undefined> {
      const result = await dbQuery<AuthUserRow>(
        `select ${USER_COLUMNS} from users where google_sub = $1`,
        [googleSub],
      );
      return result.rows[0];
    },

    async linkGoogleSub(userId: string, googleSub: string): Promise<void> {
      try {
        await dbQuery(`update users set google_sub = $2 where id = $1`, [userId, googleSub]);
      } catch (error) {
        if (isPgError(error) && error.code === "23505") {
          throw new HttpError(409, "CONFLICT", "This Google account is already linked to another user.");
        }
        throw error;
      }
    },

    async createEmptyProfile(userId: string): Promise<void> {
      await dbQuery(
        // Unknown facts stay null so matching treats them as UNCERTAIN, never guessed.
        `insert into profiles (user_id, education_level, country, languages, skills, interests)
         values ($1, null, null, '{}', '{}', '{}')
         on conflict (user_id) do nothing`,
        [userId],
      );
    },
  };
}
