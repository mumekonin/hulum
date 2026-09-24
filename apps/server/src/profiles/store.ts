import type { PatchProfileRequest, Profile, ProfileWrite } from "@hulum/shared";
import { getPool } from "../db/pool.js";
import { HttpError } from "../http/errors.js";
import { mapProfileRow, type ProfileRow, type UserRow } from "./mapper.js";

export type StoredProfile = {
  name: string;
  email: string;
  profile: Profile;
};

export type ProfileStore = {
  create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<StoredProfile>;
  getByUserId(userId: string): Promise<StoredProfile | undefined>;
  getByEmail(email: string): Promise<StoredProfile | undefined>;
  update(userId: string, patch: PatchProfileRequest): Promise<StoredProfile | undefined>;
};

const PROFILE_COLUMNS = `
  p.id, p.user_id, p.education_level, p.field_of_study, p.graduation_year,
  p.country, p.city, p.languages, p.skills, p.experience, p.interests,
  p.created_at, p.updated_at, u.name, u.email
`;

type JoinedRow = ProfileRow & UserRow;

function toStored(row: JoinedRow): StoredProfile {
  return {
    name: row.name,
    email: row.email,
    profile: mapProfileRow(row),
  };
}

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

export function createPgProfileStore(): ProfileStore {
  async function getByUserId(userId: string): Promise<StoredProfile | undefined> {
    const result = await getPool().query<JoinedRow>(
      `select ${PROFILE_COLUMNS}
       from profiles p
       join users u on u.id = p.user_id
       where p.user_id = $1`,
      [userId],
    );
    const row = result.rows[0];
    if (row === undefined) {
      return undefined;
    }
    return toStored(row);
  }

  return {
    async create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<StoredProfile> {
      const client = await getPool().connect();
      try {
        await client.query("begin");
        const user =
          input.userId === undefined
            ? await client.query<UserRow>(
                "insert into users (name, email) values ($1, $2) returning id, name, email",
                [input.name, input.email],
              )
            : await client.query<UserRow>(
                "insert into users (id, name, email) values ($1, $2, $3) returning id, name, email",
                [input.userId, input.name, input.email],
              );
        const userId = user.rows[0]?.id;
        if (userId === undefined) {
          throw new Error("Failed to persist user");
        }
        const profile = await client.query<ProfileRow>(
          `insert into profiles (
             user_id, education_level, field_of_study, graduation_year, country, city,
             languages, skills, experience, interests
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           returning id, user_id, education_level, field_of_study, graduation_year,
                     country, city, languages, skills, experience, interests, created_at, updated_at`,
          [
            userId,
            input.educationLevel,
            input.fieldOfStudy,
            input.graduationYear,
            input.country,
            input.city,
            input.languages,
            input.skills,
            input.experience,
            input.interests,
          ],
        );
        const profileRow = profile.rows[0];
        const userRow = user.rows[0];
        if (profileRow === undefined || userRow === undefined) {
          throw new Error("Failed to persist profile");
        }
        await client.query("commit");
        return { name: userRow.name, email: userRow.email, profile: mapProfileRow(profileRow) };
      } catch (error) {
        await client.query("rollback");
        if (isPgError(error) && error.code === "23505") {
          throw new HttpError(409, "CONFLICT", "A user with this email or id already exists.");
        }
        throw error;
      } finally {
        client.release();
      }
    },

    async getByUserId(userId: string): Promise<StoredProfile | undefined> {
      return getByUserId(userId);
    },

    async getByEmail(email: string): Promise<StoredProfile | undefined> {
      const result = await getPool().query<JoinedRow>(
        `select ${PROFILE_COLUMNS}
         from profiles p
         join users u on u.id = p.user_id
         where lower(u.email) = lower($1)`,
        [email.trim()],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      return toStored(row);
    },

    async update(userId: string, patch: PatchProfileRequest): Promise<StoredProfile | undefined> {
      const assignments: string[] = [];
      const values: unknown[] = [];
      let index = 1;

      const add = (column: string, value: unknown): void => {
        assignments.push(`${column} = $${String(index)}`);
        values.push(value);
        index += 1;
      };

      if (patch.educationLevel !== undefined) add("education_level", patch.educationLevel);
      if (patch.fieldOfStudy !== undefined) add("field_of_study", patch.fieldOfStudy);
      if (patch.graduationYear !== undefined) add("graduation_year", patch.graduationYear);
      if (patch.country !== undefined) add("country", patch.country);
      if (patch.city !== undefined) add("city", patch.city);
      if (patch.languages !== undefined) add("languages", patch.languages);
      if (patch.skills !== undefined) add("skills", patch.skills);
      if (patch.experience !== undefined) add("experience", patch.experience);
      if (patch.interests !== undefined) add("interests", patch.interests);

      values.push(userId);
      const result = await getPool().query<ProfileRow>(
        `update profiles set ${assignments.join(", ")}
         where user_id = $${String(index)}
         returning id, user_id, education_level, field_of_study, graduation_year,
                   country, city, languages, skills, experience, interests, created_at, updated_at`,
        values,
      );
      if (result.rows[0] === undefined) {
        return undefined;
      }
      return getByUserId(userId);
    },
  };
}
